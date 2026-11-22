"use client";

import React, { useState } from "react";
import { Artist } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { Info, X, Music, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ArtistCardProps {
  artist: Artist;
  featured?: boolean;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, featured }) => {
  const [showBio, setShowBio] = useState(false);

  const defaultImg =
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80";

  return (
    <>
      <div
        className={cn(
          "group relative rounded-2xl overflow-hidden bg-surface-subtle border border-white/10 hover:border-primary/50 transition-all duration-500 shadow-card hover:shadow-glow flex flex-col justify-end",
          featured ? "h-[420px] sm:h-[480px]" : "h-[340px] sm:h-[380px]"
        )}
      >
        {/* Background Artist Image */}
        <img
          src={artist.image_url || defaultImg}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-all duration-700"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08070e] via-[#08070e]/50 to-transparent opacity-90 group-hover:opacity-85 transition-opacity" />
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Card Content */}
        <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-end">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant="purple" className="backdrop-blur-md">
              {artist.category}
            </Badge>

            {artist.biography && (
              <button
                onClick={() => setShowBio(true)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-primary text-white/80 hover:text-white transition-colors backdrop-blur-md"
                title="View Biography"
                aria-label={`View biography of ${artist.name}`}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">
            {artist.name}
          </h3>

          {artist.biography && (
            <p className="mt-2 text-xs sm:text-sm text-foreground-muted line-clamp-2 leading-relaxed">
              {artist.biography}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-foreground-muted">
            <span className="flex items-center gap-1.5 text-accent-violet font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-primary" />
              LIVE AT SONIC FEST
            </span>
            <span className="text-white/40 group-hover:text-white transition-colors">
              Read Bio &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* Artist Biography Modal */}
      {showBio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0f0d1b] border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowBio(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary shrink-0">
                <img
                  src={artist.image_url || defaultImg}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <Badge variant="purple" className="mb-1">
                  {artist.category}
                </Badge>
                <h3 className="text-2xl font-black uppercase text-white tracking-tight">
                  {artist.name}
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Music className="w-4 h-4" />
                Artist Biography
              </h4>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-h-60 overflow-y-auto pr-2">
                {artist.biography || "Biography coming soon for this artist."}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowBio(false)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
