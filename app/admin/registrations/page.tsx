"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Registration, Event } from "@/types/database";
import { formatDate } from "@/lib/utils/cn";
import {
  Users,
  Search,
  Download,
  Filter,
  CheckCircle,
  Calendar,
  Mail,
  Phone,
  Trash2,
  AlertCircle,
} from "lucide-react";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const [regsRes, eventsRes] = await Promise.all([
        supabase
          .from("registrations")
          .select("*, events(title, date, venue)")
          .order("created_at", { ascending: false }),
        supabase.from("events").select("id, title").order("title", { ascending: true }),
      ]);

      if (regsRes.data) setRegistrations(regsRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
    } catch (err) {
      console.warn("Fetch registrations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesEvent =
        selectedEventId === "ALL" || reg.event_id === selectedEventId;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        reg.name.toLowerCase().includes(q) ||
        reg.email.toLowerCase().includes(q) ||
        reg.phone.toLowerCase().includes(q) ||
        reg.id.toLowerCase().includes(q) ||
        (reg.events?.title && reg.events.title.toLowerCase().includes(q));

      return matchesEvent && matchesQuery;
    });
  }, [registrations, selectedEventId, searchQuery]);

  const totalAttendees = useMemo(() => {
    return filteredRegistrations.reduce(
      (acc, item) => acc + (Number(item.attendees) || 1),
      0
    );
  }, [filteredRegistrations]);

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert("No registrations to export.");
      return;
    }

    const headers = ["Reference ID", "Attendee Name", "Email", "Phone", "Passes", "Event", "Registered At"];
    const rows = filteredRegistrations.map((r) => [
      `PASS-${r.id.slice(0, 8).toUpperCase()}`,
      `"${r.name.replace(/"/g, '""')}"`,
      r.email,
      r.phone,
      r.attendees,
      `"${(r.events?.title || "Festival").replace(/"/g, '""')}"`,
      r.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sonic-fest-registrations-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete registration for "${name}"?`)) return;

    try {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
      await fetchRegistrations();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete registration.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Guest Pass Registrations"
        subtitle="Manage attendee reservations, scan references, and export festival check-in rosters."
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        {/* Metric Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/10">
            <span className="text-xs uppercase font-bold text-primary tracking-wider">
              Total Registrations
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {filteredRegistrations.length}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/10">
            <span className="text-xs uppercase font-bold text-accent-purple tracking-wider">
              Total Attendees / Passes
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {totalAttendees}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                Gate Export
              </span>
              <p className="text-xs text-foreground-muted mt-0.5">Download offline CSV</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-subtle border border-white/10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by attendee name, email, phone, or pass code..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted text-xs sm:text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-foreground-muted shrink-0" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-elevated border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Events & Editions</option>
              {events.map((e) => (
                <option key={e.id} value={e.id} className="bg-[#0f0d1b]">
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="rounded-3xl bg-surface-subtle border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-foreground-muted bg-white/5">
                  <th className="py-4 px-6">Reference Code</th>
                  <th className="py-4 px-4">Attendee</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-4">Event</th>
                  <th className="py-4 px-4 text-center">Passes</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-foreground-muted">
                      No registrations match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-primary">
                        PASS-{reg.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {reg.name}
                      </td>
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="text-slate-300">{reg.email}</div>
                        <div className="text-[11px] text-foreground-muted">{reg.phone}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-200">
                        {reg.events?.title || "Official Festival Pass"}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-base text-white">
                        {reg.attendees}
                      </td>
                      <td className="py-4 px-4 text-foreground-muted whitespace-nowrap">
                        {formatDate(reg.created_at)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDelete(reg.id, reg.name)}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Delete Registration"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
