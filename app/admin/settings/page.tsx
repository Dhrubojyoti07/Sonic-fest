"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { SiteSettings } from "@/types/database";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants/defaults";
import {
  Settings,
  Save,
  Sparkles,
  AlertCircle,
  Globe,
  Sliders,
  Share2,
  Mail,
  Shield,
  HelpCircle,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("site_settings")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (data) {
          setSettings({ ...DEFAULT_SITE_SETTINGS, ...data });
        }
      } catch (err) {
        console.warn("Load settings warning:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      site_name: settings.site_name?.trim() || "SONIC FEST",
      logo_url: settings.logo_url?.trim() || "",
      hero_title: settings.hero_title?.trim() || "THE ULTIMATE MUSIC EXPERIENCE",
      hero_subtitle: settings.hero_subtitle?.trim() || "Feel the beat. Live the vibe.",
      about_title: settings.about_title?.trim() || "Sonic Fest 2025",
      about_description: settings.about_description?.trim() || "",
      contact_email: settings.contact_email?.trim() || "contact@sonicfest.live",
      contact_phone: settings.contact_phone?.trim() || "",
      instagram_url: settings.instagram_url?.trim() || "",
      youtube_url: settings.youtube_url?.trim() || "",
      spotify_url: settings.spotify_url?.trim() || "",
      x_url: settings.x_url?.trim() || "",
      footer_text: settings.footer_text?.trim() || "© 2025 SONIC FEST. All rights reserved.",
      cta_text: settings.cta_text?.trim() || "Get Tickets",
      cta_destination: settings.cta_destination?.trim() || "/register",
    };

    try {
      // Upsert single settings row
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          {
            id: settings.id || "00000000-0000-0000-0000-000000000001",
            ...payload,
          },
          { onConflict: "id" }
        );

      if (error) throw error;
      setSuccessMsg("Global site configuration saved! Changes are now live across the platform.");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Site Settings & Client Branding"
        subtitle="Configure festival identity, hero typography, social channels, and footer copy dynamically."
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-5xl">
        {/* Callout Notice for Client Reusability */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-accent-purple/10 to-transparent border border-primary/30 flex items-start gap-4">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-white">
              Data-Driven Client Reusability
            </h4>
            <p className="text-foreground-muted leading-relaxed">
              Updating these fields instantly customizes the public festival website for any client (e.g. changing from "SONIC FEST" to "SUMMER BEATS", changing contact details, hero titles, or social media handles) without editing a single line of frontend code.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Brand & Logo */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-subtle border border-white/10 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              1. Brand Identity & Header
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Website / Festival Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  placeholder="e.g. SONIC FEST"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Custom Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={settings.logo_url || ""}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  placeholder="https://... (Leave empty for typography logo)"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Primary Navigation CTA Text
                </label>
                <input
                  type="text"
                  value={settings.cta_text}
                  onChange={(e) => setSettings({ ...settings, cta_text: e.target.value })}
                  placeholder="Get Tickets"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Primary Navigation CTA Destination
                </label>
                <input
                  type="text"
                  value={settings.cta_destination}
                  onChange={(e) => setSettings({ ...settings, cta_destination: e.target.value })}
                  placeholder="/register"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Hero Section Copy */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-subtle border border-white/10 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-accent-purple" />
              2. Hero Section Copy
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Hero Main Headline
              </label>
              <input
                type="text"
                value={settings.hero_title}
                onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                placeholder="THE ULTIMATE MUSIC EXPERIENCE"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Hero Subtitle / Tagline
              </label>
              <input
                type="text"
                value={settings.hero_subtitle}
                onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                placeholder="Feel the beat. Live the vibe."
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Section 3: About Story */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-subtle border border-white/10 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-cyan" />
              3. About Section Content
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                About Heading
              </label>
              <input
                type="text"
                value={settings.about_title}
                onChange={(e) => setSettings({ ...settings, about_title: e.target.value })}
                placeholder="Sonic Fest 2025"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                About Description
              </label>
              <textarea
                rows={3}
                value={settings.about_description}
                onChange={(e) => setSettings({ ...settings, about_description: e.target.value })}
                placeholder="Get ready for an electrifying musical journey..."
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Section 4: Contact & Socials */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-subtle border border-white/10 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              4. Contact Details & Social Media Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  placeholder="contact@sonicfest.live"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={settings.contact_phone}
                  onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                  placeholder="+91 (022) 8900-3450"
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={settings.instagram_url || ""}
                  onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={settings.youtube_url || ""}
                  onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/@..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Spotify URL
                </label>
                <input
                  type="url"
                  value={settings.spotify_url || ""}
                  onChange={(e) => setSettings({ ...settings, spotify_url: e.target.value })}
                  placeholder="https://spotify.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  X (Twitter) URL
                </label>
                <input
                  type="url"
                  value={settings.x_url || ""}
                  onChange={(e) => setSettings({ ...settings, x_url: e.target.value })}
                  placeholder="https://x.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                placeholder="© 2025 SONIC FEST. All rights reserved."
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              className="shadow-glow tracking-widest px-8"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Site Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
