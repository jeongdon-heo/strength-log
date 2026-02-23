"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllStudents, getAllObservations } from "@/lib/firestore";
import { UserProfile, Observation } from "@/lib/types";

import { useAuth } from "@/contexts/AuthContext";
import { Users, FileText, Clock, Loader2 } from "lucide-react";
import { StrengthBadge } from "@/components/strength/StrengthBadge";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [s, o] = await Promise.all([getAllStudents(user!.uid), getAllObservations(user!.uid)]);
        setStudents(s);
        setObservations(o);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const totalStudents = students.length;
  const totalRecords = observations.length;
  const pendingApprovals = observations.filter((o) => o.status === "pending").length;

  const getStudentObsCount = (uid: string) =>
    observations.filter((o) => o.targetId === uid).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-emerald-100/60">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-2.5 rounded-xl bg-emerald-100">
              <Users className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              <p className="text-xs text-gray-500">전체 학생</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-100/60">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-2.5 rounded-xl bg-blue-100">
              <FileText className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
              <p className="text-xs text-gray-500">전체 기록</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-100/60">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-2.5 rounded-xl bg-amber-100">
              <Clock className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingApprovals}</p>
              <p className="text-xs text-gray-500">승인 대기</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">학생 목록</h2>
        {students.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">등록된 학생이 없습니다</p>
              <p className="text-xs mt-1">설정에서 학생을 추가하세요</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map((student) => (
              <Card
                key={student.uid}
                className="hover:shadow-md transition-shadow border-gray-100"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-100 to-amber-50 flex items-center justify-center text-sm font-bold text-emerald-700 border border-emerald-100">
                        {student.studentNumber ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {student.studentNumber}번
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {getStudentObsCount(student.uid)}건
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {student.strengths.slice(0, 5).map((sId) => (
                      <StrengthBadge key={sId} strengthId={sId} size="sm" />
                    ))}
                    {student.strengths.length === 0 && (
                      <span className="text-xs text-gray-300">강점 미등록</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
