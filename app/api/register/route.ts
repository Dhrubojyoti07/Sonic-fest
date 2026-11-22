import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { validateRegistrationInput } from "@/lib/validations/registration";
import { resend, DEFAULT_FROM_EMAIL } from "@/lib/resend/client";
import { generateRegistrationEmailHtml } from "@/lib/resend/templates";
import { formatDate, formatTime } from "@/lib/utils/cn";
import { getSiteSettings } from "@/lib/supabase/queries";

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
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, date, start_time, venue, location, registration_enabled")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError || !event) {
      return NextResponse.json(
        {
          success: false,
          error: "Selected event was not found or is unavailable.",
        },
        { status: 404 }
      );
    }

    if (!event.registration_enabled) {
      return NextResponse.json(
        {
          success: false,
          error: "Registration for this event is currently closed.",
        },
        { status: 400 }
      );
    }

    // 3. Duplicate check within recent registrations
    const { data: existingReg } = await supabase
      .from("registrations")
      .select("id, created_at")
      .eq("event_id", eventId)
      .eq("email", email.trim().toLowerCase())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingReg) {
      // If registered recently (within 5 minutes), prevent duplicate submit
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

    // 4. Insert registration into Supabase
    const { data: registration, error: insertError } = await supabase
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

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to store registration. Please try again.",
        },
        { status: 500 }
      );
    }

    // 5. Send dynamic transactional email via Resend
    let emailSent = false;
    let emailErrorMsg: string | undefined = undefined;

    if (resend) {
      try {
        const settings = await getSiteSettings();
        const html = generateRegistrationEmailHtml({
          attendeeName: name.trim(),
          eventName: event.title,
          eventDate: formatDate(event.date),
          eventTime: formatTime(event.start_time),
          venue: event.venue,
          location: event.location,
          attendeesCount: Number(attendees),
          registrationId: registration.id,
          siteName: settings.site_name,
          contactEmail: settings.contact_email,
        });

        const emailResult = await resend.emails.send({
          from: DEFAULT_FROM_EMAIL,
          to: [email.trim().toLowerCase()],
          subject: `Pass Confirmed: ${event.title} - Ref #${registration.id.slice(0, 8).toUpperCase()}`,
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
        id: registration.id,
        shortCode: `PASS-${registration.id.slice(0, 8).toUpperCase()}`,
        eventName: event.title,
        attendeeName: name.trim(),
        attendees: Number(attendees),
        emailSent,
        emailWarning: emailErrorMsg,
      },
    });
  } catch (err: unknown) {
    console.error("Unexpected registration error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected server error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
