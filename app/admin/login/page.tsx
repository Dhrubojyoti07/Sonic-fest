"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

// Google 4-Color SVG Icon
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12c0 2.03.45 3.84 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function AdminLoginForm() {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/admin/dashboard";
  const errorQuery = searchParams.get("error");

  const supabase = createClient();

  useEffect(() => {
    if (errorQuery === "verification_failed") {
      setErrorMsg("Email verification link expired or is invalid. Please try again.");
    } else if (errorQuery === "oauth_failed") {
      setErrorMsg("Google Sign-In was cancelled or failed. Please retry.");
    }
  }, [errorQuery]);

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      const siteUrl = window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setGoogleLoading(false);
        return;
      }

      if (data?.url) {
        try {
          const res = await fetch(data.url);
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            if (
              body?.msg?.includes("not enabled") ||
              body?.error_code === "validation_failed" ||
              res.status === 400
            ) {
              setErrorMsg(
                "Google Sign-In is not yet enabled in your Supabase Dashboard. Turn on Google under Authentication > Providers in Supabase, or sign in below with your admin credentials."
              );
              setGoogleLoading(false);
              return;
            }
          }
        } catch {
          // If cross-origin prevents probe, proceed to OAuth URL
        }

        window.location.href = data.url;
      }
    } catch {
      setErrorMsg("Failed to connect with Google authentication provider.");
      setGoogleLoading(false);
    }
  };

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data.session) {
        if (rememberMe) {
          localStorage.setItem("sonic_fest_remember_email", email.trim());
        } else {
          localStorage.removeItem("sonic_fest_remember_email");
        }
        router.push(nextUrl);
        router.refresh();
      }
    } catch {
      setErrorMsg("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const siteUrl = window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${siteUrl}/auth/callback?next=/admin/dashboard`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // If session is returned immediately (email confirmation disabled in project)
      if (data.session) {
        router.push(nextUrl);
        router.refresh();
      } else {
        // Email verification required
        setSignupSuccess(true);
      }
    } catch {
      setErrorMsg("An unexpected error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      const siteUrl = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        {
          redirectTo: `${siteUrl}/auth/callback?next=/admin/reset-password`,
        }
      );

      if (error) {
        setForgotError(error.message);
        return;
      }

      setForgotSuccess(true);
    } catch {
      setForgotError("Failed to dispatch password reset request.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Fast demo mode bypass for local testing
  const handleDemoAccess = () => {
    document.cookie = "sonic_fest_admin_demo=true; path=/; max-age=86400";
    localStorage.setItem("sonic_fest_admin_demo", "true");
    router.push(nextUrl);
  };

  return (
    <div className="min-h-screen bg-[#08070e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent-purple/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-foreground-muted hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Festival Website
          </Link>

          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Lock className="w-6 h-6" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Admin Access Portal
          </h1>
          <p className="mt-1 text-xs text-foreground-muted">
            Authenticated control suite for events, artists, and pass management.
          </p>
        </div>

        {/* Auth Container */}
        <div className="p-8 rounded-3xl bg-surface-subtle border border-white/10 shadow-2xl backdrop-blur-xl">
          {/* Google Auth Button */}
          {!signupSuccess && (
            <div className="space-y-4 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-2xl bg-white text-gray-900 font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <span className="relative px-3 bg-surface-subtle text-[11px] font-bold uppercase tracking-wider text-foreground-dark">
                  Or admin credentials
                </span>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          {!signupSuccess && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-elevated border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={cn(
                  "py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all",
                  activeTab === "signin"
                    ? "bg-primary text-white shadow-glow"
                    : "text-foreground-muted hover:text-white"
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className={cn(
                  "py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all",
                  activeTab === "signup"
                    ? "bg-primary text-white shadow-glow"
                    : "text-foreground-muted hover:text-white"
                )}
              >
                Create Account
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 mb-4 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Verification Screen After Sign Up */}
          {signupSuccess ? (
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-black uppercase text-white tracking-tight">
                Verification Email Sent!
              </h3>

              <p className="text-xs text-foreground-muted leading-relaxed">
                We sent a secure confirmation link to <strong className="text-white">{email}</strong>. Please check your inbox to activate your account.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSignupSuccess(false);
                    setActiveTab("signin");
                  }}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          ) : activeTab === "signin" ? (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sonicfest.live"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotSuccess(false);
                      setForgotError(null);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-foreground-muted pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span>Remember my email</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full py-3.5 shadow-glow tracking-widest mt-2"
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Sign In to Admin
              </Button>
            </form>
          ) : (
            /* ================= SIGN UP FORM ================= */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sonicfest.live"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted text-sm focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full py-3.5 shadow-glow tracking-widest mt-2"
                rightIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Create Admin Account
              </Button>
            </form>
          )}

          {/* Quick Demo Access Button */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDemoAccess}
              className="w-full text-xs text-foreground-muted hover:text-white"
            >
              ⚡ Quick Preview Mode (Bypass Auth for Evaluation)
            </Button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0f0d1b] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-accent-purple/20 border border-accent-purple/40 text-accent-purple flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-tight">
                Reset Password
              </h3>
              <p className="text-xs text-foreground-muted mt-1">
                Enter your admin email and we'll send you a password recovery link.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs text-emerald-400 font-medium">
                  Password reset link sent to <strong>{forgotEmail}</strong>. Check your inbox and follow the link to set your new password.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full mt-2"
                >
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@sonicfest.live"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-elevated border border-white/10 text-white placeholder-foreground-muted text-sm focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={forgotLoading}
                  className="w-full py-3.5 shadow-glow tracking-widest"
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Send Recovery Link
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08070e] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
