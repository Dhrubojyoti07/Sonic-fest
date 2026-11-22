import React from "react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import QRCode from "qrcode";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2,
  Sparkles,
  ShieldCheck,
  QrCode,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Official Digital Ticket Pass — SONIC FEST",
  description: "Present this digital pass and QR code at the festival gate for fast-track entry.",
};

interface TicketPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketPassPage({ params }: TicketPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Look up registration by id (UUID) or ticket_code
  let registration: any = null;
  try {
    const { data } = await supabase
      .from("registrations")
      .select("*, events(*)")
      .or(`id.eq.${id},ticket_code.eq.${id}`)
      .maybeSingle();

    registration = data;
  } catch (err) {
    console.warn("Ticket fetch warning:", err);
  }

  // Fallback demo ticket if id is a preview reference
  if (!registration) {
    if (id.startsWith("demo") || id.startsWith("SF-")) {
      registration = {
        id: "demo-ticket-001",
        ticket_code: "SF-DEMO2025",
        name: "Alex Rivera",
        email: "alex@example.com",
        phone: "+91 98765 43210",
        attendees: 2,
        status: "confirmed",
        created_at: new Date().toISOString(),
        events: {
          title: "Sonic Fest 2025 — Mumbai Edition",
          date: new Date(Date.now() + 45 * 86400000).toISOString(),
          start_time: "17:00",
          venue: "NeoSphere Arena",
          location: "Bandra Kurla Complex, Mumbai",
        },
      };
    } else {
      notFound();
    }
  }

  const event = registration.events || {
    title: "Sonic Fest 2025",
    date: new Date().toISOString(),
    start_time: "18:00",
    venue: "Main Stage Arena",
    location: "Festival Grounds",
  };

  const ticketCode =
    registration.ticket_code || `SF-${registration.id.slice(0, 8).toUpperCase()}`;

  const isCheckedIn =
    registration.status === "checked_in" || !!registration.checked_in_at;

  // Generate QR code for gate scanning
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const verifyUrl = `${siteUrl}/tickets/${registration.id}`;

  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
  } catch {
    // fallback
  }

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#08070e] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        {/* Navigation Return */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Festival
          </Link>
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary">
            Official Pass Verified
          </span>
        </div>

        {/* Digital Festival Pass Card */}
        <div className="rounded-3xl bg-surface-subtle/90 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden relative">
          {/* Holographic Header Bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-accent-purple to-accent-cyan" />

          {/* Pass Header */}
          <div className="p-6 sm:p-8 border-b border-white/10 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-extrabold uppercase tracking-widest mb-2 shadow-glow">
                <Sparkles className="w-3 h-3" /> All-Access Wristband Voucher
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                {event.title}
              </h1>
            </div>

            {/* Live Check-In Status Badge */}
            {isCheckedIn ? (
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5" /> Checked In
                </span>
                {registration.checked_in_at && (
                  <span className="text-[10px] text-foreground-dark mt-1">
                    {new Date(registration.checked_in_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Valid Ticket
              </span>
            )}
          </div>

          {/* Center QR Code Showcase */}
          <div className="p-6 sm:p-8 text-center bg-black/40 border-b border-white/10 relative">
            <div className="inline-block p-4 rounded-3xl bg-white shadow-2xl relative group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Entry QR Code"
                  className="w-52 h-52 sm:w-60 sm:h-60 object-contain mx-auto"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center bg-gray-100 text-gray-400">
                  <QrCode className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Ticket Code */}
            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted block mb-1">
                Gate Entry Code
              </span>
              <span className="font-mono text-2xl font-black tracking-widest text-primary px-4 py-1.5 rounded-xl bg-primary/10 border border-primary/30 inline-block shadow-glow">
                {ticketCode}
              </span>
            </div>
            <p className="mt-2 text-xs text-foreground-dark font-medium">
              Scan this code at the turnstiles for RFID wristband collection.
            </p>
          </div>

          {/* Event & Attendee Specs */}
          <div className="p-6 sm:p-8 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/10">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-muted block">
                    Date
                  </span>
                  <span className="font-semibold text-white">
                    {formatDate(event.date)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-muted block">
                    Gates Open
                  </span>
                  <span className="font-semibold text-white">
                    {formatTime(event.start_time) || "17:00 PM"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pb-4 border-b border-white/10">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-muted block">
                  Venue & Location
                </span>
                <span className="font-semibold text-white block">
                  {event.venue}
                </span>
                <span className="text-foreground-muted text-[11px]">
                  {event.location}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-muted block">
                    Pass Holder
                  </span>
                  <span className="font-semibold text-white truncate max-w-[130px] block">
                    {registration.name}
                  </span>
                  <span className="text-foreground-dark text-[11px] truncate block max-w-[130px]">
                    {registration.email}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-muted block">
                    Pass Quantity
                  </span>
                  <span className="font-bold text-white text-sm">
                    {registration.attendees} Person{registration.attendees > 1 ? "s" : ""}
                  </span>
                  <span className="text-accent-purple font-semibold text-[11px] block">
                    VIP Wristband Tier
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="px-6 sm:px-8 py-4 bg-surface-elevated/80 border-t border-white/10 text-[11px] text-foreground-muted text-center leading-relaxed">
            Please keep this page open on your phone or take a screenshot. Photo ID matching the pass holder name is required at festival check-in.
          </div>
        </div>
      </div>
    </div>
  );
}
