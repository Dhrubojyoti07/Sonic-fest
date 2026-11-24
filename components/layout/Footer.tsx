import React from "react";
import Link from "next/link";
import { SiteSettings } from "@/types/database";
import { Instagram, Youtube, Twitter, Music, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export interface FooterProps {
  settings: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const nameParts = (settings.site_name || "SONIC FEST").split(" ");
  const firstWord = nameParts[0] || "SONIC";
  const restWord = nameParts.slice(1).join(" ") || "FEST";

  return (
    <footer className="relative bg-[#05040a] border-t border-white/10 text-foreground-muted pt-16 pb-12 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex flex-col leading-none">
              <span className="text-2xl font-black tracking-widest text-white">
                {firstWord}
              </span>
              <span className="text-sm font-extrabold tracking-[0.25em] text-primary">
                {restWord}
              </span>
            </Link>

            <p className="text-sm text-foreground-muted/90 max-w-sm leading-relaxed">
              {settings.about_description ||
                "The premier electronic and live music festival delivering world-class sound, transcendent stage designs, and unforgettable memories."}
            </p>

            {/* Social media icons */}
            <div className="flex items-center gap-3 pt-2">
              {settings.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-foreground-muted hover:text-primary hover:border-primary/50 transition-all"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-foreground-muted hover:text-primary hover:border-primary/50 transition-all"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings.spotify_url && (
                <a
                  href={settings.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-foreground-muted hover:text-accent-purple hover:border-accent-purple/50 transition-all"
                  aria-label="Spotify"
                >
                  <Music className="w-4 h-4" />
                </a>
              )}
              {settings.x_url && (
                <a
                  href={settings.x_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-foreground-muted hover:text-accent-cyan hover:border-accent-cyan/50 transition-all"
                  aria-label="X (Twitter)"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-primary transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Experience
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-primary transition-colors">
                  Festival Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Passes & Information */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Passes & Info
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/register" className="hover:text-primary transition-colors flex items-center gap-1">
                  <span>Register Pass</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/about#faq" className="hover:text-primary transition-colors">
                  Festival FAQs
                </Link>
              </li>
              <li>
                <Link href="/about#safety" className="hover:text-primary transition-colors">
                  Safety & Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              {settings.contact_email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="hover:text-white transition-colors break-all"
                  >
                    {settings.contact_email}
                  </a>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-accent-purple shrink-0 mt-0.5" />
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Global Tour & Premier Arenas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground-muted/70">
          <p>{settings.footer_text}</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span className="text-primary font-medium tracking-wide hidden md:inline">
              POWERED BY HIGH-PERFORMANCE AUDIO & VISUAL ENGINEERING
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
