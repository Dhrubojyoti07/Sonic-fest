import React from "react";
import Link from "next/link";
import { Event } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, MapPin, ArrowRight, Ticket } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils/cn";

export interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, featured }) => {
  const defaultImg =
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-surface-subtle border border-white/10 hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-glow flex flex-col">
      {/* Event Image Banner */}
      <div className="relative w-full h-52 sm:h-60 overflow-hidden bg-surface-elevated">
        <img
          src={event.hero_image_url || defaultImg}
          alt={event.title}
          className="w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 group-hover:brightness-100 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d1b] via-transparent to-black/30" />

        {/* Category & Status badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          {event.category && (
            <Badge variant="purple" className="backdrop-blur-md">
              {event.category}
            </Badge>
          )}

          {event.registration_enabled ? (
            <Badge variant="success" className="backdrop-blur-md">
              Passes Available
            </Badge>
          ) : (
            <Badge variant="outline" className="backdrop-blur-md bg-black/60 text-slate-300">
              Sold Out / Closed
            </Badge>
          )}
        </div>
      </div>

      {/* Content Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Date & Time pill */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-primary mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(event.date)}
            </span>
            {event.start_time && (
              <>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(event.start_time)}
                  {event.end_time ? ` - ${formatTime(event.end_time)}` : ""}
                </span>
              </>
            )}
          </div>

          {/* Event Title */}
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors leading-snug">
            <Link href={`/events/${event.slug}`}>{event.title}</Link>
          </h3>

          {/* Location & Venue */}
          <div className="mt-2 flex items-start gap-1.5 text-xs text-foreground-muted">
            <MapPin className="w-4 h-4 text-accent-purple shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              <strong className="text-slate-200">{event.venue}</strong>, {event.location}
            </span>
          </div>

          {/* Description */}
          {event.description && (
            <p className="mt-3 text-sm text-foreground-muted line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* CTA Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-3">
          <Link href={`/events/${event.slug}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              Details
            </Button>
          </Link>

          {event.registration_enabled && (
            <Link href={`/register?event=${event.slug}`} className="flex-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                leftIcon={<Ticket className="w-3.5 h-3.5" />}
              >
                Register
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
