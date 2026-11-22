"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SiteSettings, Event } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Calendar, MapPin, Play, Sparkles, X } from "lucide-react";
import { formatDate } from "@/lib/utils/cn";

export interface HeroProps {
  settings: SiteSettings;
  featuredEvent?: Event | null;
}

export const Hero: React.FC<HeroProps> = ({ settings, featuredEvent }) => {
  const [showTrailer, setShowTrailer] = useState(false);

  // Dynamic values with fallbacks
  const title = settings.hero_title || "THE ULTIMATE MUSIC EXPERIENCE";
  const subtitle = settings.hero_subtitle || "Feel the beat. Live the vibe.";
  const heroImage =
    featuredEvent?.hero_image_url ||
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=2000&q=80";

  const eventDate = featuredEvent ? formatDate(featuredEvent.date) : "August 16–17, 2025";
  const eventVenue = featuredEvent?.venue || "NeoSphere Arena";
  const eventLocation = featuredEvent?.location || "Mumbai, India";
  const ctaText = settings.cta_text || "Get Tickets";
  const ctaDestination = featuredEvent
    ? `/register?event=${featuredEvent.slug}`
    : settings.cta_destination || "/register";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Background Image with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={title}
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.4] contrast-125 transform transition-transform duration-1000"
        />
        {/* Dark Overlays & Electric Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08070e] via-[#08070e]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08070e] via-transparent to-[#08070e]/80" />
        {/* Radial Atmosphere Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[300px] bg-accent-purple/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Live Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold tracking-widest uppercase text-white shadow-lg mb-8 animate-float">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-primary font-bold">OFFICIAL 2025/2026 TOUR</span>
          <span className="text-white/40">|</span>
          <span className="text-white/90">LIMITED PASSES REMAINING</span>
        </div>

        {/* Dynamic Hero Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-[1.02] max-w-5xl">
          <span className="block drop-shadow-2xl">{title}</span>
        </h1>

        {/* Dynamic Supporting Subtitle */}
        <p className="mt-6 text-lg sm:text-2xl font-light text-foreground-muted tracking-wide max-w-2xl text-slate-300">
          {subtitle}
        </p>

        {/* Dynamic Event Details Pill */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-6 py-3.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-sm sm:text-base text-slate-200 shadow-card">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold">{eventDate}</span>
          </div>
          <span className="hidden sm:inline text-white/20">•</span>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent-purple" />
            <span>
              <strong className="font-semibold text-white">{eventVenue}</strong>, {eventLocation}
            </span>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href={ctaDestination} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto text-base tracking-widest px-10 py-4 shadow-glow hover:shadow-glow-lg"
              rightIcon={<Sparkles className="w-5 h-5 text-white" />}
            >
              {ctaText}
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto tracking-widest px-8 py-4"
            leftIcon={<Play className="w-4 h-4 text-primary fill-primary" />}
            onClick={() => setShowTrailer(true)}
          >
            Watch Trailer
          </Button>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#0f0d1b] border border-white/20 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  Official Festival Aftermovie & Teaser
                </span>
              </div>
              <button
                onClick={() => setShowTrailer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close trailer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/kJQP7kiw5Fk?autoplay=1&mute=0&rel=0"
                title="Festival Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
