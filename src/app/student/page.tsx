"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { getApprovedObservationsForStudent } from "@/lib/firestore";
import { Observation } from "@/lib/types";
import { STRENGTH_MAP } from "@/lib/strengths";
import { StrengthBadge } from "@/components/strength/StrengthBadge";
import { Loader2 } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Garden Stage Configuration
   ═══════════════════════════════════════════════════════════════ */
const STAGES = [
  { name: "빈 땅", emoji: "🌑", label: "씨앗을 심어볼까요?" },
  { name: "새싹", emoji: "🌱", label: "작은 새싹이 돋아났어요!" },
  { name: "성장", emoji: "🌿", label: "쑥쑥 자라고 있어요!" },
  { name: "꽃봉오리", emoji: "🌷", label: "곧 꽃이 필 거예요!" },
  { name: "꽃밭", emoji: "🌸", label: "아름다운 꽃밭이에요!" },
  { name: "마법의 정원", emoji: "🌺", label: "환상적인 정원 완성!" },
];

const THRESHOLDS = [0, 1, 4, 8, 13, 20];

function getStage(n: number) {
  if (n >= 20) return 5;
  if (n >= 13) return 4;
  if (n >= 8) return 3;
  if (n >= 4) return 2;
  if (n >= 1) return 1;
  return 0;
}

/* Golden-ratio 1-D distribution for natural flower placement */
const PHI = 0.618033988749;
function flowerX(i: number) {
  return (((i + 1) * PHI) % 1) * 78 + 11;
}

function stemHeight(i: number, stage: number) {
  const base = stage >= 5 ? 58 : stage >= 4 ? 50 : stage >= 3 ? 40 : stage >= 2 ? 28 : 16;
  return base + ((i * 17 + 5) % 28);
}

/* Category → glow color for flowers */
const CAT_GLOW: Record<string, string> = {
  wisdom: "0 0 10px rgba(96,165,250,0.5)",
  courage: "0 0 10px rgba(248,113,113,0.5)",
  humanity: "0 0 10px rgba(244,114,182,0.5)",
  justice: "0 0 10px rgba(251,191,36,0.5)",
  temperance: "0 0 10px rgba(52,211,153,0.5)",
  transcendence: "0 0 10px rgba(167,139,250,0.5)",
};

/* Category → gem card gradient */
const GEM_BG: Record<string, { bg: string; border: string }> = {
  wisdom: { bg: "linear-gradient(145deg,#dbeafe,#bfdbfe,#93c5fd)", border: "#93c5fd" },
  courage: { bg: "linear-gradient(145deg,#fee2e2,#fecaca,#fca5a5)", border: "#fca5a5" },
  humanity: { bg: "linear-gradient(145deg,#fce7f3,#fbcfe8,#f9a8d4)", border: "#f9a8d4" },
  justice: { bg: "linear-gradient(145deg,#fef3c7,#fde68a,#fcd34d)", border: "#fcd34d" },
  temperance: { bg: "linear-gradient(145deg,#d1fae5,#a7f3d0,#6ee7b7)", border: "#6ee7b7" },
  transcendence: { bg: "linear-gradient(145deg,#ede9fe,#ddd6fe,#c4b5fd)", border: "#c4b5fd" },
};
const DEFAULT_GEM = { bg: "linear-gradient(145deg,#d1fae5,#a7f3d0,#6ee7b7)", border: "#6ee7b7" };

