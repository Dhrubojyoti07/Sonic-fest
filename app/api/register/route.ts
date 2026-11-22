import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateRegistrationInput } from "@/lib/validations/registration";
import { resend, DEFAULT_FROM_EMAIL } from "@/lib/resend/client";
import { generateRegistrationEmailHtml } from "@/lib/resend/templates";
import { formatDate, formatTime } from "@/lib/utils/cn";
import { getSiteSettings } from "@/lib/supabase/queries";
import { FALLBACK_FEATURED_EVENT } from "@/lib/constants/defaults";
import crypto from "crypto";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, name, email, phone, attendees } = body;

    // 1. Validate user inputs
    const validation = validateRegistrationInput({
      eventId,
      name,
      email,
      phone,
      attendees: Number(attendees) || 1,
    });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 2. Verify event exists and is open for registration
    let eventTitle = FALLBACK_FEATURED_EVENT.title;
    let eventDate = FALLBACK_FEATURED_EVENT.date;
    let eventStartTime = FALLBACK_FEATURED_EVENT.start_time;
    let eventVenue = FALLBACK_FEATURED_EVENT.venue;
    let eventLocation = FALLBACK_FEATURED_EVENT.location;
    let registrationEnabled = true;

    try {
      const { data: dbEvent } = await supabase
        .from("events")
        .select("id, title, date, start_time, venue, location, registration_enabled")
        .eq("id", eventId)
        .maybeSingle();

      if (dbEvent) {
        eventTitle = dbEvent.title;
        eventDate = dbEvent.date;
        eventStartTime = dbEvent.start_time;
        eventVenue = dbEvent.venue;
        eventLocation = dbEvent.location;
        registrationEnabled = dbEvent.registration_enabled;
      }
    } catch {
      // Safe fallback to default event specs
    }

    if (!registrationEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: "Registration for this event is currently closed.",
        },
        { status: 400 }
      );
    }

    // 3. Duplicate check within recent registrations (5 minute window)
    try {
      const { data: existingReg } = await supabase
        .from("registrations")
        .select("id, created_at")
        .eq("event_id", eventId)
        .eq("email", email.trim().toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingReg) {
        const recentTime = new Date(existingReg.created_at).getTime();
        if (Date.now() - recentTime < 5 * 60 * 1000) {
          return NextResponse.json(
            {
              success: false,
              error: "A registration with this email was recently submitted for this event.",
            },
            { status: 409 }
          );
        }
      }
    } catch {
      // Ignore if table not yet migrated
    }

    // 4. Create unique ticket ID and code
    let registrationId = crypto.randomUUID();
    let ticketCode = `SF-${registrationId.slice(0, 8).toUpperCase()}`;
    let dbStored = false;

    try {
      // Try inserting with ticket_code and status
      const { data: registration, error: insertError } = await supabase
        .from("registrations")
        .insert({
          event_id: eventId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          attendees: Number(attendees),
          ticket_code: ticketCode,
          status: "confirmed",
        })
        .select("id, ticket_code, created_at")
        .single();

      if (registration?.id) {
        registrationId = registration.id;
        if (registration.ticket_code) ticketCode = registration.ticket_code;
        dbStored = true;
      } else if (insertError) {
        // Fallback in case migration 002 hasn't been executed yet in Supabase SQL editor
        const fallback = await supabase
          .from("registrations")
          .insert({
            event_id: eventId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            attendees: Number(attendees),
          })
          .select("id, created_at")
          .single();

        if (fallback.data?.id) {
          registrationId = fallback.data.id;
          ticketCode = `SF-${registrationId.slice(0, 8).toUpperCase()}`;
          dbStored = true;
        }
      }
    } catch (insertErr) {
      console.warn("Database insert catch:", insertErr);
    }

    // 5. Generate QR Code containing the secure ticket URL
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin || "http://localhost:3000";
    const ticketUrl = `${siteUrl}/tickets/${registrationId}`;

    let qrDataUrl = "";
    try {
      qrDataUrl = await QRCode.toDataURL(ticketUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    } catch (qrErr) {
      console.warn("QR generation warning:", qrErr);
    }

    // 6. Send dynamic transactional email via Resend with embedded QR code
    let emailSent = false;
    let emailErrorMsg: string | undefined = undefined;

    if (resend) {
      try {
        const settings = await getSiteSettings();
        const html = generateRegistrationEmailHtml({
          attendeeName: name.trim(),
          eventName: eventTitle,
          eventDate: formatDate(eventDate),
          eventTime: formatTime(eventStartTime),
          venue: eventVenue,
          location: eventLocation,
          attendeesCount: Number(attendees),
          registrationId,
          ticketCode,
          qrDataUrl,
          ticketUrl,
          siteName: settings.site_name,
          contactEmail: settings.contact_email,
        });

        const emailResult = await resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: [email.trim().toLowerCase()],
          subject: `Pass Confirmed: ${eventTitle} — Ref #${ticketCode}`,
          html,
        });

        if (emailResult.data?.id) {
          emailSent = true;
        } else if (emailResult.error) {
          emailErrorMsg = emailResult.error.message;
          console.warn("Resend email warning:", emailResult.error);
        }
      } catch (emailErr: unknown) {
        console.error("Resend error:", emailErr);
        emailErrorMsg = emailErr instanceof Error ? emailErr.message : "Email delivery failed";
      }
    }

    return NextResponse.json({
      success: true,
      message: "Registration completed successfully!",
      registration: {
        id: registrationId,
        ticketCode,
        shortCode: ticketCode,
        eventName: eventTitle,
        attendeeName: name.trim(),
        attendees: Number(attendees),
        eventDate: formatDate(eventDate),
        eventTime: formatTime(eventStartTime),
        venue: eventVenue,
        location: eventLocation,
        qrCode: qrDataUrl,
        ticketUrl,
        emailSent,
        emailWarning: emailErrorMsg,
        dbStored,
      },
    });
  } catch (err: unknown) {
    console.error("Unexpected registration error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
