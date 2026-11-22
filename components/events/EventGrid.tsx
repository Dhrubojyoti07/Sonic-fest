"use client";

import React, { useState, useMemo } from "react";
import { Event } from "@/types/database";
import { EventCard } from "@/components/events/EventCard";
import { Search, Filter, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface EventGridProps {
  events: Event[];
}

export const EventGrid: React.FC<EventGridProps> = ({ events = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return ["All", ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory =
        selectedCategory === "All" || e.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-subtle border border-white/10 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event, city, or venue..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-elevated/80 border border-white/10 text-white placeholder-foreground-muted text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors",
                selectedCategory === category
                  ? "bg-primary text-white shadow-glow"
                  : "bg-surface-elevated text-foreground-muted hover:text-white"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Grid */}
      {filteredEvents.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-surface-subtle border border-white/10 max-w-lg mx-auto">
          <CalendarDays className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold uppercase tracking-tight text-white">
            No Events Found
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Try adjusting your search query or switching categories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
