import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/utils/admin";
import { checkInService } from "@/lib/services/checkInService";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Verify admin access (strictly restricted to dhrubojyotipatra2007@gmail.com)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user?.email)) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED", message: "Only administrators can access registration rosters." },
        { status: 403 }
      );
    }

    // 1. Fetch real registrations from Supabase
    let dbRegistrations: any[] = [];
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*, events(id, title, date, venue, location)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        dbRegistrations = data;
      }
    } catch (err) {
      console.warn("Registrations fetch error:", err);
    }

    // 2. Enrich all registrations with live check-in state
    const allRegistrations = dbRegistrations.map((r) => checkInService.enrichRegistration(r));

    // 3. Calculate live metrics
    const totalRegistrations = allRegistrations.length;
    const totalPasses = allRegistrations.reduce(
      (sum, r) => sum + (Number(r.attendees) || 1),
      0
    );
    const checkedInRegistrations = allRegistrations.filter(
      (r) => r.status === "checked_in" || !!r.checked_in_at
    );
    const checkedInCount = checkedInRegistrations.length;
    const checkedInPasses = checkedInRegistrations.reduce(
      (sum, r) => sum + (Number(r.attendees) || 1),
      0
    );

    return NextResponse.json({
      success: true,
      registrations: allRegistrations,
      stats: {
        totalRegistrations,
        totalPasses,
        checkedInCount,
        checkedInPasses,
      },
    });
  } catch (err: unknown) {
    console.error("Admin registrations GET error:", err);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: "Failed to load registrations." },
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
        { success: false, error: "UNAUTHORIZED", message: "Only administrators can update check-in status." },
        { status: 403 }
      );
    }

    const adminIdentifier = user.email!;

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
      } catch (err) {
        // column may not exist in unmigrated database
      }

      return NextResponse.json({
        success: true,
        message: "Check-in undone. Status reset to confirmed.",
        status: "confirmed",
        checkedInAt: null,
      });
    }

    // Default action: check_in
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
    } catch (err) {
      // column may not exist in unmigrated database
    }

    return NextResponse.json({
      success: true,
      message: "Attendee successfully checked in!",
      status: "checked_in",
      checkedInAt: record.checkedInAt,
    });
  } catch (err: unknown) {
    console.error("Admin registrations POST error:", err);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR", message: "Failed to update registration status." },
      { status: 500 }
    );
  }
}
