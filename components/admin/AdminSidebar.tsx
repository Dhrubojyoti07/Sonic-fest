"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Calendar,
  Mic2,
  Users,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear demo flag
      localStorage.removeItem("sonic_fest_admin_demo");
      document.cookie = "sonic_fest_admin_demo=; path=/; max-age=0";

      // Call server signout route to clear server cookies
      await fetch("/api/auth/signout", { method: "POST" });
    } catch (e) {
      console.warn("Sign out err:", e);
    }
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Events", href: "/admin/events", icon: <Calendar className="w-4 h-4" /> },
    { label: "Artists Lineup", href: "/admin/artists", icon: <Mic2 className="w-4 h-4" /> },
    { label: "Registrations", href: "/admin/registrations", icon: <Users className="w-4 h-4" /> },
    { label: "Gallery", href: "/admin/gallery", icon: <ImageIcon className="w-4 h-4" /> },
    { label: "Site Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-[#0a0815] border-r border-white/10 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 group">
            <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            <div>
              <span className="text-base font-black tracking-widest text-white uppercase block leading-none">
                SONIC ADMIN
              </span>
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
                CONTROL SUITE
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin/dashboard"
                ? pathname === "/admin/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                  isActive
                    ? "bg-primary text-white shadow-glow"
                    : "text-foreground-muted hover:text-white hover:bg-white/5"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground-muted hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-accent-purple" />
            <span>Live Website</span>
          </span>
          <span className="text-[10px] text-white/40">&rarr;</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
