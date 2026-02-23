"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllStudents,
  getObservationsForStudent,
} from "@/lib/firestore";
import { UserProfile, Observation } from "@/lib/types";
import { STRENGTH_MAP } from "@/lib/strengths";

import { StrengthBadge } from "@/components/strength/StrengthBadge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles,
  Copy,
  Loader2,
  FileText,
  BookOpen,
  BarChart3,
} from "lucide-react";

const CATEGORY_HEX: Record<string, string> = {
  wisdom: "#3b82f6",
  courage: "#ef4444",
  humanity: "#ec4899",
  justice: "#f59e0b",
  temperance: "#22c55e",
  transcendence: "#a855f7",
};

export default function TeacherReportPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [observations, setObservations] = useState<Observation[]>([]);

  const [report, setReport] = useState("");
  const [exampleReport, setExampleReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingObs, setLoadingObs] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const s = await getAllStudents(user!.uid);
        setStudents(s);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // Load observations when student is selected
  useEffect(() => {
    setReport("");
    setExampleReport("");
    if (!selectedStudent) {
      setObservations([]);
      return;
    }
    async function loadObs() {
      setLoadingObs(true);
      try {
        const obs = await getObservationsForStudent(selectedStudent);
        setObservations(obs);
      } catch (err) {
        console.error("Failed to load observations:", err);
      } finally {
        setLoadingObs(false);
      }
    }
    loadObs();
  }, [selectedStudent]);


  // ─── Per-student peer gift stats ─────────────────────
  const studentGiftStats = useMemo(() => {
    const peerObs = observations.filter((o) => o.writerRole === "peer");
    const counts = new Map<string, number>();
    peerObs.forEach((o) => {
      counts.set(o.strengthId, (counts.get(o.strengthId) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([strengthId, count]) => ({
        strengthId,
        count,
        strength: STRENGTH_MAP.get(strengthId),
      }))
      .filter((item) => item.strength)
      .sort((a, b) => b.count - a.count);
  }, [observations]);

  const maxStudentGifts =
    studentGiftStats.length > 0 ? studentGiftStats[0].count : 0;

  const handleGenerate = async () => {
    if (!selectedStudent) return;

    const apiKey = localStorage.getItem("gemini-api-key");
    if (!apiKey) {
      toast({
        title: "API 키 필요",
        description: "설정에서 Gemini API 키를 등록해주세요.",
      });
      return;
    }

    const student = students.find((s) => s.uid === selectedStudent);
    if (!student) return;

    // Filter: teacher + approved peer records (exclude self)
    const relevantObs = observations.filter(
      (o) =>
        o.writerRole === "teacher" ||
        (o.writerRole === "peer" && o.status === "approved")
    );

    if (relevantObs.length === 0) {
      toast({
        title: "기록 부족",
        description: "교사 기록 또는 승인된 또래 기록이 필요합니다.",
      });
      return;
    }

    setGenerating(true);
    setReport("");
    setExampleReport("");

    const payload = {
      apiKey,
      studentName: student.name,
      observations: relevantObs.map((o) => ({
        content: o.content,
        writerRole: o.writerRole,
        strengthId: o.strengthId,
        category: o.category,
      })),
      strengths: student.strengths,
    };

    try {
      // 두 가지 모드를 병렬로 호출
      const [standardRes, exampleRes] = await Promise.all([
        fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, mode: "standard" }),
        }),
        fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, mode: "example-based" }),
        }),
      ]);

      const [standardData, exampleData] = await Promise.all([
        standardRes.json(),
        exampleRes.json(),
      ]);

      if (!standardRes.ok) {
        throw new Error(standardData.error || "기본 초안 생성 실패");
      }
      setReport(standardData.text);

      if (exampleRes.ok && exampleData.text) {
        setExampleReport(exampleData.text);
      }

      toast({
        title: "생성 완료!",
        description: "생기부 초안이 생성되었습니다.",
      });
    } catch (err) {
      console.error("Failed to generate report:", err);
      toast({
        title: "생성 실패",
        description:
          err instanceof Error ? err.message : "다시 시도해주세요.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "복사 완료!", description: "클립보드에 복사되었습니다." });
    } catch {
      toast({ title: "복사 실패", description: "수동으로 복사해주세요." });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const student = students.find((s) => s.uid === selectedStudent);
  const teacherObs = observations.filter((o) => o.writerRole === "teacher");
  const approvedPeerObs = observations.filter(
    (o) => o.writerRole === "peer" && o.status === "approved"
  );

  return (
    <div className="max-w-2xl space-y-6">
      {/* ─── Student Selection ─── */}
      <Card className="border-emerald-100/60">
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              학생 선택
            </label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="리포트를 생성할 학생을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.uid} value={s.uid}>
                    {s.studentNumber}번 {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!selectedStudent || generating}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                생기부 초안 생성
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ─── Per-Student Peer Gift Detail ─── */}
      {selectedStudent && studentGiftStats.length > 0 && (
        <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50/30 to-green-50/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              {student?.name} 강점 선물 상세
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {studentGiftStats.map(({ strengthId, count, strength }) => (
              <div key={strengthId} className="flex items-center gap-2.5">
                <span className="w-20 text-xs text-gray-700 shrink-0 flex items-center gap-1">
                  <span>{strength!.emoji}</span>
                  <span className="truncate">{strength!.name}</span>
                </span>
                <div className="flex-1 h-5 bg-white/60 rounded-full overflow-hidden border border-emerald-100/80">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${maxStudentGifts > 0 ? (count / maxStudentGifts) * 100 : 0}%`,
                      minWidth: "1.5rem",
                      backgroundColor:
                        CATEGORY_HEX[strength!.categoryId] || "#6b7280",
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-600 w-8 text-right shrink-0">
                  {count}건
                </span>
              </div>
            ))}
            <p className="text-[11px] text-gray-400 pt-1">
              * 또래 친구들이 선물한 강점별 횟수
            </p>
          </CardContent>
        </Card>
      )}

      {/* ─── Observation Summary ─── */}
      {selectedStudent && (
        <Card className="border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              {student?.name} 관찰 기록 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingObs ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>교사 기록: {teacherObs.length}건</p>
                  <p>승인된 또래 기록: {approvedPeerObs.length}건</p>
                </div>
                {observations.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {observations
                      .filter(
                        (o) =>
                          o.writerRole === "teacher" ||
                          (o.writerRole === "peer" && o.status === "approved")
                      )
                      .slice(0, 10)
                      .map((obs) => (
                        <div
                          key={obs.id}
                          className="text-xs p-2.5 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <StrengthBadge
                              strengthId={obs.strengthId}
                              size="sm"
                            />
                            <span className="text-gray-400">
                              {obs.writerRole === "teacher" ? "교사" : "또래"}
                            </span>
                          </div>
                          <p className="text-gray-600 line-clamp-2">
                            {obs.content}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Generated Report - Standard ─── */}
      {report && (
        <Card className="border-violet-200/60 bg-gradient-to-br from-violet-50/50 to-indigo-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" />
                생성된 생기부 초안
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(report)}
                className="h-7 text-xs border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                <Copy className="h-3 w-3 mr-1" />
                복사
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white/80 rounded-lg p-4 border border-violet-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {report}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">
              * AI가 생성한 초안이므로 반드시 검토 후 수정하여 사용하세요.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ─── Generated Report - Example-based ─── */}
      {exampleReport && (
        <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-600" />
                예시 기반 생기부 초안
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(exampleReport)}
                className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
              >
                <Copy className="h-3 w-3 mr-1" />
                복사
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white/80 rounded-lg p-4 border border-amber-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {exampleReport}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">
              * 30개 생기부 예시문의 문체·표현을 분석하여 생성한 초안입니다.
              검토 후 수정하여 사용하세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
