"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isAdminEmail } from "@/lib/utils/admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/reset-password";

  useEffect(() => {
    async function checkAuth() {
      if (isAuthPage) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }

        // Strict Check: Only dhrubojyotipatra2007@gmail.com has admin access
        if (!isAdminEmail(session.user?.email)) {
          router.replace("/");
          return;
        }
      } catch (err) {
        console.warn("Auth check warning:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Subscribe to auth state updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" && !isAuthPage) {
        router.replace("/login");
      } else if (session?.user && !isAdminEmail(session.user.email)) {
        router.replace("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, isAuthPage, router, supabase]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08070e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest text-foreground-muted">
            Verifying Admin Authorization...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08070e] flex">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Admin Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
