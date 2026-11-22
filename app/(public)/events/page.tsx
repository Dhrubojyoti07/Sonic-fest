import React from "react";
import { getAllEvents } from "@/lib/supabase/queries";
import { EventGrid } from "@/components/events/EventGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events & Tour Dates",
  description: "Browse all upcoming festival editions, arenas, and exclusive underground sessions.",
};

export const revalidate = 60;

export default async function EventsPage() {
  const events = await getAllEvents();

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#08070e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          tag="SCHEDULE & LOCATIONS"
          title="FESTIVAL EVENTS & TOUR DATES"
          subtitle="Explore multi-stage outdoor arenas, coastal sunset sessions, and exclusive underground techno warehouses."
        />

        <EventGrid events={events} />
      </div>
    </div>
  );
}
