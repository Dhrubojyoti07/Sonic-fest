import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils/admin";
import { checkInService } from "@/lib/services/checkInService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = searchParams.get("query") || searchParams.get("id") || searchParams.get("code");

    if (!rawQuery) {
      return NextResponse.json(
        { success: false, error: "MISSING_QUERY", message: "Please provide a ticket ID or QR code value." },
        { status: 400 }
      );
    }

    // Extract ticket ID or code if full URL was scanned
    let cleanCode = rawQuery.trim();
    if (cleanCode.includes("/tickets/")) {
      const parts = cleanCode.split("/tickets/");
      cleanCode = parts[parts.length - 1]
        .split("?")[0]
        .split("#")[0]
        .replace(/\/+$/, "")
        .trim();
    }

    const supabase = await createServerSupabaseClient();

    // Query registration by UUID or ticket_code safely
    let registration: any = null;
    try {
      // 1. Try by UUID primary key first
      const { data: byId } = await supabase
        .from("registrations")
        .select("*, events(*)")
        .eq("id", cleanCode)
        .maybeSingle();

      if (byId) {
        registration = byId;
      } else {
        // 2. Try by ticket_code (if column exists)
        const { data: byCode } = await supabase
          .from("registrations")
          .select("*, events(*)")
          .eq("ticket_code", cleanCode)
          .maybeSingle();
        if (byCode) registration = byCode;
      }
    } catch {
      // Safe fallback
    }

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          error: "TICKET_NOT_FOUND",
          message: `No ticket found matching code "${cleanCode}". Please verify the pass reference.`,
        },
        { status: 404 }
      );
    }

    // Enrich registration with live check-in store
    registration = checkInService.enrichRegistration(registration);
    const isCheckedIn = checkInService.isCheckedIn(registration);
    const ticketCode = registration.ticket_code;

    // DUPLICATE ENTRY CHECK:
    if (isCheckedIn) {
      const timeStr = registration.checked_in_at
        ? new Date(registration.checked_in_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "an earlier time";

      return NextResponse.json({
        success: true,
        valid: true,
        alreadyCheckedIn: true,
        message: `DUPLICATE ENTRY DETECTED: This pass was already checked in at ${timeStr}. Deny admission.`,
        checkedInAt: registration.checked_in_at || null,
        checkedInBy: registration.checked_in_by || null,
        registration: {
          id: registration.id,
          ticketCode,
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          attendees: registration.attendees,
          status: "checked_in",
          createdAt: registration.created_at,
        },
        event: {
          title: registration.events?.title || "Sonic Fest 2025",
          date: registration.events?.date,
          venue: registration.events?.venue || "NeoSphere Arena",
          location: registration.events?.location || "Mumbai",
        },
      });
    }

    // TICKET IS VALID AND NOT YET CHECKED IN!
    // As requested: Automatically update status to 'checked_in' and record entry!
    const adminIdentifier = "dhrubojyotipatra2007@gmail.com";
    const checkInRecord = checkInService.recordCheckIn(
      registration.id,
      registration.ticket_code,
      adminIdentifier
    );

    // Synchronize status update to Supabase
    try {
      await supabase
        .from("registrations")
        .update({
          status: "checked_in",
          checked_in_at: checkInRecord.checkedInAt,
          checked_in_by: adminIdentifier,
        })
        .eq("id", registration.id);
    } catch (updateErr) {
      console.warn("Auto check-in database update error:", updateErr);
    }

    return NextResponse.json({
      success: true,
      valid: true,
      alreadyCheckedIn: false,
      message: `ADMISSION APPROVED: Ticket verified & checked in! Issue ${
        registration.attendees
      } wristband${registration.attendees > 1 ? "s" : ""} for ${registration.name}.`,
      checkedInAt: checkInRecord.checkedInAt,
      checkedInBy: adminIdentifier,
      registration: {
        id: registration.id,
        ticketCode,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        attendees: registration.attendees,
        status: "checked_in",
        createdAt: registration.created_at,
      },
      event: {
        title: registration.events?.title || "Sonic Fest 2025",
        date: registration.events?.date,
        venue: registration.events?.venue || "NeoSphere Arena",
        location: registration.events?.location || "Mumbai",
      },
    });
  } catch (err: unknown) {
    console.error("Ticket verify GET error:", err);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: "Failed to verify ticket." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action = "check_in" } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "MISSING_ID", message: "Registration ID is required." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user?.email)) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Only administrators can perform ticket check-ins." },
        { status: 403 }
      );
    }

    const adminIdentifier = user.email!;

    // Action: UNDO CHECK IN
    if (action === "undo") {
      checkInService.undoCheckIn(id);
      try {
        await supabase
          .from("registrations")
          .update({
            status: "confirmed",
            checked_in_at: null,
            checked_in_by: null,
          })
          .eq("id", id);
      } catch (updateErr) {
        console.warn("Undo check-in database update error:", updateErr);
      }

      return NextResponse.json({
        success: true,
        message: "Check-in undone. Pass is now valid again.",
        status: "confirmed",
        checkedInAt: null,
      });
    }

    // Action: CHECK IN
    const currentStatus = checkInService.getStatus(id);
    if (currentStatus?.status === "checked_in") {
      return NextResponse.json(
        {
          success: false,
          error: "ALREADY_CHECKED_IN",
          message: `DUPLICATE ENTRY ALERT: This ticket was already checked in at ${new Date(
            currentStatus.checkedInAt || Date.now()
          ).toLocaleTimeString()}!`,
          checkedInAt: currentStatus.checkedInAt,
        },
        { status: 409 }
      );
    }

    const record = checkInService.recordCheckIn(id, undefined, adminIdentifier);
    try {
      await supabase
        .from("registrations")
        .update({
          status: "checked_in",
          checked_in_at: record.checkedInAt,
          checked_in_by: adminIdentifier,
        })
        .eq("id", id);
    } catch (updateErr) {
      console.warn("Check-in database update error:", updateErr);
    }

    return NextResponse.json({
      success: true,
      message: "Pass checked in successfully!",
      status: "checked_in",
      checkedInAt: record.checkedInAt,
    });
  } catch (err: unknown) {
    console.error("Ticket verify POST error:", err);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: "Failed to update ticket status." },
      { status: 500 }
    );
  }
}
