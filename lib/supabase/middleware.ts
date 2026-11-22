import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Never intercept API routes or internal auth callbacks in middleware
  if (pathname.startsWith("/api") || pathname.startsWith("/auth")) {
    return supabaseResponse;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    if (!supabaseUrl || !supabaseAnonKey) {
      return supabaseResponse;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }>
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          );
        },
      },
    });

    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch {
      // Safe fallback if network error or unreachable
      user = null;
    }

    const isAdminRoute = pathname.startsWith("/admin");
    const isAdminAuthRoute =
      pathname === "/admin/login" || pathname === "/admin/reset-password";
    const isCustomerAuthRoute =
      pathname === "/login" || pathname === "/signup";

    const adminDemoCookie =
      request.cookies.get("sonic_fest_admin_demo")?.value === "true";
    const customerDemoCookie =
      request.cookies.get("sonic_fest_customer_demo")?.value === "true";

    const isAuthenticated = !!user || customerDemoCookie || adminDemoCookie;
    const isAdminAuthenticated = !!user || adminDemoCookie;

    // 1. ADMIN ROUTE PROTECTION
    if (isAdminRoute) {
      if (!isAdminAuthRoute && !isAdminAuthenticated) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }

      if (isAdminAuthRoute && isAdminAuthenticated) {
        const nextParam =
          request.nextUrl.searchParams.get("next") || "/admin/dashboard";
        const url = request.nextUrl.clone();
        url.pathname = nextParam;
        url.search = "";
        return NextResponse.redirect(url);
      }

      return supabaseResponse;
    }

    // 2. COMPULSORY CUSTOMER LOGIN ROUTE PROTECTION
    // If visitor is not authenticated and trying to access any public site page (Home, Events, About, Gallery, Contact, Register)
    if (!isAuthenticated && !isCustomerAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const fullPath = pathname + request.nextUrl.search;
      if (fullPath !== "/") {
        url.searchParams.set("next", fullPath);
      }
      return NextResponse.redirect(url);
    }

    // 3. IF AUTHENTICATED AND VISITING CUSTOMER LOGIN / SIGNUP, REDIRECT TO HOME OR NEXT
    if (isAuthenticated && isCustomerAuthRoute) {
      const nextParam = request.nextUrl.searchParams.get("next") || "/";
      const url = request.nextUrl.clone();
      url.pathname = nextParam.startsWith("/") ? nextParam : "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.warn("Middleware updateSession safe caught:", error);
  }

  return supabaseResponse;
}
