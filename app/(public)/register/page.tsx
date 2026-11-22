import React from "react";
import { getAllEvents } from "@/lib/supabase/queries";
import { RegistrationForm } from "@/components/registration/RegistrationForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register & Reserve Passes",
  description: "Secure your official entry wristband for the music festival experience.",
};

export const revalidate = 60;

interface RegisterPageProps {
  searchParams: Promise<{ event?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { event: eventSlug } = await searchParams;
  const events = await getAllEvents();

  // Find preselected event ID if slug passed
  const preselectedEvent = eventSlug
    ? events.find((e) => e.slug === eventSlug)
    : undefined;

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#08070e]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          tag="REGISTRATION GATEWAY"
          title="FESTIVAL PASS REGISTRATION"
          subtitle="Complete your pass registration to receive instant digital confirmation and fast-track RFID wristband check-in."
        />

        <RegistrationForm
          events={events}
          preselectedEventId={preselectedEvent?.id}
        />
      </div>
    </div>
  );
}
