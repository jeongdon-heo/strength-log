"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { getApprovedObservationsForStudent } from "@/lib/firestore";
import { Observation } from "@/lib/types";
import { STRENGTH_MAP } from "@/lib/strengths";
import { Loader2, BarChart3 } from "lucide-react";

export default function StudentStatsPage() {
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

  /* ── Card 1: strength counts ── */
  const strengthCounts = useMemo(() => {
    const counts = new Map<string, number>();
    observations.forEach((obs) => {
      counts.set(obs.strengthId, (counts.get(obs.strengthId) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([strengthId, count]) => ({
        strengthId,
        count,
        strength: STRENGTH_MAP.get(strengthId),
      }))
      .filter((item) => item.strength !== undefined)
      .sort((a, b) => b.count - a.count);
  }, [observations]);

  /* ── Card 2: writer role distribution ── */
  const roleCounts = useMemo(() => {
    const counts = { teacher: 0, peer: 0, self: 0 };
    observations.forEach((obs) => {
      if (obs.writerRole in counts) {
        counts[obs.writerRole]++;
      }
    });
    return counts;
  }, [observations]);

  /* ── Card 3: monthly growth (last 6 months) ── */
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: {
      label: string;
      count: number;
      month: number;
      year: number;
    }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: `${d.getMonth() + 1}월`,
        count: 0,
        month: d.getMonth(),
        year: d.getFullYear(),
      });
    }

    observations.forEach((obs) => {
      const m = obs.createdAt.getMonth();
      const y = obs.createdAt.getFullYear();
      const found = months.find(
        (item) => item.month === m && item.year === y,
      );
      if (found) found.count++;
    });

    return months;
  }, [observations]);

  /* ── Card 4: encouragement ── */
  const totalCount = observations.length;
  const encouragement = useMemo(() => {
    if (totalCount === 0) return "첫 번째 기록을 기다리고 있어요! 🌱";
    if (totalCount <= 5) return "좋은 시작이에요! 강점이 싹트고 있어요 🌿";
    if (totalCount <= 15)
      return "대단해요! 강점 정원이 무럭무럭 자라고 있어요 🌻";
    return "와! 정말 멋진 강점 정원이에요! 🌺🌸🌼";
  }, [totalCount]);

  /* ── Loading ── */
  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const maxStrengthCount = Math.max(
    ...strengthCounts.map((s) => s.count),
    1,
  );
  const maxMonthlyCount = Math.max(...monthlyData.map((m) => m.count), 1);
  const totalRoleCount =
    roleCounts.teacher + roleCounts.peer + roleCounts.self;

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <BarChart3 className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-emerald-900">
            나의 성장 기록
          </h2>
        </div>
        <p className="text-sm text-emerald-600/70">
          내 강점이 어떻게 자라고 있는지 살펴봐요
        </p>
      </div>

      {/* ── Card 1: 강점별 관찰 기록 (Horizontal Bar Chart) ── */}
      <Card className="border-emerald-100/60 bg-gradient-to-b from-white to-emerald-50/20">
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-emerald-800 mb-4">
            💪 강점별 관찰 기록
          </h3>
          {strengthCounts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              아직 기록이 없어요
            </p>
          ) : (
            <div className="space-y-2.5">
              {strengthCounts.map(({ strengthId, count, strength }) => (
                <div key={strengthId} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 w-20 flex-shrink-0">
                    <span className="text-lg">{strength!.emoji}</span>
                    <span className="text-xs font-medium text-emerald-700 truncate">
                      {strength!.name}
                    </span>
                  </div>
                  <div className="flex-1 h-7 bg-emerald-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${(count / maxStrengthCount) * 100}%`,
                        minWidth: "16px",
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-emerald-700 w-6 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card 2: 누가 발견했을까? (Writer Role Distribution) ── */}
      <Card className="border-emerald-100/60 bg-gradient-to-b from-white to-emerald-50/20">
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-emerald-800 mb-4">
            🔍 누가 발견했을까?
          </h3>
          {totalRoleCount === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              아직 기록이 없어요
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {/* Teacher */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-2xl shadow-sm">
                  👨‍🏫
                </div>
                <span className="text-xs font-semibold text-violet-700">
                  선생님
                </span>
                <span className="text-xl font-bold text-violet-800">
                  {roleCounts.teacher}
                </span>
                <span className="text-[10px] text-violet-500">
                  {totalRoleCount > 0
                    ? `${Math.round((roleCounts.teacher / totalRoleCount) * 100)}%`
                    : "0%"}
                </span>
              </div>
              {/* Peer */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl shadow-sm">
                  👫
                </div>
                <span className="text-xs font-semibold text-amber-700">
                  친구
                </span>
                <span className="text-xl font-bold text-amber-800">
                  {roleCounts.peer}
                </span>
                <span className="text-[10px] text-amber-500">
                  {totalRoleCount > 0
                    ? `${Math.round((roleCounts.peer / totalRoleCount) * 100)}%`
                    : "0%"}
                </span>
              </div>
              {/* Self */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl shadow-sm">
                  🙋
                </div>
                <span className="text-xs font-semibold text-emerald-700">
                  나
                </span>
                <span className="text-xl font-bold text-emerald-800">
                  {roleCounts.self}
                </span>
                <span className="text-[10px] text-emerald-500">
                  {totalRoleCount > 0
                    ? `${Math.round((roleCounts.self / totalRoleCount) * 100)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Card 3: 월별 성장 그래프 (Vertical Bar Chart) ── */}
      <Card className="border-emerald-100/60 bg-gradient-to-b from-white to-emerald-50/20">
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-emerald-800 mb-4">
            📈 월별 성장 그래프
          </h3>
          <div className="flex items-end justify-between gap-1.5 px-1">
            {monthlyData.map((item, idx) => {
              const barHeight =
                item.count > 0
                  ? Math.max((item.count / maxMonthlyCount) * 96, 12)
                  : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center"
                >
                  {/* Count label */}
                  <span className="text-xs font-bold text-emerald-700 mb-1 h-4">
                    {item.count > 0 ? item.count : ""}
                  </span>
                  {/* Bar area */}
                  <div className="w-full flex justify-center items-end h-24">
                    {item.count > 0 ? (
                      <div
                        className="w-full max-w-[2rem] bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-lg transition-all duration-700 ease-out"
                        style={{ height: `${barHeight}px` }}
                      />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-emerald-200 mb-0.5" />
                    )}
                  </div>
                  {/* Month label */}
                  <span className="text-[11px] text-emerald-600 mt-1.5 font-medium">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Card 4: 격려 메시지 (Encouragement) ── */}
      <Card className="border-0 bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-amber-50 shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3">
            {totalCount === 0
              ? "🌱"
              : totalCount <= 5
                ? "🌿"
                : totalCount <= 15
                  ? "🌻"
                  : "🌺"}
          </div>
          <div className="text-3xl font-black text-emerald-800 mb-2">
            {totalCount}
            <span className="text-base font-medium text-emerald-600 ml-1">
              개의 기록
            </span>
          </div>
          <p className="text-sm text-emerald-700 font-medium leading-relaxed">
            {encouragement}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
