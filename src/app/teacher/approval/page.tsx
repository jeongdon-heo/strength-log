"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPendingObservations, updateObservationStatus } from "@/lib/firestore";
import { Observation } from "@/lib/types";
import { StrengthBadge } from "@/components/strength/StrengthBadge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, XCircle, Inbox, Loader2 } from "lucide-react";

export default function TeacherApprovalPage() {
  const { user } = useAuth();
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPending = async () => {
    if (!user) return;
    try {
      const data = await getPendingObservations(user.uid);
      setObservations(data);
    } catch (err) {
      console.error("Failed to load pending observations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, [user]);

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    setProcessingId(id);
    try {
      await updateObservationStatus(id, action);
      setObservations((prev) => prev.filter((o) => o.id !== id));
      toast({
        title: action === "approved" ? "승인 완료" : "반려 완료",
        description:
          action === "approved"
            ? "기록이 승인되어 정원에 추가됩니다."
            : "기록이 반려되었습니다.",
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      toast({ title: "처리 실패", description: "다시 시도해주세요." });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (observations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="p-4 rounded-full bg-gray-50 mb-4">
          <Inbox className="h-12 w-12 opacity-50" />
        </div>
        <p className="text-base font-medium text-gray-500">승인 대기 중인 기록이 없습니다</p>
        <p className="text-sm mt-1">학생들의 셀프 기록이나 또래 선물이 이곳에 표시됩니다</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        총 <span className="font-semibold text-emerald-700">{observations.length}</span>건의 기록이 승인을 기다리고 있습니다
      </p>

      {observations.map((obs) => {
        const isProcessing = processingId === obs.id;
        const writerLabel =
          obs.writerRole === "self" ? "본인 기록" : "또래 선물";

        return (
          <Card key={obs.id} className="border-gray-100 hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {writerLabel}
                    </span>
                    <StrengthBadge strengthId={obs.strengthId} size="sm" />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium text-gray-900">{obs.writerName}</span>
                    {obs.writerRole === "peer" && (
                      <>
                        {" → "}
                        <span className="font-medium text-gray-900">{obs.targetName}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{obs.content}</p>
                  <p className="text-[11px] text-gray-400 mt-2">
                    {obs.createdAt.toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleAction(obs.id, "approved")}
                    disabled={isProcessing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs px-3"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        승인
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(obs.id, "rejected")}
                    disabled={isProcessing}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-8 text-xs px-3"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    반려
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