/* Category → observation card accent */
const OBS_ACCENT: Record<string, string> = {
  wisdom: "rgba(96,165,250,0.45)",
  courage: "rgba(248,113,113,0.45)",
  humanity: "rgba(244,114,182,0.45)",
  justice: "rgba(251,191,36,0.45)",
  temperance: "rgba(52,211,153,0.45)",
  transcendence: "rgba(167,139,250,0.45)",
};

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */
export default function StudentGardenPage() {
  const { profile } = useAuth();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      try {
        const obs = await getApprovedObservationsForStudent(profile!.uid);
        setObservations(obs);
      } catch (err) {
        console.error("Failed to load observations:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const topStrengths = profile.strengths.slice(0, 3);
  const count = observations.length;
  const stage = getStage(count);
  const cfg = STAGES[stage];
  const nextT = THRESHOLDS[stage + 1] ?? count;
  const currT = THRESHOLDS[stage];
  const remaining = stage >= 5 ? 0 : nextT - count;
  const pct = stage >= 5 ? 100 : ((count - currT) / (nextT - currT)) * 100;

  /* Sky gradient shifts with stage */
  const skyGradient =
    stage >= 5
      ? "linear-gradient(180deg,#7dd3fc 0%,#bae6fd 30%,#ecfccb 70%,#f0fdf4 100%)"
      : stage >= 3
        ? "linear-gradient(180deg,#93c5fd 0%,#bfdbfe 40%,#e0f2fe 72%,#f0fdf4 100%)"
        : "linear-gradient(180deg,#a5f3fc 0%,#cffafe 42%,#ecfccb 78%,#f0fdf4 100%)";

  return (
    <div className="space-y-5 pb-8">
      <style>{CSS_KEYFRAMES}</style>

      {/* ── Header ── */}
      <div className="text-center pt-1 pb-1">
        <h2 className="text-lg font-extrabold text-emerald-900">
          🌱 나의 강점 정원
        </h2>
        <p className="text-xs text-emerald-600/60">
          {profile.name}의 특별한 강점들이 자라고 있어요
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════
          GARDEN SCENE
          ══════════════════════════════════════════════════════════ */}
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-lg"
        style={{
          height: "clamp(260px, 42vw, 360px)",
          border: "1px solid rgba(16,185,129,0.18)",
        }}
      >
        {/* Sky */}
        <div className="absolute inset-0" style={{ background: skyGradient }} />

        {/* Sun */}
        <div
          className="absolute top-4 right-5 sm:top-5 sm:right-7 w-12 h-12 sm:w-16 sm:h-16 rounded-full"
          style={{
            background:
              "radial-gradient(circle,#fef08a 0%,#fbbf24 55%,#f59e0b 100%)",
            animation: "garden-pulse-glow 4s ease-in-out infinite",
          }}
        />

        {/* Sun rays (stage 3+) */}
        {stage >= 3 && (
          <div
            className="absolute top-1 right-2 sm:top-1 sm:right-3 w-20 h-20 sm:w-28 sm:h-28 rounded-full opacity-20 pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg,transparent,#fbbf24 8deg,transparent 16deg,transparent 36deg,#fbbf24 44deg,transparent 52deg,transparent 72deg,#fbbf24 80deg,transparent 88deg,transparent 108deg,#fbbf24 116deg,transparent 124deg,transparent 144deg,#fbbf24 152deg,transparent 160deg,transparent 180deg,#fbbf24 188deg,transparent 196deg,transparent 216deg,#fbbf24 224deg,transparent 232deg,transparent 252deg,#fbbf24 260deg,transparent 268deg,transparent 288deg,#fbbf24 296deg,transparent 304deg,transparent 324deg,#fbbf24 332deg,transparent 340deg,transparent 360deg)",
              animation: "garden-spin-slow 25s linear infinite",
            }}
          />
        )}

        {/* Clouds */}
        <div
          className="absolute text-4xl sm:text-5xl"
          style={{
            top: "8%",
            left: "-14%",
            opacity: 0.8,
            animation: "garden-cloud-drift 28s 0s linear infinite",
          }}
        >
          ☁️
        </div>
        <div
          className="absolute text-3xl sm:text-4xl"
          style={{
            top: "19%",
            left: "-11%",
            opacity: 0.55,
            animation: "garden-cloud-drift 38s 12s linear infinite",
          }}
        >
          ☁️
        </div>
        {stage >= 3 && (
          <div
            className="absolute text-2xl sm:text-3xl"
            style={{
              top: "4%",
              left: "-9%",
              opacity: 0.42,
              animation: "garden-cloud-drift 33s 20s linear infinite",
            }}
          >
            ☁️
          </div>
        )}

        {/* Butterflies — Stage 5 only */}
        {stage >= 5 &&
          [
            { top: "22%", left: "18%", size: "text-xl", dur: 8, d: 0 },
            { top: "12%", left: "55%", size: "text-lg", dur: 11, d: 4 },
            { top: "32%", left: "78%", size: "text-base", dur: 13, d: 7 },
          ].map((b, i) => (
            <div
              key={`bf-${i}`}
              className={`absolute ${b.size}`}
              style={{
                top: b.top,
                left: b.left,
                animation: `garden-butterfly ${b.dur}s ${b.d}s ease-in-out infinite`,
              }}
            >
              🦋
            </div>
          ))}

        {/* Sparkle particles — Stage 4+ */}
        {stage >= 4 &&
          [
            { top: "18%", left: "12%", d: 0 },
            { top: "28%", left: "42%", d: 1.5 },
            { top: "12%", left: "68%", d: 3 },
            { top: "38%", left: "88%", d: 0.8 },
            { top: "8%", left: "30%", d: 2.2 },
          ].map((s, i) => (
            <div
              key={`sp-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                top: s.top,
                left: s.left,
                background: "white",
                boxShadow: "0 0 6px rgba(255,255,255,0.9)",
                animation: `garden-sparkle 2.5s ${s.d}s ease-in-out infinite`,
              }}
            />
          ))}

        {/* ── Ground ── */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Grass */}
          <div
            className="relative"
            style={{
              height: "clamp(24px, 4vw, 34px)",
              background:
                "linear-gradient(180deg,transparent 0%,#4ade80 22%,#22c55e 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(87deg,transparent,transparent 6px,#16a34a 6px,#16a34a 7px),repeating-linear-gradient(93deg,transparent,transparent 10px,#15803d 10px,#15803d 11px)",
              }}
            />
          </div>
          {/* Soil */}
          <div
            style={{
              height: "clamp(28px, 4.5vw, 40px)",
              background: "linear-gradient(180deg,#92400e,#78350f 50%,#451a03)",
            }}
          >
            <div
              className="w-full h-full opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(circle 1.5px,#fbbf24 100%,transparent 100%)",
                backgroundSize: "18px 14px",
              }}
            />
          </div>
        </div>

        {/* ── Stage 0: Empty garden with sign ── */}
        {stage === 0 && (
          <>
            <div
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
              style={{
                bottom: "clamp(52px, 8.5vw, 72px)",
                animation: "garden-grow-in 0.9s 0.2s ease-out both",
              }}
            >
              <div
                className="px-4 py-2 rounded-lg"
                style={{
                  background: "linear-gradient(135deg,#d4a574,#c4956a)",
                  border: "2px solid #a3734c",
                  boxShadow: "2px 3px 0 #8b6338",
                }}
              >
                <p className="text-xs sm:text-sm font-bold text-amber-900 whitespace-nowrap">
                  씨앗을 심어볼까요? 🌱
                </p>
              </div>
              <div
                className="w-1.5 h-8 mx-auto rounded-b"
                style={{ background: "#8b6338" }}
              />
            </div>
            {/* Seeds in soil */}
            {[18, 38, 55, 72, 88].map((x, i) => (
              <div
                key={`seed-${i}`}
                className="absolute rounded-full"
                style={{
                  bottom: `${22 + (i % 3) * 4}px`,
                  left: `${x}%`,
                  width: 6,
                  height: 4,
                  background: "#92400e",
                  border: "1px solid #78350f",
                  animation: `garden-seed-peek 2.5s ${i * 0.5}s ease-in-out infinite`,
                }}
              />
            ))}
          </>
        )}

        {/* ── Growing flowers (stage 1+) ── */}
        {stage >= 1 &&
          observations.map((obs, i) => {
            const s = STRENGTH_MAP.get(obs.strengthId);
            if (!s) return null;

            const x = flowerX(i);
            const h = stemHeight(i, stage);
            const depth = i % 3; // 0=back 1=mid 2=front
            const sc = depth === 0 ? 0.72 : depth === 1 ? 0.88 : 1;
            const glow = CAT_GLOW[s.categoryId] ?? CAT_GLOW.temperance;
            const hasLeaf = stage >= 2 && i % 2 === 0;
            const leafSide = i % 4 < 2 ? "left" : "right";
            const flowerFont =
              stage >= 4
                ? "text-2xl sm:text-3xl"
                : stage >= 3
                  ? "text-xl sm:text-2xl"
                  : stage >= 2
                    ? "text-lg sm:text-xl"
                    : "text-sm sm:text-base";

            return (
              <div
                key={obs.id}
                className="absolute"
                style={{
                  bottom: `clamp(48px, 8vw, 68px)`,
                  left: `${x}%`,
                  zIndex: depth + 1,
                  transform: `scale(${sc})`,
                  transformOrigin: "bottom center",
                }}
              >
                {/* grow-in wrapper */}
                <div
                  style={{
                    animation: `garden-grow-in 0.65s ${i * 0.1}s ease-out both`,
                  }}
                >
                  {/* sway wrapper */}
                  <div
                    className="flex flex-col items-center"
                    style={{
                      animation: `garden-sway ${2.4 + (i % 8) * 0.25}s ${(i * 0.6) % 2.5}s ease-in-out infinite`,
                      transformOrigin: "bottom center",
                    }}
                  >
                    {/* Flower head */}
                    <div
                      className={`${flowerFont} leading-none text-center`}
                      style={{
                        filter:
                          stage >= 4 ? `drop-shadow(${glow})` : "none",
                      }}
                    >
                      {s.emoji}
                    </div>
                    {/* Stem */}
                    <div
                      className="relative"
                      style={{
                        width: 3,
                        height: h,
                        background:
                          "linear-gradient(to bottom,#86efac,#16a34a)",
                        borderRadius: 2,
                      }}
                    >
                      {/* Leaf */}
                      {hasLeaf && (
                        <div
                          className="absolute"
                          style={{
                            top: h * 0.38,
                            ...(leafSide === "left"
                              ? { left: -8 }
                              : { right: -8 }),
                            width: 11,
                            height: 5,
                            background: "#4ade80",
                            borderRadius:
                              leafSide === "left"
                                ? "5px 0 5px 0"
                                : "0 5px 0 5px",
                            transform:
                              leafSide === "left"
                                ? "rotate(-20deg)"
                                : "rotate(20deg)",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Stage badge */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
          <div
            className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold"
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              color: "#065f46",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            {cfg.emoji} {cfg.name}
          </div>
        </div>

        {/* Soft vignette */}
        <div
          className="absolute inset-0 pointer-events-none z-[5]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%,transparent 55%,rgba(0,0,0,0.06) 100%)",
          }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════
          LEVEL INDICATOR
          ══════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden rounded-2xl p-4 sm:p-5"
        style={{
          background: "linear-gradient(135deg,#ecfdf5,#d1fae5 55%,#a7f3d0)",
          border: "1px solid rgba(16,185,129,0.18)",
        }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle 1px,#065f46 100%,transparent 100%)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{cfg.emoji}</span>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-emerald-900">
                  정원 레벨 {stage}
                </h3>
                <p className="text-[11px] sm:text-xs text-emerald-600/80">
                  {cfg.label}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-emerald-700 leading-none">
                {count}
              </p>
              <p className="text-[10px] text-emerald-500 mt-0.5">기록</p>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="relative h-3.5 rounded-full overflow-hidden"
            style={{ background: "rgba(16,185,129,0.12)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
              style={{
                width: `${Math.max(pct, 6)}%`,
                background:
                  "linear-gradient(90deg,#6ee7b7,#10b981,#059669)",
              }}
            >
              {/* Shine sweep */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,white 50%,transparent)",
                  animation: "garden-shine 2.5s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          <p className="text-xs text-emerald-600 mt-2 text-center font-semibold">
            {stage >= 5
              ? "🎉 최고 레벨에 도달했어요!"
              : `다음 레벨까지 ${remaining}개 더! 💪`}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TOP 3 STRENGTHS — Gem Cards
          ══════════════════════════════════════════════════════════ */}
      {topStrengths.length > 0 ? (
        <div>
          <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
            <span>💎</span> 나의 보석 강점
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {topStrengths.map((sId, idx) => {
              const str = STRENGTH_MAP.get(sId);
              if (!str) return null;
              const gem = GEM_BG[str.categoryId] ?? DEFAULT_GEM;
              return (
                <div
                  key={sId}
                  className="relative rounded-xl p-3 sm:p-4 text-center overflow-hidden"
                  style={{
                    background: gem.bg,
                    border: `1.5px solid ${gem.border}`,
                    animation: `garden-grow-in 0.55s ${idx * 0.12}s ease-out both`,
                  }}
                >
                  {/* Sparkle top-right */}
                  <div
                    className="absolute w-[3px] h-[3px] rounded-full"
                    style={{
                      top: 5,
                      right: 7,
                      background: "white",
                      boxShadow: "0 0 4px rgba(255,255,255,0.9)",
                      animation: `garden-sparkle 2s ${idx * 0.4}s ease-in-out infinite`,
                    }}
                  />
                  {/* Sparkle bottom-left */}
                  <div
                    className="absolute w-[3px] h-[3px] rounded-full"
                    style={{
                      bottom: 8,
                      left: 5,
                      background: "white",
                      boxShadow: "0 0 4px rgba(255,255,255,0.9)",
                      animation: `garden-sparkle 2s ${idx * 0.4 + 1.2}s ease-in-out infinite`,
                    }}
                  />
                  <div
                    className="text-3xl sm:text-4xl mb-1.5 drop-shadow-sm"
                    style={{
                      animation: `garden-gem-float 3s ${idx * 0.35}s ease-in-out infinite`,
                    }}
                  >
                    {str.emoji}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {str.name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {str.categoryName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className="text-center py-6 rounded-xl border-2 border-dashed border-emerald-200"
          style={{
            background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
          }}
        >
          <p className="text-3xl mb-2">🌱</p>
          <p className="text-sm text-emerald-500">
            아직 강점이 등록되지 않았어요
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          RECENT FLOWERS — Horizontal Scroll
          ══════════════════════════════════════════════════════════ */}
      {observations.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
            <span>🌼</span> 보석 꽃 ({count})
          </h3>
          <div
            className="flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#a7f3d0 transparent",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {observations.slice(0, 12).map((obs, i) => {
              const str = STRENGTH_MAP.get(obs.strengthId);
              return (
                <div
                  key={obs.id}
                  className="flex-shrink-0 w-[110px] sm:w-[130px] rounded-xl p-2.5 text-center snap-start"
                  style={{
                    background:
                      "linear-gradient(145deg,rgba(255,255,255,0.92),rgba(236,253,245,0.9))",
                    border: "1px solid rgba(16,185,129,0.12)",
                    animation: `garden-grow-in 0.45s ${i * 0.06}s ease-out both`,
                  }}
                >
                  <div className="text-2xl mb-0.5">{str?.emoji ?? "💎"}</div>
                  <p className="text-[11px] font-semibold text-emerald-800 truncate">
                    {str?.name ?? "강점"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {obs.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          FULL OBSERVATION LIST
          ══════════════════════════════════════════════════════════ */}
      <div>
        <h3 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
          <span>📜</span> 기록 모음
        </h3>
        {observations.length === 0 ? (
          <div
            className="text-center py-10 rounded-xl"
            style={{
              background: "linear-gradient(135deg,#f0fdf4,#ecfdf5)",
              border: "1px solid rgba(16,185,129,0.12)",
            }}
          >
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-sm text-emerald-500 font-medium">
              아직 보석 꽃이 없어요
            </p>
            <p className="text-xs text-emerald-400 mt-1">곧 생길 거예요!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {observations.map((obs, i) => {
              const str = STRENGTH_MAP.get(obs.strengthId);
              const catId = str?.categoryId ?? "temperance";
              const accent = OBS_ACCENT[catId] ?? OBS_ACCENT.temperance;
              return (
                <Card
                  key={obs.id}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                  style={{
                    borderLeft: `3px solid ${accent}`,
                    animation: `garden-grow-in 0.35s ${i * 0.05}s ease-out both`,
                  }}
                >
                  <CardContent className="p-3.5 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0 mt-0.5">
                        {str?.emoji ?? "💎"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StrengthBadge
                            strengthId={obs.strengthId}
                            size="sm"
                          />
                          <span className="text-[10px] text-gray-400 font-medium">
                            {obs.writerRole === "teacher"
                              ? "👩‍🏫 선생님"
                              : obs.writerRole === "peer"
                                ? "👫 친구"
                                : "✏️ 나"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {obs.content}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1.5">
                          {obs.createdAt.toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CSS Keyframe Animations
   Prefixed with "garden-" to avoid global collisions
   ═══════════════════════════════════════════════════════════════ */
const CSS_KEYFRAMES = `
@keyframes garden-sway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes garden-cloud-drift {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(100vw + 80px)); }
}

@keyframes garden-pulse-glow {
  0%, 100% {
    box-shadow: 0 0 18px rgba(251,191,36,0.35), 0 0 36px rgba(251,191,36,0.15);
  }
  50% {
    box-shadow: 0 0 32px rgba(251,191,36,0.65), 0 0 64px rgba(251,191,36,0.25);
  }
}

@keyframes garden-grow-in {
  0% {
    transform: scale(0) translateY(8px);
    opacity: 0;
  }
  60% {
    transform: scale(1.06) translateY(-2px);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes garden-sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes garden-gem-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes garden-butterfly {
  0%   { transform: translate(0, 0) scaleX(1); }
  25%  { transform: translate(28px, -14px) scaleX(-1); }
  50%  { transform: translate(56px, 4px) scaleX(1); }
  75%  { transform: translate(28px, -8px) scaleX(-1); }
  100% { transform: translate(0, 0) scaleX(1); }
}

@keyframes garden-seed-peek {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes garden-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(250%); }
}

@keyframes garden-spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;
