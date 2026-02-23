"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { STRENGTH_CATEGORIES } from "@/lib/strengths";
import { cn } from "@/lib/utils";

export default function StudentDictionaryPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    STRENGTH_CATEGORIES[0]?.id ?? null
  );

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <h2 className="text-lg font-bold text-emerald-900">강점 사전</h2>
        <p className="text-xs text-emerald-600/70">
          24가지 성격 강점을 알아보세요
        </p>
      </div>

      <div className="space-y-3">
        {STRENGTH_CATEGORIES.map((category) => {
          const isExpanded = expandedCategory === category.id;

          // Extract base color from the Tailwind class
          const colorMap: Record<string, { bg: string; border: string; accent: string; text: string }> = {
            wisdom: { bg: "bg-blue-50", border: "border-blue-200", accent: "bg-blue-100", text: "text-blue-800" },
            courage: { bg: "bg-red-50", border: "border-red-200", accent: "bg-red-100", text: "text-red-800" },
            humanity: { bg: "bg-pink-50", border: "border-pink-200", accent: "bg-pink-100", text: "text-pink-800" },
            justice: { bg: "bg-amber-50", border: "border-amber-200", accent: "bg-amber-100", text: "text-amber-800" },
            temperance: { bg: "bg-green-50", border: "border-green-200", accent: "bg-green-100", text: "text-green-800" },
            transcendence: { bg: "bg-purple-50", border: "border-purple-200", accent: "bg-purple-100", text: "text-purple-800" },
          };
          const colors = colorMap[category.id] ?? {
            bg: "bg-gray-50",
            border: "border-gray-200",
            accent: "bg-gray-100",
            text: "text-gray-800",
          };

          return (
            <div key={category.id}>
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                  isExpanded
                    ? `${colors.bg} ${colors.border} shadow-sm`
                    : "bg-white border-gray-150 hover:border-gray-200 hover:shadow-sm"
                )}
              >
                <span className="text-2xl">{category.emoji}</span>
                <div className="flex-1">
                  <h3 className={cn("font-semibold text-sm", isExpanded ? colors.text : "text-gray-900")}>
                    {category.name}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {category.strengths.length}가지 강점
                  </p>
                </div>
                <svg
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Expanded strengths */}
              {isExpanded && (
                <div className="mt-2 space-y-2 pl-2 animate-in slide-in-from-top-2 duration-200">
                  {category.strengths.map((strength) => (
                    <Card
                      key={strength.id}
                      className={cn("border", colors.border, "border-opacity-50")}
                    >
                      <CardContent className="p-3.5">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "text-2xl flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                              colors.accent
                            )}
                          >
                            {strength.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-0.5">
                              {strength.name}
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed mb-2">
                              {strength.description}
                            </p>

                            {/* Examples */}
                            <div className="space-y-1">
                              {strength.examples.map((example, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-1.5 text-[11px] text-gray-500"
                                >
                                  <span className="text-emerald-400 mt-px flex-shrink-0">•</span>
                                  <span>{example}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
