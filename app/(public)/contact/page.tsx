"use client";

import React, { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  Instagram,
  Youtube,
  Twitter,
  Music,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to send message. Please try again.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage("Network error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#08070e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeading
          tag="GET IN TOUCH"
          title="CONTACT & INQUIRIES"
          subtitle="Have questions about pass bookings, artist accreditation, VIP tables, or sponsorships? Our team is on standby."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          {/* Direct Details (Left 5 Cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-8 rounded-3xl bg-surface-subtle border border-white/10 space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                Contact Information
              </h3>
              <p className="text-sm text-foreground-muted leading-relaxed">
                Connect with our festival logistics team directly or follow our official social channels for real-time announcements.
              </p>

              <div className="space-y-4 pt-2 text-sm">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-foreground-muted">
                      Official Inquiries
                    </span>
                    <a
                      href="mailto:contact@sonicfest.live"
                      className="font-semibold text-white hover:text-primary transition-colors"
                    >
                      contact@sonicfest.live
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent-purple/10 text-accent-purple border border-accent-purple/20 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-foreground-muted">
                      Support Hotline
                    </span>
                    <a
                      href="tel:+9102289003450"
                      className="font-semibold text-white hover:text-accent-purple transition-colors"
                    >
                      +91 (022) 8900-3450
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-wider text-foreground-muted">
                      Headquarters
                    </span>
                    <span className="font-semibold text-white">
                      NeoSphere Arena Complex, Bandra Kurla, Mumbai
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-6 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-3">
                  Follow the Frequency
                </h4>
                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary/50 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary/50 transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a
                    href="https://spotify.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-accent-purple hover:border-accent-purple/50 transition-colors"
                  >
                    <Music className="w-4 h-4" />
                  </a>
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-accent-cyan hover:border-accent-cyan/50 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form (Right 7 Cols) */}
          <div className="lg:col-span-7">
            {isSuccess ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-surface-subtle border border-emerald-500/40 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">
                  Message Dispatched!
                </h3>
                <p className="text-sm text-foreground-muted max-w-md mx-auto">
                  Thank you for reaching out. A festival operations liaison will respond to your email within 24 hours.
                </p>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({ name: "", email: "", subject: "", message: "" });
                    }}
                  >
                    Send Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-8 rounded-3xl bg-surface-subtle border border-white/10 space-y-5"
              >
                <h3 className="text-xl font-bold uppercase tracking-wider text-white">
                  Drop Us a Message
                </h3>

                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Your Name <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Alex Morgan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted/60 text-sm focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Email Address <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted/60 text-sm focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="VIP Table Reservation / Sponsorship / Media"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted/60 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Message <span className="text-primary">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us how we can help you experience the festival..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted/60 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    className="w-full sm:w-auto shadow-glow tracking-widest"
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Send Transmission
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
