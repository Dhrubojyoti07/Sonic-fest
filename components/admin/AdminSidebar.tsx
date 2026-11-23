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
  QrCode,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface AdminSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobile, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    onClose?.();
    try {
      await supabase.auth.signOut();
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
    { label: "Gate QR Scanner", href: "/admin/scanner", icon: <QrCode className="w-4 h-4" /> },
    { label: "Events", href: "/admin/events", icon: <Calendar className="w-4 h-4" /> },
    { label: "Artists Lineup", href: "/admin/artists", icon: <Mic2 className="w-4 h-4" /> },
    { label: "Registrations", href: "/admin/registrations", icon: <Users className="w-4 h-4" /> },
    { label: "Gallery", href: "/admin/gallery", icon: <ImageIcon className="w-4 h-4" /> },
    { label: "Site Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={cn(
        "bg-[#0a0815] flex flex-col justify-between shrink-0",
        isMobile
          ? "w-full h-full overflow-y-auto"
          : "w-64 border-r border-white/10 min-h-screen"
      )}
    >
      <div>
        {/* Brand */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-2 group"
          >
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
          {isMobile && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
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
                onClick={onClose}
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
          onClick={onClose}
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
