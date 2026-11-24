"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { isAdminEmail } from "@/lib/utils/admin";
import { Menu, ExternalLink } from "lucide-react";

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

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

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
    <div className="min-h-screen bg-[#08070e] flex flex-col lg:flex-row">
      {/* Mobile Sticky Top App Bar (Only on mobile < lg) */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-[#0a0815]/95 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <img
              src="/images/sonic-fest-logo.jpg"
              alt="Sonic Fest"
              className="h-7 w-auto object-contain rounded"
            />
            <span className="text-xs font-black tracking-widest text-white uppercase">
              SONIC ADMIN
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-purple/10 border border-accent-purple/20 text-[11px] font-bold text-accent-purple hover:bg-accent-purple/20 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Live Site</span>
          </Link>
        </div>
      </header>

      {/* Mobile Drawer (Only on mobile < lg) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-[#0a0815] border-r border-white/10 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <AdminSidebar isMobile onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation (Only on lg+) */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* Main Admin Content */}
      <main className="flex-1 min-w-0 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
