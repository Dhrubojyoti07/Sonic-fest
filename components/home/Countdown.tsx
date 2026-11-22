"use client";

import React, { useState, useEffect } from "react";
import { Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface CountdownProps {
  eventDate: string;
  eventTime?: string | null;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
}

export const Countdown: React.FC<CountdownProps> = ({
  eventDate,
  eventTime = "18:00",
  className,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTime = (): TimeLeft => {
      // Build target timestamp
      const timePart = eventTime ? `${eventTime}:00` : "18:00:00";
      const targetDate = new Date(`${eventDate}T${timePart}`);
      const targetTime = targetDate.getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (isNaN(difference) || difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, ended: false };
    };

    // Initial calculation
    setTimeLeft(calculateTime());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDate, eventTime]);

  if (!timeLeft) {
    // Render matching placeholder during SSR/initial mount to prevent layout shift
    return (
      <div className={cn("py-8 max-w-4xl mx-auto px-4", className)}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  if (timeLeft.ended) {
    return (
      <div className={cn("py-10 max-w-xl mx-auto px-4 text-center", className)}>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-card">
          <div className="inline-flex items-center gap-2 text-primary font-bold tracking-widest text-sm uppercase mb-2">
            <Clock className="w-4 h-4" />
            <span>Schedule Status</span>
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tight text-white glow-pink-text">
            EVENT ENDED
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            This edition has concluded. Stay tuned for the upcoming announcement!
          </p>
        </div>
      </div>
    );
  }

  const timeBlocks = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINUTES", value: timeLeft.minutes },
    { label: "SECONDS", value: timeLeft.seconds },
  ];

  return (
    <div className={cn("relative z-20 py-10 max-w-5xl mx-auto px-4 sm:px-6", className)}>
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase text-accent-violet bg-accent-purple/10 border border-accent-purple/30">
          <Flame className="w-3.5 h-3.5 text-primary" />
          COUNTDOWN TO THE EXPERIENCE
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {timeBlocks.map((block) => (
          <div
            key={block.label}
            className="group relative flex flex-col items-center justify-center p-5 sm:p-7 rounded-2xl bg-gradient-to-b from-[#141026]/90 to-[#0c0a1a]/95 backdrop-blur-xl border border-white/10 hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-glow"
          >
            {/* Top subtle highlight */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight tabular-nums group-hover:text-primary transition-colors">
              {String(block.value).padStart(2, "0")}
            </span>
            <span className="mt-2 text-xs sm:text-sm font-bold tracking-[0.2em] text-foreground-muted uppercase">
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
