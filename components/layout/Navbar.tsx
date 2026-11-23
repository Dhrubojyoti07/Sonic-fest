"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Menu, X, Sparkles, Shield, User, LogOut, LogIn, Ticket } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/utils/admin";

export interface NavbarProps {
  siteName?: string;
  logoUrl?: string | null;
  ctaText?: string;
  ctaDestination?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  siteName = "SONIC FEST",
  logoUrl,
  ctaText = "Get Tickets",
  ctaDestination = "/register",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auth State Listener
  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser({
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email,
          full_name:
            session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch {
      window.location.href = "/api/auth/signout?next=/login";
    }
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "My Passes", href: "/my-passes" },
    { label: "About", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ];

  // Helper to split site name into 2 words for dynamic visual styling
  const nameParts = siteName.split(" ");
  const firstWord = nameParts[0] || "SONIC";
  const restWord = nameParts.slice(1).join(" ") || "FEST";
  const isAdmin = isAdminEmail(user?.email);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#08070e]/85 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl"
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={siteName}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <div className="flex flex-col leading-none">
                <span className="text-xl sm:text-2xl font-black tracking-widest text-white group-hover:text-primary transition-colors">
                  {firstWord}
                </span>
                <span className="text-xs sm:text-sm font-extrabold tracking-[0.25em] text-primary group-hover:text-white transition-colors">
                  {restWord}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors rounded-full",
                    isActive
                      ? "text-white font-bold"
                      : "text-foreground-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary shadow-glow rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA, User Auth & Admin Link */}
          <div className="hidden md:flex items-center gap-3">
            {/* Authenticated Customer Pill / Sign In Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/my-passes"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                    pathname === "/my-passes"
                      ? "bg-primary/20 text-primary border-primary/40 shadow-glow"
                      : "bg-surface-elevated/80 border-white/10 text-white hover:border-primary/40"
                  )}
                  title="My Booked Passes"
                >
                  <Ticket className="w-3.5 h-3.5 text-primary" />
                  <span>My Passes</span>
                </Link>

                <div className="flex items-center gap-2 bg-surface-elevated/80 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white max-w-[110px] truncate" title={user.email}>
                    {user.full_name || user.email?.split("@")[0]}
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1 text-foreground-muted hover:text-red-400 rounded-full transition-colors ml-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-foreground-muted hover:text-white hover:bg-white/5 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                title="Admin Portal"
                className="p-2 text-primary hover:text-white transition-colors rounded-full hover:bg-primary/10"
              >
                <Shield className="w-4 h-4" />
              </Link>
            )}

            <Link href={ctaDestination}>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />}
              >
                {ctaText}
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-foreground-muted hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-[60px] bg-[#0c0a1a]/95 backdrop-blur-2xl border-b border-white/10 p-6 shadow-2xl transition-all">
          <nav className="flex flex-col gap-3">
            {/* Mobile User Status */}
            {user ? (
              <div className="p-3 rounded-xl bg-surface-elevated/80 border border-white/10 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {user.full_name || "Festival Attendee"}
                    </div>
                    <div className="text-[11px] text-foreground-dark">{user.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center gap-2 text-sm font-bold text-primary mb-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </Link>
            )}

            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-3 text-base font-semibold uppercase tracking-wider rounded-xl transition-all",
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "text-foreground-muted hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <Link href={ctaDestination} className="w-full">
                <Button variant="primary" size="md" className="w-full">
                  {ctaText}
                </Button>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="text-center text-xs text-primary hover:text-white py-2"
                >
                  Admin Management Portal
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
