import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const supabase = await createServerSupabaseClient();

  // Sign out user on server
  await supabase.auth.signOut();

  const response = NextResponse.redirect(`${origin}/admin/login`, {
    status: 302,
  });

  // Clear demo cookie if present
  response.cookies.delete("sonic_fest_admin_demo");

  return response;
}
