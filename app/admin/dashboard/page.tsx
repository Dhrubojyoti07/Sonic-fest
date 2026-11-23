"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  Mic2,
  Users,
  Image as ImageIcon,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  UserCheck,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils/cn";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    eventsCount: 3,
    artistsCount: 6,
    registrationsCount: 0,
    attendeesCount: 0,
    checkedInCount: 0,
    checkedInPasses: 0,
    galleryCount: 6,
  });

  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch unified registrations from /api/admin/registrations (ensures live check-in sync)
        const [apiRes, eventsRes, artistsRes, galleryRes] = await Promise.all([
          fetch("/api/admin/registrations"),
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("artists").select("id", { count: "exact", head: true }),
          supabase.from("gallery").select("id", { count: "exact", head: true }),
        ]);

        const apiData = await apiRes.json();
        let regsData: any[] = [];
        let totalCount = 0;
        let totalPasses = 0;
        let checkedIn = 0;
        let checkedInPasses = 0;

        if (apiRes.ok && apiData.success && Array.isArray(apiData.registrations)) {
          regsData = apiData.registrations;
          totalCount = apiData.stats?.totalRegistrations ?? regsData.length;
          totalPasses = apiData.stats?.totalPasses ?? regsData.reduce((acc: number, r: any) => acc + (Number(r.attendees) || 1), 0);
          checkedIn = apiData.stats?.checkedInCount ?? regsData.filter((r: any) => r.status === "checked_in" || !!r.checked_in_at).length;
          checkedInPasses = apiData.stats?.checkedInPasses ?? regsData.filter((r: any) => r.status === "checked_in" || !!r.checked_in_at).reduce((acc: number, r: any) => acc + (Number(r.attendees) || 1), 0);
        } else {
          // Fallback to client query if endpoint is unavailable
          const { data: dbRegs } = await supabase
            .from("registrations")
            .select("*, events(title)")
            .order("created_at", { ascending: false })
            .limit(10);
          if (dbRegs) {
            regsData = dbRegs;
            totalCount = dbRegs.length;
            totalPasses = dbRegs.reduce((acc, item) => acc + (Number(item.attendees) || 1), 0);
          }
        }

        setStats({
          eventsCount: eventsRes.count ?? 3,
          artistsCount: artistsRes.count ?? 6,
          registrationsCount: totalCount,
          attendeesCount: totalPasses,
          checkedInCount: checkedIn,
          checkedInPasses: checkedInPasses,
          galleryCount: galleryRes.count ?? 6,
        });

        setRecentRegistrations(regsData.slice(0, 6));
      } catch (err) {
        console.warn("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Command Dashboard"
        subtitle="Real-time festival operations, turnstile gate check-ins, and credential management."
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Registrations */}
          <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Total Registrations
              </span>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.registrationsCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground-muted">
              <span className="text-primary font-semibold">{stats.attendeesCount} total passes</span>
              <span>issued to guests</span>
            </div>
          </div>

          {/* Turnstile Admissions / Checked In */}
          <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Gate Checked In
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              {stats.checkedInCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-foreground-muted">
              <span className="text-emerald-400 font-bold">{stats.checkedInPasses} wristbands</span>
              <span>admitted at turnstiles</span>
            </div>
          </div>

          {/* Events */}
          <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-purple">
                Active Events
              </span>
              <div className="p-2 rounded-xl bg-accent-purple/10 text-accent-purple">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.eventsCount}
            </div>
            <div className="mt-2 text-xs text-foreground-muted">
              Published & Open on portal
            </div>
          </div>

          {/* Artists */}
          <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
                Festival Artists
              </span>
              <div className="p-2 rounded-xl bg-accent-cyan/10 text-accent-cyan">
                <Mic2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.artistsCount}
            </div>
            <div className="mt-2 text-xs text-foreground-muted">
              Headliners & Stage Acts
            </div>
          </div>
        </div>

        {/* Quick Operations */}
        <div className="p-6 rounded-3xl bg-surface-subtle border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Quick Gate & Festival Controls
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/scanner">
              <div className="p-4 rounded-xl bg-surface-elevated/70 border border-primary/30 hover:border-primary transition-all flex items-center justify-between group">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                    Turnstile Scanner
                  </span>
                  <span className="text-[11px] text-foreground-muted">Optical QR scan & verify</span>
                </div>
                <QrCode className="w-4 h-4 text-primary" />
              </div>
            </Link>

            <Link href="/admin/registrations">
              <div className="p-4 rounded-xl bg-surface-elevated/70 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white block">
                    Guest Registrations
                  </span>
                  <span className="text-[11px] text-foreground-muted">Check-in attendee roster</span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/50" />
              </div>
            </Link>

            <Link href="/admin/events?action=new">
              <div className="p-4 rounded-xl bg-surface-elevated/70 border border-white/5 hover:border-accent-purple/50 transition-all flex items-center justify-between group">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-accent-purple">
                  + Create Event
                </span>
                <Plus className="w-4 h-4 text-accent-purple" />
              </div>
            </Link>

            <Link href="/admin/settings">
              <div className="p-4 rounded-xl bg-surface-elevated/70 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white">
                  Site Settings
                </span>
                <ArrowRight className="w-4 h-4 text-white/50" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Registrations Table with Live Status */}
        <div className="p-6 rounded-3xl bg-surface-subtle border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                Recent Guest Registrations & Gate Status
              </h3>
              <p className="text-xs text-foreground-muted">
                Live attendee check-in statuses updated automatically from turnstile scanner.
              </p>
            </div>
            <Link href="/admin/registrations">
              <Button variant="outline" size="sm">
                View Full Roster
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  <th className="py-3 px-4">Ticket Code</th>
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Passes</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-foreground-muted">
                      No registrations recorded yet. When visitors book passes or when demo credentials are used, they appear here.
                    </td>
                  </tr>
                ) : (
                  recentRegistrations.map((reg) => {
                    const ticketCode =
                      reg.ticket_code || `SF-${reg.id.slice(0, 8).toUpperCase()}`;
                    const isCheckedIn =
                      reg.status === "checked_in" || !!reg.checked_in_at;

                    return (
                      <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/tickets/${reg.id}`}
                            target="_blank"
                            className="font-mono font-bold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span>{ticketCode}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {reg.name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {reg.events?.title || "Festival Pass"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {reg.email}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          {reg.attendees}
                        </td>
                        <td className="py-3.5 px-4">
                          {isCheckedIn ? (
                            <Badge variant="warning" className="text-[10px] uppercase font-black">
                              Checked In
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px] uppercase font-black">
                              Confirmed
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
