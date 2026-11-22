import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "purple" | "cyan" | "outline" | "success" | "warning";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "primary",
  children,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-primary/15 text-primary border border-primary/30",
    purple: "bg-accent-purple/15 text-accent-violet border border-accent-purple/30",
    cyan: "bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30",
    outline: "bg-transparent text-foreground-muted border border-white/15",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
