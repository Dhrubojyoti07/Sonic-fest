import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Scale, AlertCircle, Ticket, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Sonic Fest",
  description: "Terms and conditions governing Sonic Fest ticket purchases, venue entry, and festival rules.",
};

export default function TermsPage() {
  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#08070e] text-slate-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="p-2.5 rounded-xl bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
              <Scale className="w-6 h-6" />
            </span>
            <span className="text-xs uppercase tracking-widest text-accent-purple font-bold">
              Legal & Conditions
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Last Updated: November 2026 • Sonic Fest Festival Operations
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed bg-[#110e1e]/60 border border-white/5 rounded-2xl p-6 sm:p-10 backdrop-blur-md">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" /> 1. Festival Admission & Passes
            </h2>
            <p>
              All attendees must possess a valid, scanned QR pass generated through our portal to gain entry. Each QR code is strictly single-entry per designated festival day. Attempting duplicate entry or presenting counterfeit credentials will result in turnstile denial and pass invalidation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" /> 2. Age Restrictions & Verification
            </h2>
            <p>
              Sonic Fest is an 18+ event. Attendees must present a matching government photo ID at turnstiles alongside their digital or printed QR pass. Failure to prove age or identity may result in refusal of entry without refund.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              3. Code of Conduct & Arena Safety
            </h2>
            <p>
              Attendees are required to follow all festival safety guidelines, venue signage, and security personnel instructions. Prohibited items include outside beverages, weapons, fireworks, unauthorized drones, and illegal substances.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              4. Event Changes & Force Majeure
            </h2>
            <p>
              Artist schedules, performance timetables, and stage lineups are subject to change. Sonic Fest reserves the right to adjust schedules due to adverse weather, safety requirements, or operational necessities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              5. Contact Information
            </h2>
            <p>
              For legal inquiries or questions regarding these terms, contact us at:
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-200">
              <p className="text-primary font-mono text-sm">support@dhrubojyoti.site</p>
              <p className="text-xs text-slate-400 mt-1">Organizer Contact: dhrubojyotipatra2007@gmail.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
