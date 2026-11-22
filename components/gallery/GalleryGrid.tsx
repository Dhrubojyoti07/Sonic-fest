"use client";

import React, { useState, useEffect } from "react";
import { GalleryItem } from "@/types/database";
import { X, ZoomIn, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface GalleryGridProps {
  items: GalleryItem[];
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ items = [] }) => {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (items.length === 0) {
    return (
      <div className="p-16 text-center rounded-2xl bg-surface-subtle border border-white/10 max-w-md mx-auto">
        <ImageIcon className="w-10 h-10 text-primary mx-auto mb-3 opacity-50" />
        <h3 className="text-xl font-bold uppercase tracking-tight text-white">
          Gallery Updating
        </h3>
        <p className="mt-2 text-sm text-foreground-muted">
          Festival highlights and photos will be published shortly.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => setActiveItem(item)}
            className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-surface-subtle border border-white/10 hover:border-primary/50 cursor-pointer shadow-card hover:shadow-glow transition-all duration-500"
          >
            <img
              src={item.image_url}
              alt={item.title || "Festival Moment"}
              className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08070e] via-[#08070e]/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

            {/* Hover overlay icon */}
            <div className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
              <ZoomIn className="w-4 h-4 text-primary" />
            </div>

            {/* Title & Caption */}
            <div className="absolute bottom-0 inset-x-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
              {item.title && (
                <h4 className="text-lg font-bold uppercase text-white group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
              )}
              {item.caption && (
                <p className="mt-1 text-xs sm:text-sm text-foreground-muted line-clamp-2">
                  {item.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          onClick={() => setActiveItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-[#0f0d1b] border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  {activeItem.title || "Festival Atmosphere"}
                </span>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image display */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[70vh]">
              <img
                src={activeItem.image_url}
                alt={activeItem.title || "Festival Moment"}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>

            {/* Caption */}
            {activeItem.caption && (
              <div className="p-4 bg-surface-subtle border-t border-white/10 text-sm text-foreground-muted">
                {activeItem.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
