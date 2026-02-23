"use client";

import { STRENGTH_MAP } from "@/lib/strengths";
import { cn } from "@/lib/utils";

interface StrengthBadgeProps {
  strengthId: string;
  size?: "sm" | "md" | "lg";
}

export function StrengthBadge({ strengthId, size = "md" }: StrengthBadgeProps) {
  const strength = STRENGTH_MAP.get(strengthId);

  if (!strength) {
    return (
      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
        {strengthId}
      </span>
    );
  }

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors",
        strength.categoryColor,
        sizeClasses[size]
      )}
    >
      <span>{strength.emoji}</span>
      <span>{strength.name}</span>
    </span>
  );
}
