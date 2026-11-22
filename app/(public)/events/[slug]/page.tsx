import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventBySlug, getAllEvents } from "@/lib/supabase/queries";
import { ArtistCard } from "@/components/artists/ArtistCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Ticket,
  ShieldCheck,
  Zap,
  Volume2,
  Users,
  ArrowLeft,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils/cn";
import { Metadata } from "next";

export interface EventDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: `${event.title} — Official Passes & Lineup`,
    description:
      event.description ||
      `Join us at ${event.venue}, ${event.location} on ${formatDate(event.date)}.`,
  };
}

export const revalidate = 60;

export default async function EventDetailPage({
  params,
}: EventDetailsPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const defaultHero =
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1920&q=80";

  return (
    <div className="pt-24 pb-24 min-h-screen bg-[#08070e]">
      {/* 1. Hero Event Banner */}
      <div className="relative w-full h-[450px] sm:h-[550px] overflow-hidden">
        <img
          src={event.hero_image_url || defaultHero}
          alt={event.title}
          className="w-full h-full object-cover object-center filter brightness-[0.35] contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08070e] via-[#08070e]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08070e] via-transparent to-[#08070e]/80" />

        <div className="absolute bottom-12 inset-x-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-foreground-muted hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Tour Dates
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              {event.category && (
                <Badge variant="purple" className="backdrop-blur-md">
                  {event.category}
                </Badge>
              )}
              {event.registration_enabled ? (
                <Badge variant="success" className="backdrop-blur-md">
                  Registrations Open
                </Badge>
              ) : (
                <Badge variant="warning" className="backdrop-blur-md">
                  Sold Out
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white max-w-4xl leading-tight">
              {event.title}
            </h1>

            {/* Event Key Meta Row */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-semibold text-white">{formatDate(event.date)}</span>
              </div>
              {event.start_time && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent-purple" />
                  <span>
                    {formatTime(event.start_time)}
                    {event.end_time ? ` - ${formatTime(event.end_time)}` : ""}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>
                  <strong className="text-white">{event.venue}</strong>, {event.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Description Block */}
            <div className="p-8 rounded-3xl bg-surface-subtle border border-white/10 backdrop-blur-md space-y-4">
              <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Event Overview
              </h2>
              <p className="text-base sm:text-lg text-foreground-muted leading-relaxed whitespace-pre-line">
                {event.description ||
                  "Prepare for a high-intensity sonic gathering curated by festival visionaries. World-class acoustic engineering meets monumental visual production."}
              </p>
            </div>

            {/* Event Highlights Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                Experience Highlights
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-surface-elevated/70 border border-white/5 flex items-start gap-3.5">
                  <Volume2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase">Acoustic Immersion</h4>
                    <p className="text-xs text-foreground-muted mt-1">
                      Next-generation line arrays tuned specifically for electronic dynamics and sub-bass clarity.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface-elevated/70 border border-white/5 flex items-start gap-3.5">
                  <Zap className="w-5 h-5 text-accent-purple shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase">Holographic Stagecraft</h4>
                    <p className="text-xs text-foreground-muted mt-1">
                      Over 400 square meters of high-density LED panels, kinetic lasers, and synchronized pyrotechnics.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface-elevated/70 border border-white/5 flex items-start gap-3.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase">Fast-Track Entry</h4>
                    <p className="text-xs text-foreground-muted mt-1">
                      RFID-enabled digital wristbands for rapid contactless security scanning and seamless bar payments.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-surface-elevated/70 border border-white/5 flex items-start gap-3.5">
                  <Users className="w-5 h-5 text-accent-cyan shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase">VIP Lounges & Stalls</h4>
                    <p className="text-xs text-foreground-muted mt-1">
                      Dedicated viewing decks, artist merchandise villages, and curated culinary experiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Artists Lineup */}
            {event.artists && event.artists.length > 0 && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                    Featured Event Lineup
                  </h3>
                  <span className="text-xs uppercase text-primary font-bold tracking-widest">
                    {event.artists.length} Confirmed Acts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {event.artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Ticket Sidebar (Right 4 Cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 p-6 sm:p-8 rounded-3xl bg-surface-subtle border border-primary/40 shadow-glow space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Official Registration
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Get Your Passes
                </h3>
                <p className="text-xs text-foreground-muted">
                  Reserve your passes today to receive digital booking confirmation and entry wristband pass.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-foreground-muted">Event:</span>
                  <span className="font-semibold text-white">{event.title}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-foreground-muted">Date:</span>
                  <span className="font-semibold text-white">{formatDate(event.date)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-foreground-muted">Venue:</span>
                  <span className="font-semibold text-white">{event.venue}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-foreground-muted">Location:</span>
                  <span className="font-semibold text-white">{event.location}</span>
                </div>
              </div>

              {event.registration_enabled ? (
                <Link href={`/register?event=${event.slug}`} className="block">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full shadow-glow tracking-widest"
                    leftIcon={<Ticket className="w-5 h-5 text-white" />}
                  >
                    Register Online Now
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="lg" disabled className="w-full">
                  Registrations Closed
                </Button>
              )}

              <p className="text-center text-[11px] text-foreground-muted">
                100% verified pass issuance. Instant confirmation delivered via Resend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
