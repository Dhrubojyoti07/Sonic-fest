import React from "react";
import Link from "next/link";
import { getSiteSettings } from "@/lib/supabase/queries";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  Radio,
  Flame,
  Shield,
  HeartHandshake,
  HelpCircle,
  ArrowRight,
  Music4,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Experience",
  description: "Discover the vision, sound engineering, and safety standards behind the festival.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const settings = await getSiteSettings();

  const faqs = [
    {
      q: "What is the age restriction for festival entry?",
      a: "This event is strictly 18+. All attendees must carry a valid government-issued photo ID (Passport, Driving License, or National ID) matching their registration pass name.",
    },
    {
      q: "How do I receive my festival entry passes?",
      a: "Upon completing online registration, you receive an instant confirmation email and unique reference pass. Bring your digital reference or printed pass to the box office wristband counter to receive your RFID festival wristband.",
    },
    {
      q: "Can I transfer my pass to someone else?",
      a: "Passes can be transferred up to 48 hours before the event date by contacting official support with the original registrant email and new attendee credentials.",
    },
    {
      q: "What items are prohibited inside the festival arena?",
      a: "Prohibited items include outside food/beverages, illegal substances, professional recording rigs without media accreditation, sharp objects, and fireworks.",
    },
  ];

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#08070e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Header */}
        <SectionHeading
          tag="MANIFESTO & VISION"
          title={settings.about_title || "ABOUT THE FESTIVAL"}
          subtitle={
            settings.about_description ||
            "Crafted for true music purists. An immersive convergence of world-class artists, monumental lighting rigs, and crystal acoustics."
          }
        />

        {/* Two-Column Story Feature */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-[4/3] bg-surface">
            <img
              src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80"
              alt="Festival Stage Experience"
              className="w-full h-full object-cover filter contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-xs uppercase tracking-widest text-primary font-bold">
                Acoustic Superiority
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Custom Sound Architectures
              </h3>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Where Sound Meets Holographic Wonder
            </h3>
            <p className="text-base text-foreground-muted leading-relaxed">
              Founded on the belief that music is best felt in its most visceral, uncompressed form,
              our festival brings together visionary audio architects and world-class performers to
              create transformative live concert experiences.
            </p>
            <p className="text-base text-foreground-muted leading-relaxed">
              From kinetic LED sculptures pulsing in sync with 140 BPM sub-bass drops to dedicated
              ambient chillout groves, every square foot of the arena is engineered to transport you
              into a futuristic sonic universe.
            </p>

            <div className="pt-2 flex items-center gap-6">
              <div>
                <span className="block text-3xl font-black text-primary">50K+</span>
                <span className="text-xs uppercase tracking-wider text-foreground-muted">
                  Global Attendees
                </span>
              </div>
              <div className="w-[1px] h-10 bg-white/10" />
              <div>
                <span className="block text-3xl font-black text-accent-purple">4</span>
                <span className="text-xs uppercase tracking-wider text-foreground-muted">
                  Custom Stages
                </span>
              </div>
              <div className="w-[1px] h-10 bg-white/10" />
              <div>
                <span className="block text-3xl font-black text-accent-cyan">100%</span>
                <span className="text-xs uppercase tracking-wider text-foreground-muted">
                  Pure Energy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-violet">
              PRODUCTION STANDARDS
            </span>
            <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mt-2">
              The Four Pillars of Our Experience
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Music4 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white uppercase">Curated Lineup</h4>
              <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                Genre-defying headliners and forward-thinking producers curated for maximum emotional journey.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent-purple/10 border border-accent-purple/20 text-accent-purple flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white uppercase">Immersive Visuals</h4>
              <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                Next-generation holographic lasers, 4K LED arrays, and synchronized pyro choreographies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white uppercase">Safety & Care</h4>
              <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                24/7 medical response, free electrolyte hydration stations, and certified crowd safety stewards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-subtle border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white uppercase">Community First</h4>
              <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
                An inclusive, vibrant sanctuary where music lovers from across the globe unite without boundaries.
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div id="faq" className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white mt-2">
              Everything You Need to Know
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface-subtle border border-white/10 space-y-2 hover:border-white/20 transition-colors"
              >
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-sm text-foreground-muted leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link href="/register">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Claim Your Passes Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
