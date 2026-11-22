"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/lib/../components/ui/Button";
import { Menu, X, Sparkles, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "About", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ];

  // Helper to split site name into 2 words for dynamic visual styling
  const nameParts = siteName.split(" ");
  const firstWord = nameParts[0] || "SONIC";
  const restWord = nameParts.slice(1).join(" ") || "FEST";

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

          {/* CTA & Admin Link */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              title="Admin Portal"
              className="p-2 text-foreground-muted hover:text-accent-purple transition-colors rounded-full hover:bg-white/5"
            >
              <Shield className="w-4 h-4" />
            </Link>
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
              <Link
                href="/admin/login"
                className="text-center text-xs text-foreground-muted hover:text-accent-purple py-2"
              >
                Admin Management Portal
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
