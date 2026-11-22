"use client";

import React, { useState } from "react";
import { Event } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Ticket,
  User,
  Mail,
  Phone,
  Users,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Download,
} from "lucide-react";
import { formatDate } from "@/lib/utils/cn";

export interface RegistrationFormProps {
  events: Event[];
  preselectedEventId?: string;
}

interface RegistrationSuccessData {
  id: string;
  shortCode: string;
  eventName: string;
  attendeeName: string;
  attendees: number;
  emailSent: boolean;
  emailWarning?: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  events,
  preselectedEventId,
}) => {
  // Choose default event
  const initialEventId =
    preselectedEventId ||
    events.find((e) => e.registration_enabled)?.id ||
    events[0]?.id ||
    "";

  const [formData, setFormData] = useState({
    eventId: initialEventId,
    name: "",
    email: "",
    phone: "",
    attendees: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<RegistrationSuccessData | null>(null);

  const selectedEvent = events.find((e) => e.id === formData.eventId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.details && Array.isArray(data.details)) {
          const map: Record<string, string> = {};
          data.details.forEach((err: { field: string; message: string }) => {
            map[err.field] = err.message;
          });
          setFieldErrors(map);
        }
        setErrorMessage(data.error || "Failed to complete registration. Please try again.");
        return;
      }

      setSuccessData(data.registration);
    } catch (err: unknown) {
      setErrorMessage("Network error occurred. Please check your connection and retry.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success Confirmation View
  if (successData) {
    return (
      <div className="relative p-8 sm:p-12 rounded-3xl bg-surface-subtle border border-primary/50 shadow-glow text-center max-w-xl mx-auto overflow-hidden animate-fade-in">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-accent-purple to-accent-cyan" />
        
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>

        <Badge variant="purple" className="mb-3">
          Pass Confirmed
        </Badge>

        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          You're In, {successData.attendeeName}!
        </h3>

        <p className="mt-3 text-sm text-foreground-muted">
          Your reservation for <strong className="text-white">{successData.eventName}</strong> has been secured.
        </p>

        {/* Pass Voucher Card */}
        <div className="mt-6 p-6 rounded-2xl bg-black/50 border border-white/10 text-left space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs uppercase tracking-widest text-foreground-muted">Reference Code</span>
            <span className="font-mono text-base font-bold text-primary tracking-wider">
              {successData.shortCode}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">Attendees:</span>
            <span className="font-semibold text-white">{successData.attendees} Person{successData.attendees > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground-muted">Email Status:</span>
            <span className="font-semibold text-emerald-400">
              {successData.emailSent ? "Confirmation Dispatched" : "Stored Successfully"}
            </span>
          </div>
        </div>

        {successData.emailWarning && (
          <p className="mt-3 text-xs text-amber-400/90">
            Note: {successData.emailWarning} (Save your Reference Code above for gate entry).
          </p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={() => window.print()}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Print / Save Pass
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setSuccessData(null);
              setFormData({
                eventId: initialEventId,
                name: "",
                email: "",
                phone: "",
                attendees: 1,
              });
            }}
          >
            Register Another Attendee
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative p-6 sm:p-10 rounded-3xl bg-surface-subtle/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 max-w-xl mx-auto"
    >
      <div className="text-center space-y-2 pb-2">
        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Secure Your Festival Pass
        </h3>
        <p className="text-sm text-foreground-muted">
          Instant digital verification and priority entry pass generation.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Event Selection */}
      <div className="space-y-2">
        <label
          htmlFor="eventId"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          Select Event <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <select
            id="eventId"
            value={formData.eventId}
            onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
            className="w-full px-4 py-3.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            required
          >
            {events.map((e) => (
              <option key={e.id} value={e.id} className="bg-[#0f0d1b] text-white">
                {e.title} — {formatDate(e.date)} ({e.venue})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
            ▼
          </div>
        </div>
        {fieldErrors.eventId && (
          <p className="text-xs text-red-400">{fieldErrors.eventId}</p>
        )}
      </div>

      {/* Selected Event Brief Info */}
      {selectedEvent && (
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
          <div>
            <span className="text-primary font-bold">{selectedEvent.title}</span>
            <div className="text-foreground-muted mt-0.5">
              {selectedEvent.venue}, {selectedEvent.location}
            </div>
          </div>
          <Badge variant="cyan">{selectedEvent.category || "Live Event"}</Badge>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          Full Name <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            id="name"
            type="text"
            placeholder="e.g. Alex Morgan"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted/60 text-sm focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        {fieldErrors.name && (
          <p className="text-xs text-red-400">{fieldErrors.name}</p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          Email Address <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            id="email"
            type="email"
            placeholder="alex@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted/60 text-sm focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        {fieldErrors.email && (
          <p className="text-xs text-red-400">{fieldErrors.email}</p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <label
          htmlFor="phone"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          Contact Phone <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted/60 text-sm focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        {fieldErrors.phone && (
          <p className="text-xs text-red-400">{fieldErrors.phone}</p>
        )}
      </div>

      {/* Number of Attendees */}
      <div className="space-y-2">
        <label
          htmlFor="attendees"
          className="block text-xs font-bold uppercase tracking-wider text-slate-300"
        >
          Number of Attendees <span className="text-primary">*</span>
        </label>
        <div className="relative">
          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            id="attendees"
            type="number"
            min={1}
            max={20}
            value={formData.attendees}
            onChange={(e) =>
              setFormData({ ...formData, attendees: parseInt(e.target.value, 10) || 1 })
            }
            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-surface-elevated border border-white/10 text-white text-sm focus:outline-none focus:border-primary transition-colors"
            required
          />
        </div>
        {fieldErrors.attendees && (
          <p className="text-xs text-red-400">{fieldErrors.attendees}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full py-4 tracking-widest shadow-glow"
          rightIcon={<Sparkles className="w-4 h-4" />}
        >
          Confirm Registration
        </Button>
      </div>

      <p className="text-center text-xs text-foreground-muted/70">
        By continuing, you agree to official festival terms and venue code of conduct.
      </p>
    </form>
  );
};
