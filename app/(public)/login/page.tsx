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
  ArrowRight,
  Shield,
  Ticket,
  Send,
  X,
  Compass,
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

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const nextUrl = searchParams.get("next") || "/";
  const errorQuery = searchParams.get("error");

  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab);
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

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("tab") === "signup") {
      setActiveTab("signup");
    }
  }, [searchParams]);

  useEffect(() => {
    if (errorQuery === "verification_failed") {
      setErrorMsg("Email verification link expired or is invalid. Please try again.");
    } else if (errorQuery === "oauth_failed") {
      setErrorMsg("Google Sign-In was cancelled or failed. Please retry.");
    }

    const savedEmail = localStorage.getItem("sonic_fest_customer_email");
    if (savedEmail) {
      setEmail(savedEmail);
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
        // Intercept 400 'provider is not enabled' before browser navigates to raw JSON
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
                "Google Sign-In is not yet enabled in your Supabase Dashboard. Turn on Google under Authentication > Providers in Supabase, or create an account with Email & Password below."
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

  // Email/Password Sign In
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
          localStorage.setItem("sonic_fest_customer_email", email.trim());
        } else {
          localStorage.removeItem("sonic_fest_customer_email");
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

  // Email/Password Sign Up
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
          emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data.session) {
        router.push(nextUrl);
        router.refresh();
      } else {
        setSignupSuccess(true);
      }
    } catch {
      setErrorMsg("An unexpected error occurred during account creation.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Dispatch
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
      setForgotError("Failed to dispatch password recovery email.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Guest / Demo Access Mode (Sets session cookie for instant evaluation)
  const handleGuestDemoAccess = () => {
    document.cookie = "sonic_fest_customer_demo=true; path=/; max-age=86400";
    localStorage.setItem("sonic_fest_customer_demo", "true");
    router.push(nextUrl);
    router.refresh();
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[#08070e] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-purple/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,0,122,0.15),rgba(255,255,255,0))]" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-4 shadow-glow">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Sonic Fest Pass Gateway
          </div>

          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            {activeTab === "signin" ? "Welcome Back" : "Join the Movement"}
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">
            {activeTab === "signin"
              ? "Sign in to access your festival passes, artist lineup, and exclusive perks."
              : "Create an account to reserve VIP passes and experience world-class stages."}
          </p>
        </div>

        {/* Auth Container Card */}
        <div className="p-7 sm:p-9 rounded-3xl bg-surface-subtle/90 border border-white/10 shadow-2xl backdrop-blur-2xl">
          {/* Google Supabase Auth Button */}
          {!signupSuccess && (
            <div className="space-y-4 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white text-gray-900 font-bold text-sm tracking-wide hover:bg-gray-100 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
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
                  Or continue with email
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

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2 mb-5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {infoMsg && (
            <div className="p-3.5 rounded-xl bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-xs flex items-start gap-2 mb-5">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{infoMsg}</div>
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === "signin" && !signupSuccess && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-foreground-dark absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-sm placeholder:text-foreground-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotEmail(email);
                    }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-foreground-dark absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-sm placeholder:text-foreground-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-dark hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-surface-elevated border-surface-border text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-foreground-muted">Remember my email</span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full mt-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Festival
              </Button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {activeTab === "signup" && !signupSuccess && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-foreground-dark absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-sm placeholder:text-foreground-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-foreground-dark absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-sm placeholder:text-foreground-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-foreground-dark absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-sm placeholder:text-foreground-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-dark hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-foreground-dark absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-sm placeholder:text-foreground-dark focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full mt-3"
                rightIcon={<Sparkles className="w-4 h-4" />}
              >
                Create Festival Account
              </Button>
            </form>
          )}

          {/* SIGNUP CONFIRMATION BANNER */}
          {signupSuccess && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  Verification Link Dispatched
                </h3>
                <p className="mt-2 text-xs text-foreground-muted leading-relaxed">
                  We sent a confirmation link to{" "}
                  <span className="text-white font-semibold">{email}</span>. Click
                  the link to verify your pass account and enter the festival portal.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSignupSuccess(false);
                    setActiveTab("signin");
                  }}
                >
                  Return to Sign In
                </Button>
              </div>
            </div>
          )}

          {/* DEMO / GUEST ACCESS BUTTON */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleGuestDemoAccess}
              className="text-xs text-accent-purple hover:text-white transition-colors flex items-center gap-1.5 font-semibold py-1 px-3 rounded-lg hover:bg-accent-purple/10"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore as Guest (Preview Access)</span>
            </button>
            <div className="text-[11px] text-foreground-dark text-center">
              Are you an event organizer?{" "}
              <Link
                href="/admin/login"
                className="text-foreground-muted hover:text-primary transition-colors underline"
              >
                Admin Suite
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-surface-subtle border border-white/15 p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(false);
                setForgotError(null);
              }}
              className="absolute top-4 right-4 text-foreground-muted hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-2">
              Reset Password
            </h3>
            <p className="text-xs text-foreground-muted mb-4 leading-relaxed">
              Enter your account email to receive a secure password reset link.
            </p>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs mb-4">
                {forgotError}
              </div>
            )}

            {forgotSuccess ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-xs text-white">
                  Reset link dispatched! Please check your inbox.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForgotModal(false)}
                >
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={forgotLoading}
                  className="w-full"
                  rightIcon={<Send className="w-3.5 h-3.5" />}
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

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08070e] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  );
}
