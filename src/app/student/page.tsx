"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { getApprovedObservationsForStudent } from "@/lib/firestore";
import { Observation } from "@/lib/types";
import { STRENGTH_MAP } from "@/lib/strengths";
import { StrengthBadge } from "@/components/strength/StrengthBadge";
import { Loader2 } from "lucide-react";

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
  const gardenLevel = profile.gardenLevel ?? 0;
  const maxLevel = 10;
  const progressPercent = Math.min((gardenLevel / maxLevel) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Garden header */}
      <div className="text-center py-4">
        <h2 className="text-xl font-bold text-emerald-900 mb-1">
          나의 강점 정원
        </h2>
        <p className="text-sm text-emerald-600/70">
          {profile.name}의 특별한 강점들이 자라고 있어요
        </p>
      </div>

      {/* Top 3 strengths */}
      {topStrengths.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {topStrengths.map((sId, idx) => {
            const strength = STRENGTH_MAP.get(sId);
            if (!strength) return null;
            return (
              <Card
                key={sId}
                className="border-emerald-100/60 bg-gradient-to-b from-white to-emerald-50/30 hover:shadow-md transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                  <div
                    className="text-4xl mb-2 drop-shadow-sm"
                    style={{
                      animationDelay: `${idx * 150}ms`,
                    }}
                  >
                    {strength.emoji}
                  </div>
                  <p className="text-xs font-semibold text-emerald-800">
                    {strength.name}
                  </p>
                  <p className="text-[10px] text-emerald-600/60 mt-0.5">
                    {strength.categoryName}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {topStrengths.length === 0 && (
        <Card className="border-dashed border-emerald-200">
          <CardContent className="text-center py-8 text-emerald-400 text-sm">
            아직 강점이 등록되지 않았어요
          </CardContent>
        </Card>
      )}

      {/* Garden level */}
      <Card className="border-emerald-100/60">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-800">
              정원 레벨
            </span>
            <span className="text-sm font-bold text-emerald-700">
              Lv.{gardenLevel}
            </span>
          </div>
          <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-emerald-500/70 mt-1.5">
            승인된 기록이 쌓이면 정원이 성장해요 🌿
          </p>
        </CardContent>
      </Card>

      {/* Approved observations as flower cards */}
      <div>
        <h3 className="text-sm font-semibold text-emerald-800 mb-3">
          보석 꽃 ({observations.length})
        </h3>
        {observations.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            아직 보석 꽃이 없어요. 곧 생길 거예요!
          </p>
        ) : (
          <div className="space-y-2.5">
            {observations.map((obs) => {
              const strength = STRENGTH_MAP.get(obs.strengthId);
              return (
                <Card
                  key={obs.id}
                  className="border-emerald-100/40 bg-gradient-to-r from-white to-emerald-50/20 hover:shadow-sm transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0 mt-0.5">
                        {strength?.emoji ?? "💎"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StrengthBadge strengthId={obs.strengthId} size="sm" />
                          <span className="text-[10px] text-gray-400">
                            {obs.writerRole === "teacher"
                              ? "선생님"
                              : obs.writerRole === "peer"
                              ? "친구"
                              : "나"}
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
