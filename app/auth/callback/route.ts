import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/utils/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      // Detect email and direct to respective dashboard
      let targetPath = next.startsWith("/") ? next : `/${next}`;
      if (isAdminEmail(user?.email)) {
        targetPath = "/admin/dashboard";
      } else if (targetPath.startsWith("/admin")) {
        // Disallow non-admin emails from reaching admin paths
        targetPath = "/";
      }

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${targetPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${targetPath}`);
      } else {
        return NextResponse.redirect(`${origin}${targetPath}`);
      }
    }
  }

  // Return the user to login with informative query
  return NextResponse.redirect(`${origin}/login?error=verification_failed`);
}
