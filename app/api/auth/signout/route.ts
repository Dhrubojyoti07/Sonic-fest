import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return handleSignOut(request);
}

export async function GET(request: Request) {
  return handleSignOut(request);
}

async function handleSignOut(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/login";
  const supabase = await createServerSupabaseClient();

  try {
    // Sign out user on server
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Signout Supabase safe warning:", err);
  }

  const response = NextResponse.redirect(`${origin}${next}`, {
    status: 302,
  });

  return response;
}
