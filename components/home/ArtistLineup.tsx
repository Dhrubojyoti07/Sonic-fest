"use client";

import React, { useState, useMemo } from "react";
import { Artist } from "@/types/database";
import { ArtistCard } from "@/components/artists/ArtistCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ArtistLineupProps {
  artists: Artist[];
}

export const ArtistLineup: React.FC<ArtistLineupProps> = ({ artists = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    artists.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ["All", ...Array.from(set)];
  }, [artists]);

  const filteredArtists = useMemo(() => {
    if (selectedCategory === "All") return artists;
    return artists.filter((a) => a.category === selectedCategory);
  }, [artists, selectedCategory]);

  return (
    <section id="lineup" className="relative py-24 bg-[#08070e] overflow-hidden">
      {/* Background neon ambient gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-accent-purple/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          tag="LINEUP"
          title="ELECTRIFYING ARTIST LINEUP"
          subtitle="A handpicked curation of iconic chart-toppers, underground tastemakers, and revolutionary electronic acts."
        />

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300",
                    isSelected
                      ? "bg-primary text-white shadow-glow border border-primary/50"
                      : "bg-surface-elevated/70 text-foreground-muted hover:text-white border border-white/10 hover:border-white/20"
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        {/* Artists Grid */}
        {filteredArtists.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface-subtle border border-white/10 max-w-md mx-auto">
            <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 opacity-60" />
            <h4 className="text-lg font-bold text-white uppercase">Lineup Expanding</h4>
            <p className="mt-2 text-sm text-foreground-muted">
              Check back soon for the next phase of festival headliner reveals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArtists.map((artist, idx) => (
              <ArtistCard
                key={artist.id || idx}
                artist={artist}
                featured={idx === 0 || idx === 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
