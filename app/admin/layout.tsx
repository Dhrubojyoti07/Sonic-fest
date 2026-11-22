"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

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

        // Check if demo bypass mode is enabled
        const isDemoMode =
          typeof window !== "undefined" &&
          (localStorage.getItem("sonic_fest_admin_demo") === "true" ||
            document.cookie.includes("sonic_fest_admin_demo=true"));

        if (!session && !isDemoMode) {
          router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
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
        router.replace("/admin/login");
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
            Verifying Admin Credentials...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#08070e] text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
