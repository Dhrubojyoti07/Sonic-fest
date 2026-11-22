import React from "react";
import Link from "next/link";
import {
  getSiteSettings,
  getFeaturedEvent,
  getAllEvents,
  getAllArtists,
  getGalleryItems,
} from "@/lib/supabase/queries";
import { Hero } from "@/components/home/Hero";
import { Countdown } from "@/components/home/Countdown";
import { AboutSection } from "@/components/home/AboutSection";
import { ArtistLineup } from "@/components/home/ArtistLineup";
import { EventCard } from "@/components/events/EventCard";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, Ticket, QrCode } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, featuredEvent, allEvents, artists, galleryItems] =
    await Promise.all([
      getSiteSettings(),
      getFeaturedEvent(),
      getAllEvents(),
      getAllArtists(),
      getGalleryItems(),
    ]);

  return (
    <div className="space-y-0">
      {/* 1. Immersive Hero */}
      <Hero settings={settings} featuredEvent={featuredEvent} />

      {/* 2. Dynamic Event Countdown */}
      {featuredEvent && (
        <section className="relative -mt-10 mb-10 z-20">
          <Countdown
            eventDate={featuredEvent.date}
            eventTime={featuredEvent.start_time}
          />
        </section>
      )}

      {/* 3. About the Event Two-Column Section */}
      <AboutSection settings={settings} featuredEvent={featuredEvent} />

      {/* 4. Electrifying Artist Lineup */}
      <ArtistLineup artists={artists} />

      {/* 5. Featured Festival Events */}
      <section className="relative py-24 bg-gradient-to-b from-[#08070e] via-[#0c0a1a] to-[#08070e] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <SectionHeading
              tag="TOUR DATES"
              title="UPCOMING EDITIONS & SESSIONS"
              subtitle="Explore multi-city tour stops and exclusive underground warehouse showcases."
              align="left"
              className="mb-0"
            />
            <Link href="/events" className="mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View All Events
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allEvents.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Curated Gallery Showcase */}
      <section className="relative py-24 bg-[#08070e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <SectionHeading
              tag="ATMOSPHERE"
              title="FESTIVAL MOMENTS"
              subtitle="A snapshot into the energy, laser architecture, and memories etched in sound."
              align="left"
              className="mb-0"
            />
            <Link href="/gallery" className="mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Full Gallery &rarr;
              </Button>
            </Link>
          </div>

          <GalleryGrid items={galleryItems.slice(0, 6)} />
        </div>
      </section>

      {/* 7. Fast-Track Attendee Pass Vault & Fast Track Entry Banner */}
      <section className="relative py-16 bg-gradient-to-b from-[#08070e] to-[#0d0b1d] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-surface-subtle/80 border border-primary/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="space-y-3 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <Ticket className="w-3.5 h-3.5" />
                <span>Fast-Track Admission</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                Already Booked Your Festival Pass?
              </h2>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Retrieve your digital wristband voucher, gate admission QR code, and check your turnstile check-in status in the Attendee Vault.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
              <Link href="/my-passes" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold shadow-glow"
                  leftIcon={<QrCode className="w-5 h-5 text-white" />}
                >
                  View My Booked Passes
                </Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full">
                  Book New Pass
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call To Action Banner */}
      <section className="relative py-20 bg-gradient-to-r from-primary/20 via-accent-purple/20 to-primary/20 border-y border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[#0c0a1a]/85 backdrop-blur-xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            LIMITED CAPACITY
          </span>

          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            DON'T MISS THE BIGGEST BASS DROP OF THE YEAR
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Reserve your entry wristband now. Passes include priority security lane access, festival survival kit, and access to all stages.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                variant="primary"
                size="lg"
                className="px-10 py-4 shadow-glow hover:shadow-glow-lg tracking-widest text-base"
                leftIcon={<Ticket className="w-5 h-5 text-white" />}
              >
                Claim Your Pass
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="lg" className="px-8 py-4">
                Inquire For VIP Tables
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
