import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Sonic Fest",
  description: "Learn how Sonic Fest collects, handles, and protects attendee information.",
};

export default function PrivacyPolicyPage() {
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
            <span className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <span className="text-xs uppercase tracking-widest text-primary font-bold">
              Legal & Compliance
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Last Updated: November 2026 • Effective for Sonic Fest Attendees & Users
          </p>
        </div>

        {/* Content sections */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed bg-[#110e1e]/60 border border-white/5 rounded-2xl p-6 sm:p-10 backdrop-blur-md">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" /> 1. Information We Collect
            </h2>
            <p>
              When you register for Sonic Fest passes, interact with our services, or log in via Google OAuth, we collect only the necessary credentials required to issue passes and ensure festival gate security:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Personal Identifiers:</strong> Name, Email Address, and Phone Number provided during ticket registration.</li>
              <li><strong>OAuth Account Info:</strong> Name and verified Email Address provided through Google Sign-In to authenticate your attendee dashboard.</li>
              <li><strong>Festival Admission Data:</strong> Unique QR ticket tokens, wristband credential IDs, and turnstile check-in timestamps.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent-purple" /> 2. How We Use Your Data
            </h2>
            <p>
              We process your personal information strictly for festival operations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Generating and delivering your digital QR festival passes via email (powered by Resend).</li>
              <li>Turnstile verification and access control at event gates to prevent counterfeit entry.</li>
              <li>Sending critical festival notifications, timetable changes, or safety advisories.</li>
              <li>Providing support when you submit inquiries through our contact channels.</li>
            </ul>
            <p className="text-white font-medium">
              We never sell, rent, or monetize your personal data to third-party advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> 3. Data Infrastructure & Security
            </h2>
            <p>
              Your data is stored and secured using enterprise-grade cloud providers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Database & Authentication:</strong> Handled securely by Supabase with Row Level Security (RLS) and encrypted transport (TLS/SSL).</li>
              <li><strong>Edge Delivery & Protection:</strong> Edge networks, DDoS protection, and SSL encryption managed via Cloudflare.</li>
              <li><strong>Transactional Email:</strong> Pass deliveries dispatched securely via Resend API.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              4. Cookies & Local Storage
            </h2>
            <p>
              We use essential session cookies strictly to maintain your authenticated login session and remember your festival pass view. No cross-site advertising tracking cookies are deployed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              5. Your Rights & Contact Information
            </h2>
            <p>
              You may request a copy of your pass details, request deletion of your account, or update your registered credentials at any time by contacting our festival operations team:
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-slate-200">
              <p><strong>Festival Operations & Support:</strong></p>
              <p className="text-primary font-mono text-sm mt-1">dhrubojyotipatra2007@gmail.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
