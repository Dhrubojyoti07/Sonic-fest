import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/utils/admin";

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
      user = null;
    }

    const isAdminRoute = pathname.startsWith("/admin");
    const isCustomerAuthRoute = pathname === "/login" || pathname === "/signup";

    const customerDemoCookie =
      request.cookies.get("sonic_fest_customer_demo")?.value === "true";

    const isAuthenticated = !!user || customerDemoCookie;
    const isAuthorizedAdmin = !!user && isAdminEmail(user.email);

    // 1. ADMIN ROUTE PROTECTION
    if (isAdminRoute) {
      // Direct alias: if someone visits /admin/login, send to /login
      if (pathname === "/admin/login") {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }

      // If not logged in at all, redirect to /login
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
      }

      // If logged in but NOT the allowed admin email, strictly deny admin access
      if (!isAuthorizedAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        url.search = "";
        return NextResponse.redirect(url);
      }

      // Authorized admin user visiting an admin route
      return supabaseResponse;
    }

    // 2. COMPULSORY LOGIN ROUTE PROTECTION
    // If visitor is unauthenticated and attempting to access any customer route
    if (!isAuthenticated && !isCustomerAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      const fullPath = pathname + request.nextUrl.search;
      if (fullPath !== "/") {
        url.searchParams.set("next", fullPath);
      }
      return NextResponse.redirect(url);
    }

    // 3. IF AUTHENTICATED AND VISITING LOGIN / SIGNUP, DIRECT TO RESPECTIVE DASHBOARD
    if (isAuthenticated && isCustomerAuthRoute) {
      const url = request.nextUrl.clone();
      url.search = "";

      // If admin logs in, automatically direct them to admin dashboard
      if (isAuthorizedAdmin) {
        url.pathname = "/admin/dashboard";
      } else {
        const nextParam = request.nextUrl.searchParams.get("next") || "/";
        url.pathname = nextParam.startsWith("/") ? nextParam : "/";
      }

      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.warn("Middleware updateSession safe caught:", error);
  }

  return supabaseResponse;
}
