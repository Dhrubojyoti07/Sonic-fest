"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate } from "@/lib/utils/cn";
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
  QrCode,
  ExternalLink,
  Undo2,
  RefreshCw,
  UserCheck,
} from "lucide-react";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "confirmed" | "checked_in">("ALL");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Fetch unified registrations from /api/admin/registrations (ensures live check-in status)
      const [apiRes, eventsRes] = await Promise.all([
        fetch("/api/admin/registrations"),
        supabase.from("events").select("id, title").order("title", { ascending: true }),
      ]);

      const apiData = await apiRes.json();
      if (apiRes.ok && apiData.success && Array.isArray(apiData.registrations)) {
        setRegistrations(apiData.registrations);
      } else {
        // Fallback to client query if needed
        const { data: dbData } = await supabase
          .from("registrations")
          .select("*, events(title, date, venue)")
          .order("created_at", { ascending: false });
        if (dbData) setRegistrations(dbData);
      }

      if (eventsRes.data) setEvents(eventsRes.data);
    } catch (err: any) {
      console.warn("Fetch registrations error:", err);
      setErrorMsg("Failed to synchronize with registrations gateway.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesEvent =
        selectedEventId === "ALL" || reg.event_id === selectedEventId;

      const isCheckedIn = reg.status === "checked_in" || !!reg.checked_in_at;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "checked_in" && isCheckedIn) ||
        (statusFilter === "confirmed" && !isCheckedIn);

      const q = searchQuery.toLowerCase().trim();
      const code = reg.ticket_code || `SF-${reg.id.slice(0, 8)}`;
      const matchesQuery =
        !q ||
        reg.name?.toLowerCase().includes(q) ||
        reg.email?.toLowerCase().includes(q) ||
        reg.phone?.toLowerCase().includes(q) ||
        reg.id?.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q) ||
        (reg.events?.title && reg.events.title.toLowerCase().includes(q));

      return matchesEvent && matchesStatus && matchesQuery;
    });
  }, [registrations, selectedEventId, statusFilter, searchQuery]);

  const totalAttendees = useMemo(() => {
    return filteredRegistrations.reduce(
      (acc, item) => acc + (Number(item.attendees) || 1),
      0
    );
  }, [filteredRegistrations]);

  const checkedInCount = useMemo(() => {
    return filteredRegistrations.filter(
      (r) => r.status === "checked_in" || !!r.checked_in_at
    ).length;
  }, [filteredRegistrations]);

  const checkedInPasses = useMemo(() => {
    return filteredRegistrations
      .filter((r) => r.status === "checked_in" || !!r.checked_in_at)
      .reduce((acc, item) => acc + (Number(item.attendees) || 1), 0);
  }, [filteredRegistrations]);

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert("No registrations to export.");
      return;
    }

    const headers = [
      "Ticket Code",
      "Attendee Name",
      "Email",
      "Phone",
      "Passes",
      "Event",
      "Status",
      "Checked In At",
      "Registered At",
    ];
    const rows = filteredRegistrations.map((r) => [
      r.ticket_code || `SF-${r.id.slice(0, 8).toUpperCase()}`,
      `"${r.name?.replace(/"/g, '""') || ""}"`,
      r.email,
      r.phone,
      r.attendees,
      `"${(r.events?.title || "Festival").replace(/"/g, '""')}"`,
      r.status === "checked_in" || r.checked_in_at ? "checked_in" : "confirmed",
      r.checked_in_at || "",
      r.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sonic-fest-registrations-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleCheckIn = async (regId: string, currentStatus: string) => {
    const isCurrentlyCheckedIn = currentStatus === "checked_in";
    const action = isCurrentlyCheckedIn ? "undo" : "check_in";
    setActionLoadingId(regId);

    try {
      // 1. Send update to API
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: regId, action }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // 2. Immediately update local state
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === regId
              ? {
                  ...r,
                  status: data.status,
                  checked_in_at: data.checkedInAt,
                }
              : r
          )
        );
      } else {
        alert(data.message || "Failed to update check-in status.");
      }
    } catch {
      alert("Error contacting ticket verification service.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the registration for "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) {
        setErrorMsg("Failed to delete registration: " + error.message);
        return;
      }
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      setErrorMsg("An unexpected error occurred while deleting.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Guest Pass Registrations"
        subtitle="Live gate credential roster, turnstile status tracking, and attendee check-ins."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
        {/* Metric Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/10 shadow-lg">
            <span className="text-xs uppercase font-bold text-primary tracking-wider">
              Total Registrations
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {filteredRegistrations.length}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/10 shadow-lg">
            <span className="text-xs uppercase font-bold text-accent-purple tracking-wider">
              Total Passes Issued
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {totalAttendees}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/10 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                Turnstile Admitted
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-3xl font-black text-emerald-400 mt-1">
              {checkedInCount}{" "}
              <span className="text-xs font-normal text-foreground-muted">
                ({checkedInPasses} wristbands)
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-subtle border border-white/10 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
                Gate Scanner
              </span>
              <p className="text-xs text-foreground-muted mt-0.5">Optical Turnstile Check</p>
            </div>
            <Link href="/admin/scanner">
              <Button variant="primary" size="sm" leftIcon={<QrCode className="w-4 h-4" />}>
                Scanner
              </Button>
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-subtle border border-white/10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by attendee name, email, phone, or ticket code (e.g. SF-A8F29C)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted text-xs sm:text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold transition-colors",
                  statusFilter === "ALL"
                    ? "bg-primary text-black"
                    : "text-foreground-muted hover:text-white"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("confirmed")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold transition-colors",
                  statusFilter === "confirmed"
                    ? "bg-emerald-500 text-black"
                    : "text-foreground-muted hover:text-emerald-400"
                )}
              >
                Gate Ready
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("checked_in")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-bold transition-colors",
                  statusFilter === "checked_in"
                    ? "bg-amber-500 text-black"
                    : "text-foreground-muted hover:text-amber-400"
                )}
              >
                Checked In
              </button>
            </div>

            {/* Event Filter */}
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-surface-elevated border border-white/10 text-white text-xs focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id} className="bg-[#0f0d1b]">
                  {e.title}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchRegistrations}
              isLoading={loading}
              title="Refresh Roster"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="rounded-3xl bg-surface-subtle border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-foreground-muted bg-white/5">
                  <th className="py-4 px-6">Ticket Code</th>
                  <th className="py-4 px-4">Attendee</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-4">Event</th>
                  <th className="py-4 px-4 text-center">Passes</th>
                  <th className="py-4 px-4">Gate Status</th>
                  <th className="py-4 px-6 text-right">Gate Turnstile Action</th>
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
                  filteredRegistrations.map((reg) => {
                    const ticketCode =
                      reg.ticket_code || `SF-${reg.id.slice(0, 8).toUpperCase()}`;
                    const isCheckedIn =
                      reg.status === "checked_in" || !!reg.checked_in_at;
                    const isUpdating = actionLoadingId === reg.id;

                    return (
                      <tr
                        key={reg.id}
                        className={cn(
                          "transition-colors",
                          isCheckedIn ? "bg-amber-500/[0.03] hover:bg-amber-500/[0.08]" : "hover:bg-white/5"
                        )}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/tickets/${reg.id}`}
                              target="_blank"
                              className="font-mono font-bold text-primary hover:underline inline-flex items-center gap-1"
                              title="View Digital Pass & QR"
                            >
                              <span>{ticketCode}</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </Link>
                          </div>
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
                        <td className="py-4 px-4">
                          {isCheckedIn ? (
                            <div className="space-y-1">
                              <Badge variant="warning" className="text-[10px] uppercase font-black">
                                Checked In
                              </Badge>
                              {reg.checked_in_at && (
                                <div className="text-[10px] text-foreground-muted">
                                  {new Date(reg.checked_in_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Badge variant="success" className="text-[10px] uppercase font-black">
                              Confirmed
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => toggleCheckIn(reg.id, isCheckedIn ? "checked_in" : "confirmed")}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5",
                              isCheckedIn
                                ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30",
                              isUpdating && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {isCheckedIn ? (
                              <>
                                <Undo2 className="w-3.5 h-3.5" />
                                <span>Undo Check-In</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Check In Pass</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(reg.id, reg.name)}
                            className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/20 transition-colors inline-block"
                            title="Delete Registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
