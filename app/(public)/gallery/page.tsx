import React from "react";
import { getGalleryItems } from "@/lib/supabase/queries";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visual Gallery",
  description: "Immerse in the sensory atmosphere, pyrotechnics, and euphoric festival moments.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[#08070e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeading
          tag="VISUAL CHRONICLES"
          title="FESTIVAL MOMENTS & ATMOSPHERE"
          subtitle="Explore the lasers, the sound systems, the stage architectures, and the pure euphoria of the crowd."
        />

        <GalleryGrid items={items} />
      </div>
    </div>
  );
}
