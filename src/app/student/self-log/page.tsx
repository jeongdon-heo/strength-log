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
import { addObservation, getObservationsByWriter } from "@/lib/firestore";
import { Observation, ObservationCategory } from "@/lib/types";
import { StrengthPicker } from "@/components/strength/StrengthPicker";
import { StrengthBadge } from "@/components/strength/StrengthBadge";
import { Loader2, Send, Info } from "lucide-react";

const CATEGORIES: ObservationCategory[] = ["수업", "관계", "생활", "기타"];

export default function StudentSelfLogPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [myLogs, setMyLogs] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [selectedStrength, setSelectedStrength] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const logs = await getObservationsByWriter(user!.uid);
        setMyLogs(logs.filter((l) => l.writerRole === "self"));
      } catch (err) {
        console.error("Failed to load logs:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !profile) return;
    if (!selectedStrength || !selectedCategory || !content.trim()) {
      toast({ title: "모든 항목을 입력해주세요" });
      return;
    }

    setSubmitting(true);
    try {
      await addObservation({
        targetId: user.uid,
        writerId: user.uid,
        teacherId: profile.teacherId,
        writerRole: "self",
        writerName: profile.name,
        targetName: profile.name,
        category: selectedCategory as ObservationCategory,
        strengthId: selectedStrength,
        content: content.trim(),
        status: "pending",
      });
      toast({ title: "기록 완료!", description: "선생님 승인 후 정원에 추가됩니다." });
      setSelectedStrength("");
      setSelectedCategory("");
      setContent("");

      // Refresh
      const logs = await getObservationsByWriter(user.uid);
      setMyLogs(logs.filter((l) => l.writerRole === "self"));
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
    <div className="space-y-6">
      {/* Notice */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-800">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          선생님 승인 후 정원에 추가됩니다. 오늘 나의 강점이 빛났던 순간을 기록해보세요!
        </p>
      </div>

      {/* Form */}
      <Card className="border-emerald-100/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">오늘의 강점 기록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">나의 강점</Label>
            <StrengthPicker value={selectedStrength} onChange={setSelectedStrength} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">어떤 상황에서?</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="상황을 선택하세요" />
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

          <div className="space-y-2">
            <Label className="text-sm font-medium">어떻게 보여줬나요?</Label>
            <Textarea
              placeholder="오늘 이 강점이 발휘된 구체적인 상황을 적어보세요..."
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
            기록하기
          </Button>
        </CardContent>
      </Card>

      {/* Past logs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">나의 셀프 기록</h3>
        {myLogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            아직 셀프 기록이 없어요
          </p>
        ) : (
          <div className="space-y-2">
            {myLogs.map((log) => (
              <Card key={log.id} className="border-gray-100">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <StrengthBadge strengthId={log.strengthId} size="sm" />
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          log.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : log.status === "rejected"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {log.status === "approved"
                          ? "승인됨"
                          : log.status === "rejected"
                          ? "반려됨"
                          : "대기중"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {log.createdAt.toLocaleDateString("ko-KR")}
                      </span>
                    </div>
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
