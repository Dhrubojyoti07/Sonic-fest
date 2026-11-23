"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, User, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const [adminEmail, setAdminEmail] = useState<string>("dhrubojyotipatra2007@gmail.com");
  const [adminName, setAdminName] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          if (user.email) setAdminEmail(user.email);
          if (user.user_metadata?.full_name) {
            setAdminName(user.user_metadata.full_name);
          }
        }
      } catch {
        // Safe fallback
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (session.user.email) setAdminEmail(session.user.email);
        if (session.user.user_metadata?.full_name) {
          setAdminName(session.user.user_metadata.full_name);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="min-h-[4rem] py-3 sm:py-0 border-b border-white/10 bg-[#0c0a1a]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-sm sm:text-base lg:text-lg font-black uppercase tracking-wider text-white truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-foreground-muted line-clamp-1 sm:line-clamp-none">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-foreground-muted hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3 text-primary" />
          <span>View Site</span>
        </Link>

        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {adminName ? adminName.charAt(0) : <User className="w-4 h-4" />}
          </div>
          <div className="hidden md:flex flex-col text-left leading-tight">
            {adminName && (
              <span className="text-xs font-bold text-white">
                {adminName}
              </span>
            )}
            <span className="text-[11px] text-foreground-muted truncate max-w-[180px]">
              {adminEmail}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
