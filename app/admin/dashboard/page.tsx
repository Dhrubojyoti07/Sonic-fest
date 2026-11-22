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
  TrendingUp,
  Sparkles,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils/cn";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    eventsCount: 3,
    artistsCount: 6,
    registrationsCount: 0,
    attendeesCount: 0,
    galleryCount: 6,
  });

  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch counts from Supabase
        const [eventsRes, artistsRes, regsRes, galleryRes] = await Promise.all([
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("artists").select("id", { count: "exact", head: true }),
          supabase.from("registrations").select("id, name, email, phone, attendees, created_at, events(title)", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
          supabase.from("gallery").select("id", { count: "exact", head: true }),
        ]);

        const regsData = regsRes.data || [];
        const totalAttendees = regsData.reduce(
          (acc, item) => acc + (Number(item.attendees) || 1),
          0
        );

        setStats({
          eventsCount: eventsRes.count ?? 3,
          artistsCount: artistsRes.count ?? 6,
          registrationsCount: regsRes.count ?? regsData.length,
          attendeesCount: totalAttendees || regsData.length,
          galleryCount: galleryRes.count ?? 6,
        });

        setRecentRegistrations(regsData);
      } catch (err) {
        console.warn("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Command Dashboard"
        subtitle="Real-time festival operations, artist line-ups, and pass registrations."
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Registrations */}
          <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 relative overflow-hidden">
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
              <span className="text-emerald-400 font-semibold">{stats.attendeesCount} passes</span>
              <span>issued to guests</span>
            </div>
          </div>

          {/* Events */}
          <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 relative overflow-hidden">
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
              Published & Open on website
            </div>
          </div>

          {/* Artists */}
          <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 relative overflow-hidden">
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

          {/* Gallery Media */}
          <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Gallery Moments
              </span>
              <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-white tracking-tight">
              {stats.galleryCount}
            </div>
            <div className="mt-2 text-xs text-foreground-muted">
              Atmosphere Photos Hosted
            </div>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="p-6 rounded-3xl bg-surface-subtle border border-white/10 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Quick Operations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/events?action=new">
              <div className="p-4 rounded-xl bg-surface-elevated/70 border border-white/5 hover:border-primary/50 transition-all flex items-center justify-between group">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-primary">
                  + Create Event
                </span>
                <Plus className="w-4 h-4 text-primary" />
              </div>
            </Link>

            <Link href="/admin/artists?action=new">
              <div className="p-4 rounded-xl bg-surface-elevated/70 border border-white/5 hover:border-accent-purple/50 transition-all flex items-center justify-between group">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-accent-purple">
                  + Add Artist
                </span>
                <Plus className="w-4 h-4 text-accent-purple" />
              </div>
            </Link>

            <Link href="/admin/registrations">
              <div className="p-4 rounded-xl bg-surface-elevated/70 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white">
                  View Registrations
                </span>
                <ArrowRight className="w-4 h-4 text-white/50" />
              </div>
            </Link>

            <Link href="/admin/settings">
              <div className="p-4 rounded-xl bg-surface-elevated/70 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white">
                  Edit Site Settings
                </span>
                <ArrowRight className="w-4 h-4 text-white/50" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="p-6 rounded-3xl bg-surface-subtle border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                Recent Guest Registrations
              </h3>
              <p className="text-xs text-foreground-muted">
                Latest attendee passes submitted from the public portal.
              </p>
            </div>
            <Link href="/admin/registrations">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Passes</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-foreground-muted">
                      No registrations recorded yet. When visitors book passes, they will appear here in real-time.
                    </td>
                  </tr>
                ) : (
                  recentRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/5 transition-colors">
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
                      <td className="py-3.5 px-4 text-foreground-muted">
                        {formatDate(reg.created_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="success">Confirmed</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
