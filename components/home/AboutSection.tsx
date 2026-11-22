import React from "react";
import Link from "next/link";
import { SiteSettings, Event } from "@/types/database";
import { Button } from "@/lib/../components/ui/Button";
import { Music2, Sparkles, Utensils, CheckCircle2, ArrowRight } from "lucide-react";

export interface AboutSectionProps {
  settings: SiteSettings;
  featuredEvent?: Event | null;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  settings,
  featuredEvent,
}) => {
  const title = settings.about_title || "Sonic Fest 2025";
  const description =
    settings.about_description ||
    "Get ready for an electrifying musical journey with world-class artists, immersive stages, and an unforgettable atmosphere.";

  const aboutImage =
    featuredEvent?.hero_image_url ||
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80";

  const features = [
    {
      icon: <Music2 className="w-5 h-5 text-primary" />,
      title: "Top Artists Worldwide",
      description: "Curated lineup representing iconic global headliners and visionary breakthrough sounds.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-accent-purple" />,
      title: "Immersive Stage Design",
      description: "State-of-the-art 360-degree LED architectures, laser sync, and crystal acoustics.",
    },
    {
      icon: <Utensils className="w-5 h-5 text-accent-cyan" />,
      title: "Food & Lifestyle Stalls",
      description: "Gourmet culinary pavilions, artisan creators, chillout lounges, and experiential art.",
    },
  ];

  return (
    <section className="relative py-24 bg-[#08070e] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image with glass and neon framing */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Glow border backing */}
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent-purple rounded-3xl blur-xl opacity-30 transition duration-1000 group-hover:opacity-60" />

              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-surface shadow-2xl aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]">
                <img
                  src={aboutImage}
                  alt={title}
                  className="w-full h-full object-cover object-center filter contrast-110 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Floating highlight badge */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      Festival Atmosphere
                    </span>
                    <h4 className="text-sm font-semibold text-white">Unrivaled Production Value</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold">
                    360° LIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-bold tracking-widest uppercase text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              ABOUT THE EVENT
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              {title}
            </h2>

            <p className="text-base sm:text-lg text-foreground-muted leading-relaxed">
              {description}
            </p>

            {/* Feature highlights list */}
            <div className="pt-4 space-y-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 rounded-xl bg-surface-subtle/80 border border-white/5 hover:border-white/15 transition-colors"
                >
                  <div className="p-2.5 rounded-lg bg-white/5 shrink-0 mt-0.5">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {feature.title}
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </h3>
                    <p className="mt-1 text-sm text-foreground-muted">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex flex-wrap items-center gap-4">
              <Link href="/about">
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Learn More About Us
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" size="md">
                  Explore Lineup & Stages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
