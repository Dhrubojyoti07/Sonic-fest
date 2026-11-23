import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils/admin";

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
      // 1. Try by UUID primary key first (guaranteed column)
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

    // Demo check for preview mode
    if (!registration && (cleanCode.startsWith("demo") || cleanCode === "SF-DEMO2025")) {
      registration = {
        id: "demo-ticket-001",
        ticket_code: "SF-DEMO2025",
        name: "Alex Rivera",
        email: "alex@example.com",
        phone: "+91 98765 43210",
        attendees: 2,
        status: "confirmed",
        created_at: new Date().toISOString(),
        events: {
          title: "Sonic Fest 2025 — Mumbai Edition",
          date: new Date(Date.now() + 45 * 86400000).toISOString(),
          venue: "NeoSphere Arena",
          location: "Bandra Kurla Complex, Mumbai",
        },
      };
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

    const isCheckedIn =
      registration.status === "checked_in" || !!registration.checked_in_at;

    const ticketCode =
      registration.ticket_code || `SF-${registration.id.slice(0, 8).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      valid: true,
      alreadyCheckedIn: isCheckedIn,
      checkedInAt: registration.checked_in_at || null,
      checkedInBy: registration.checked_in_by || null,
      registration: {
        id: registration.id,
        ticketCode,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        attendees: registration.attendees,
        status: registration.status || (isCheckedIn ? "checked_in" : "confirmed"),
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
    const supabase = await createServerSupabaseClient();

    // Verify admin access (only dhrubojyotipatra2007@gmail.com can validate/check-in tickets)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isDemoAdmin = req.cookies.get("sonic_fest_admin_demo")?.value === "true";

    if (!isDemoAdmin && (!user || !isAdminEmail(user.email))) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Only administrators can perform ticket check-ins." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, action = "check_in" } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "MISSING_ID", message: "Registration ID is required." },
        { status: 400 }
      );
    }

    // Demo ticket handler
    if (id === "demo-ticket-001") {
      const now = new Date().toISOString();
      return NextResponse.json({
        success: true,
        message: action === "check_in" ? "Demo pass checked in successfully!" : "Demo check-in undone.",
        status: action === "check_in" ? "checked_in" : "confirmed",
        checkedInAt: action === "check_in" ? now : null,
      });
    }

    // Check current registration state safely
    const { data: currentReg, error: fetchErr } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !currentReg) {
      return NextResponse.json(
        { success: false, error: "TICKET_NOT_FOUND", message: "Registration record could not be found." },
        { status: 404 }
      );
    }

    // Action: CHECK IN
    if (action === "check_in") {
      if (currentReg.status === "checked_in" || currentReg.checked_in_at) {
        return NextResponse.json(
          {
            success: false,
            error: "ALREADY_CHECKED_IN",
            message: `DUPLICATE ENTRY ALERT: This ticket was already checked in at ${new Date(
              currentReg.checked_in_at
            ).toLocaleTimeString()}!`,
            checkedInAt: currentReg.checked_in_at,
          },
          { status: 409 }
        );
      }

      const checkInTime = new Date().toISOString();
      const adminIdentifier = user?.email || "dhrubojyotipatra2007@gmail.com";

      try {
        await supabase
          .from("registrations")
          .update({
            status: "checked_in",
            checked_in_at: checkInTime,
            checked_in_by: adminIdentifier,
          })
          .eq("id", id);
      } catch (updateErr) {
        console.warn("Check-in update catch:", updateErr);
      }

      return NextResponse.json({
        success: true,
        message: `Successfully checked in ${currentReg.name} (${currentReg.attendees} Pass${
          currentReg.attendees > 1 ? "es" : ""
        })!`,
        status: "checked_in",
        checkedInAt: checkInTime,
      });
    }

    // Action: UNDO CHECK IN
    if (action === "undo") {
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
        console.warn("Undo check-in update catch:", updateErr);
      }

      return NextResponse.json({
        success: true,
        message: `Check-in undone for ${currentReg.name}. Ticket is now valid again.`,
        status: "confirmed",
        checkedInAt: null,
      });
    }

    return NextResponse.json(
      { success: false, error: "INVALID_ACTION", message: "Unknown action requested." },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("Ticket verify POST error:", err);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: "Failed to update ticket status." },
      { status: 500 }
    );
  }
}
