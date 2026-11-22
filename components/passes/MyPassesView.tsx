"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime } from "@/lib/utils/cn";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Search,
  ExternalLink,
  Download,
  Share2,
  CheckCircle,
  AlertTriangle,
  QrCode,
  Sparkles,
  ArrowRight,
  RefreshCw,
  User,
  ShieldCheck,
} from "lucide-react";

export interface BookedPass {
  id: string;
  ticketCode: string;
  name: string;
  email: string;
  phone: string;
  attendees: number;
  status: "confirmed" | "checked_in";
  checkedInAt: string | null;
  createdAt: string;
  ticketUrl: string;
  qrDataUrl: string;
  event: {
    id?: string;
    title: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    venue: string;
    location: string;
    category: string;
    heroImageUrl: string;
  };
}

export function MyPassesView() {
  const [passes, setPasses] = useState<BookedPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "confirmed" | "checked_in">("all");
  const [selectedPass, setSelectedPass] = useState<BookedPass | null>(null);

  // Fetch passes based on auth session, localStorage, or query
  const loadPasses = async (customQuery?: string) => {
    setLoading(true);
    try {
      // 1. Read stored pass IDs from localStorage
      let localIds: string[] = [];
      try {
        const stored = localStorage.getItem("sonic_fest_my_passes");
        if (stored) {
          localIds = JSON.parse(stored);
        }
      } catch {
        // ignore storage errors
      }

      // Build API query URL
      const params = new URLSearchParams();
      if (customQuery) {
        if (customQuery.includes("@")) {
          params.set("email", customQuery.trim().toLowerCase());
        } else {
          params.set("code", customQuery.trim());
        }
      } else if (localIds.length > 0) {
        params.set("ids", localIds.join(","));
      }

      const res = await fetch(`/api/tickets/my-passes?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.passes)) {
        setPasses(data.passes);
        if (data.userEmail) {
          setUserEmail(data.userEmail);
          if (!searchQuery && !customQuery) {
            setSearchQuery(data.userEmail);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load booked passes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadPasses(searchQuery.trim());
    } else {
      loadPasses();
    }
  };

  const filteredPasses = passes.filter((pass) => {
    if (activeFilter === "confirmed") return pass.status === "confirmed";
    if (activeFilter === "checked_in") return pass.status === "checked_in";
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Attendee Vault</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            My Booked Passes
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Access, download, and present your festival entry credentials and gate QR codes.
          </p>
        </div>

        {/* Quick Refresh & Register CTA */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPasses(searchQuery)}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Link href="/register">
            <Button
              variant="primary"
              size="sm"
              rightIcon={<Sparkles className="w-3.5 h-3.5 animate-pulse" />}
            >
              Book Another Pass
            </Button>
          </Link>
        </div>
      </div>

      {/* Lookup & Filter Control Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-subtle border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search by email or ticket ID */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full max-w-lg relative">
          <Search className="w-4 h-4 text-foreground-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search passes by Email or Ticket Code (e.g. SF-A8F29C)..."
            className="w-full pl-10 pr-24 py-2.5 bg-surface-elevated border border-white/10 rounded-xl text-white placeholder-foreground-muted/60 text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-surface-elevated border border-white/10 p-1 rounded-xl w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === "all"
                ? "bg-primary text-white shadow-glow"
                : "text-foreground-muted hover:text-white"
            }`}
          >
            All Passes ({passes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("confirmed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === "confirmed"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-foreground-muted hover:text-white"
            }`}
          >
            Gate Ready ({passes.filter((p) => p.status === "confirmed").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("checked_in")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === "checked_in"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-foreground-muted hover:text-white"
            }`}
          >
            Admitted ({passes.filter((p) => p.status === "checked_in").length})
          </button>
        </div>
      </div>

      {/* Passes Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-wider text-foreground-muted font-bold">
            Synchronizing Your Digital Festival Passes...
          </p>
        </div>
      ) : filteredPasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasses.map((pass) => (
            <div
              key={pass.id}
              className="group relative rounded-3xl bg-surface-subtle border border-white/10 hover:border-primary/50 overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Top Banner Image with Gradient */}
              <div className="relative h-40 w-full overflow-hidden bg-black">
                <img
                  src={pass.event.heroImageUrl}
                  alt={pass.event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-subtle via-surface-subtle/50 to-transparent" />

                {/* Status Badges Overlay */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <Badge variant={pass.status === "confirmed" ? "success" : "warning"}>
                    {pass.status === "confirmed" ? "Gate Ready" : "Admitted"}
                  </Badge>

                  <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-mono font-black text-primary border border-white/10">
                    {pass.ticketCode}
                  </span>
                </div>

                {/* Event Category Tag */}
                <div className="absolute bottom-2 left-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary/90">
                    {pass.event.category}
                  </span>
                </div>
              </div>

              {/* Main Pass Content */}
              <div className="p-5 space-y-4 flex-1">
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-primary transition-colors line-clamp-1">
                    {pass.event.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-foreground-muted mt-1">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{pass.event.venue}, {pass.event.location}</span>
                  </div>
                </div>

                {/* Date & Time specs */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-surface-elevated/70 border border-white/5 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
                    <span className="text-white font-medium truncate">
                      {pass.event.date ? formatDate(pass.event.date) : "Official Tour Date"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-accent-purple shrink-0" />
                    <span className="text-white font-medium truncate">
                      {formatTime(pass.event.startTime || "18:00")}
                    </span>
                  </div>
                </div>

                {/* Holder & Attendees Count */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-foreground-dark font-bold">
                      Primary Holder
                    </span>
                    <div className="font-bold text-white truncate max-w-[150px]">{pass.name}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-foreground-dark font-bold">
                      Wristbands
                    </span>
                    <div className="font-black text-primary">
                      {pass.attendees} Pass{pass.attendees > 1 ? "es" : ""}
                    </div>
                  </div>
                </div>

                {/* QR Code Preview Thumbnail */}
                {pass.qrDataUrl && (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center shadow-md">
                      <img
                        src={pass.qrDataUrl}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-black text-white flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5 text-primary" />
                        <span>Gate Admission QR</span>
                      </div>
                      <p className="text-[11px] text-foreground-muted leading-tight">
                        Present this scannable QR code at the festival turnstile gate.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <Link href={`/tickets/${pass.id}`} className="w-full">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full font-bold shadow-glow"
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Digital Pass
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/tickets/${pass.id}?print=true`, "_blank")}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Print
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-3xl bg-surface-subtle border border-white/10 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-surface-elevated border border-white/10 text-foreground-dark flex items-center justify-center mx-auto">
            <Ticket className="w-10 h-10 text-primary/60" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-black uppercase text-white tracking-tight">
              No Booked Passes Found
            </h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              {searchQuery
                ? `We couldn't find any festival passes registered for "${searchQuery}". Check the email address or ticket reference and try again.`
                : "You don't have any booked festival passes linked to this session yet. Explore upcoming tour editions and secure your wristband pass today!"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href="/register">
              <Button
                variant="primary"
                size="md"
                rightIcon={<Sparkles className="w-4 h-4 animate-pulse" />}
              >
                Book Your Pass Now
              </Button>
            </Link>

            <Link href="/events">
              <Button variant="secondary" size="md">
                Browse Events Lineup
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
