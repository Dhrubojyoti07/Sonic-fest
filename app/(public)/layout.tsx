import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/supabase/queries";

export const revalidate = 60; // Revalidate dynamic settings every minute

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col min-h-screen bg-[#08070e]">
      <Navbar
        siteName={settings.site_name}
        logoUrl={settings.logo_url}
        ctaText={settings.cta_text}
        ctaDestination={settings.cta_destination}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
