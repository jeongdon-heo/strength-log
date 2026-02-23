"use client";

import { useState } from "react";
import { STRENGTH_CATEGORIES, STRENGTH_MAP } from "@/lib/strengths";
import { cn } from "@/lib/utils";

interface StrengthPickerProps {
  value?: string;
  onChange: (strengthId: string) => void;
}

export function StrengthPicker({ value, onChange }: StrengthPickerProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const selectedStrength = value ? STRENGTH_MAP.get(value) : null;

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleStrengthClick = (strengthId: string) => {
    onChange(strengthId);
    setExpandedCategory(null);
  };

  return (
    <div className="space-y-3">
      {/* Selected strength display */}
      {selectedStrength && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <span className="text-lg">{selectedStrength.emoji}</span>
          <span className="text-sm font-medium text-emerald-800">
            {selectedStrength.categoryName} &middot; {selectedStrength.name}
          </span>
        </div>
      )}

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {STRENGTH_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
              "hover:scale-[1.02] active:scale-[0.98]",
              expandedCategory === category.id
                ? "ring-2 ring-emerald-500 border-emerald-300 bg-emerald-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            )}
          >
            <span className="text-lg">{category.emoji}</span>
            <span className="truncate">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Expanded strengths for selected category */}
      {expandedCategory && (
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {STRENGTH_CATEGORIES.find((c) => c.id === expandedCategory)?.strengths.map(
            (strength) => (
              <button
                key={strength.id}
                type="button"
                onClick={() => handleStrengthClick(strength.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all",
                  "hover:bg-white hover:shadow-sm",
                  value === strength.id
                    ? "bg-white shadow-sm ring-1 ring-emerald-400 font-medium"
                    : "font-normal"
                )}
              >
                <span className="text-xl flex-shrink-0">{strength.emoji}</span>
                <div className="min-w-0">
                  <div className="font-medium">{strength.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {strength.description}
                  </div>
                </div>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
