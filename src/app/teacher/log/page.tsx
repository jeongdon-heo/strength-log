"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAllStudents, addObservation, getObservationsByWriter } from "@/lib/firestore";
import { UserProfile, Observation, ObservationCategory } from "@/lib/types";
import { StrengthPicker } from "@/components/strength/StrengthPicker";
import { StrengthBadge } from "@/components/strength/StrengthBadge";
import { Loader2, Send } from "lucide-react";

const CATEGORIES: ObservationCategory[] = ["수업", "관계", "생활", "기타"];

export default function TeacherLogPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [recentLogs, setRecentLogs] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedStrength, setSelectedStrength] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [s, logs] = await Promise.all([
          getAllStudents(user!.uid),
          getObservationsByWriter(user!.uid),
        ]);
        setStudents(s);
        setRecentLogs(logs);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !profile) return;
    if (!selectedStudent || !selectedStrength || !selectedCategory || !content.trim()) {
      toast({ title: "모든 항목을 입력해주세요" });
      return;
    }

    setSubmitting(true);
    try {
      const targetStudent = students.find((s) => s.uid === selectedStudent);
      await addObservation({
        targetId: selectedStudent,
        writerId: user.uid,
        teacherId: user.uid,
        writerRole: "teacher",
        writerName: profile.name,
        targetName: targetStudent?.name ?? "",
        category: selectedCategory as ObservationCategory,
        strengthId: selectedStrength,
        content: content.trim(),
        status: "approved",
      });
      toast({ title: "기록 완료!", description: "관찰 기록이 저장되었습니다." });
      setSelectedStudent("");
      setSelectedStrength("");
      setSelectedCategory("");
      setContent("");

      // Refresh recent logs
      const logs = await getObservationsByWriter(user.uid);
      setRecentLogs(logs);
    } catch (err) {
      console.error("Failed to submit:", err);
      toast({ title: "저장 실패", description: "다시 시도해주세요." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Observation form */}
      <Card className="border-emerald-100/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">새 관찰 기록 작성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Step 1: Select student */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold mr-1.5">
                1
              </span>
              학생 선택
            </Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="학생을 선택하세요" />
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

          {/* Step 2: Pick strength */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold mr-1.5">
                2
              </span>
              강점 선택
            </Label>
            <StrengthPicker value={selectedStrength} onChange={setSelectedStrength} />
          </div>

          {/* Step 3: Select category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold mr-1.5">
                3
              </span>
              관찰 영역
            </Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="영역을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 4: Write content */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold mr-1.5">
                4
              </span>
              관찰 내용
            </Label>
            <Textarea
              placeholder="학생의 강점이 발현된 구체적인 상황을 기록하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none border-gray-200 focus-visible:ring-emerald-500"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/15"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            기록 저장
          </Button>
        </CardContent>
      </Card>

      {/* Recent logs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">최근 기록</h3>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">아직 기록이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.slice(0, 10).map((log) => (
              <Card key={log.id} className="border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {log.targetName}
                      </span>
                      <StrengthBadge strengthId={log.strengthId} size="sm" />
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {log.createdAt.toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{log.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
