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
import { getAllStudents, addObservation } from "@/lib/firestore";
import { UserProfile, ObservationCategory } from "@/lib/types";
import { StrengthPicker } from "@/components/strength/StrengthPicker";
import { Loader2, Gift, Info, Send } from "lucide-react";

export default function StudentPeerGiftPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form
  const [selectedClassmate, setSelectedClassmate] = useState("");
  const [selectedStrength, setSelectedStrength] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const s = await getAllStudents(profile?.teacherId);
        // Filter out self
        setStudents(s.filter((st) => st.uid !== user?.uid));
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user && profile) load();
  }, [user, profile]);

  const handleSubmit = async () => {
    if (!user || !profile) return;
    if (!selectedClassmate || !selectedStrength || !content.trim()) {
      toast({ title: "모든 항목을 입력해주세요" });
      return;
    }

    setSubmitting(true);
    try {
      const target = students.find((s) => s.uid === selectedClassmate);
      await addObservation({
        targetId: selectedClassmate,
        writerId: user.uid,
        teacherId: profile.teacherId,
        writerRole: "peer",
        writerName: profile.name,
        targetName: target?.name ?? "",
        category: "관계" as ObservationCategory,
        strengthId: selectedStrength,
        content: content.trim(),
        status: "pending",
      });

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      toast({
        title: "선물 완료! 🎁",
        description: "선생님 승인 후 친구 정원에 추가됩니다.",
      });
      setSelectedClassmate("");
      setSelectedStrength("");
      setContent("");
    } catch (err) {
      console.error("Failed to submit:", err);
      toast({ title: "전송 실패", description: "다시 시도해주세요." });
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
      {/* Success animation overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
          <div className="text-7xl animate-bounce">🎁</div>
        </div>
      )}

      {/* Notice */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-pink-50 border border-pink-200/60 text-pink-800">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed">
          선생님 승인 후 친구 정원에 추가됩니다. 친구의 강점을 발견해 선물해보세요!
        </p>
      </div>

      {/* Form */}
      <Card className="border-pink-100/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-4 w-4 text-pink-600" />
            친구에게 강점 선물하기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">누구에게?</Label>
            <Select value={selectedClassmate} onValueChange={setSelectedClassmate}>
              <SelectTrigger>
                <SelectValue placeholder="친구를 선택하세요" />
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

          <div className="space-y-2">
            <Label className="text-sm font-medium">어떤 강점을?</Label>
            <StrengthPicker value={selectedStrength} onChange={setSelectedStrength} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">응원 메시지</Label>
            <Textarea
              placeholder="친구의 이 강점이 빛났던 순간을 적어주세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none border-gray-200 focus-visible:ring-pink-500"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/15"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            선물 보내기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
