import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkInService } from "@/lib/services/checkInService";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const searchParams = req.nextUrl.searchParams;
    const requestedEmail = searchParams.get("email")?.trim().toLowerCase();
    const requestedIds =
      searchParams
        .get("ids")
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];
    const requestedCode = searchParams.get("code")?.trim();

    // Check if user is logged in
    let userEmail: string | null = null;
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        userEmail = data.user.email.toLowerCase();
      }
    } catch {
      // unauthenticated
    }

    const targetEmail = requestedEmail || userEmail;
    const registrationsMap = new Map<string, any>();

    // 1. Fetch by Email
    if (targetEmail) {
      try {
        const { data, error } = await supabase
          .from("registrations")
          .select("*, events(*)")
          .eq("email", targetEmail)
          .order("created_at", { ascending: false });

        if (!error && data) {
          data.forEach((r) => registrationsMap.set(r.id, r));
        }
      } catch {
        // Safe catch
      }
    }

    // 2. Fetch by single Ticket Code / UUID
    if (requestedCode) {
      try {
        const { data: byId } = await supabase
          .from("registrations")
          .select("*, events(*)")
          .eq("id", requestedCode)
          .maybeSingle();

        if (byId) {
          registrationsMap.set(byId.id, byId);
        } else {
          try {
            const { data: byCode } = await supabase
              .from("registrations")
              .select("*, events(*)")
              .eq("ticket_code", requestedCode)
              .maybeSingle();
            if (byCode) registrationsMap.set(byCode.id, byCode);
          } catch {
            // column ticket_code not migrated yet
          }
        }
      } catch {
        // Safe catch
      }
    }

    // 3. Fetch by list of recent IDs (from localStorage cache)
    if (requestedIds.length > 0) {
      for (const id of requestedIds.slice(0, 10)) {
        if (!registrationsMap.has(id)) {
          try {
            const { data } = await supabase
              .from("registrations")
              .select("*, events(*)")
              .eq("id", id)
              .maybeSingle();
            if (data) registrationsMap.set(data.id, data);
          } catch {
            // Safe catch
          }
        }
      }
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin || "http://localhost:3000";

    const registrationsList = Array.from(registrationsMap.values());

    // Generate QR codes and format output
    const passes = await Promise.all(
      registrationsList.map(async (rawReg) => {
        const reg = checkInService.enrichRegistration(rawReg);
        const ticketCode = reg.ticket_code;
        const ticketUrl = `${siteUrl}/tickets/${reg.id}`;

        let qrDataUrl = "";
        try {
          qrDataUrl = await QRCode.toDataURL(ticketUrl, {
            width: 280,
            margin: 1,
            color: { dark: "#000000", light: "#ffffff" },
          });
        } catch {
          // fallback if QR generation fails
        }

        const isCheckedIn = checkInService.isCheckedIn(reg);

        return {
          id: reg.id,
          ticketCode,
          name: reg.name,
          email: reg.email,
          phone: reg.phone,
          attendees: reg.attendees,
          status: isCheckedIn ? "checked_in" : "confirmed",
          checkedInAt: reg.checked_in_at || null,
          createdAt: reg.created_at,
          ticketUrl,
          qrDataUrl,
          event: {
            id: reg.events?.id,
            title: reg.events?.title || "Sonic Fest 2025",
            date: reg.events?.date,
            startTime: reg.events?.start_time || "18:00",
            endTime: reg.events?.end_time || "02:00",
            venue: reg.events?.venue || "NeoSphere Arena",
            location: reg.events?.location || "Mumbai",
            category: reg.events?.category || "Live Festival",
            heroImageUrl:
              reg.events?.hero_image_url ||
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      userEmail,
      passes,
    });
  } catch (err: unknown) {
    console.warn("My passes API caught:", err);
    return NextResponse.json(
      { success: false, error: "FETCH_FAILED", passes: [] },
      { status: 500 }
    );
  }
}
