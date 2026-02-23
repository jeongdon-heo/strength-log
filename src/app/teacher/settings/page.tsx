"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getAllStudents, setUser, deleteStudent, updateUserGardenLevel } from "@/lib/firestore";
import { UserProfile } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { StrengthBadge } from "@/components/strength/StrengthBadge";
import { StrengthPicker } from "@/components/strength/StrengthPicker";
import { useToast } from "@/hooks/use-toast";
import { Key, UserPlus, Users, Loader2, Save, RotateCcw, Mail, Lock, Trash2, AlertTriangle, Pencil, Sprout, Minus, Plus } from "lucide-react";

export default function TeacherSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Add student form
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newStrengths, setNewStrengths] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [resetStudent, setResetStudent] = useState<UserProfile | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [editStrengths, setEditStrengths] = useState<string[]>([]);
  const [savingStrengths, setSavingStrengths] = useState(false);

  useEffect(() => {
    // Load API key from localStorage
    const savedKey = localStorage.getItem("gemini-api-key");
    if (savedKey) setApiKey(savedKey);

    // Load students
    async function load() {
      if (!user) return;
      try {
        const s = await getAllStudents(user.uid);
        setStudents(s);
      } catch (err) {
        console.error("Failed to load students:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("gemini-api-key", apiKey);
    toast({ title: "저장 완료", description: "API 키가 저장되었습니다." });
  };

  const handleAddStrength = (strengthId: string) => {
    if (newStrengths.includes(strengthId)) {
      setNewStrengths(newStrengths.filter((s) => s !== strengthId));
    } else {
      setNewStrengths([...newStrengths, strengthId]);
    }
  };

  const handleAddStudent = async () => {
    if (!newName.trim() || !newNumber.trim()) {
      toast({ title: "이름과 번호를 입력해주세요" });
      return;
    }
    const num = parseInt(newNumber, 10);
    if (isNaN(num) || num < 1) {
      toast({ title: "올바른 번호를 입력해주세요" });
      return;
    }
    if (students.some((s) => s.studentNumber === num)) {
      toast({ title: "중복된 번호", description: `${num}번은 이미 등록된 번호입니다.` });
      return;
    }

    const email = newEmail.trim() || `student${num}@school.com`;
    const password = newPassword || "school1234";

    if (password.length < 6) {
      toast({ title: "비밀번호 오류", description: "비밀번호는 6자 이상이어야 합니다." });
      return;
    }
    setAdding(true);
    try {
      // Create Firebase Auth account via secondary app (avoids logging out teacher)
      const { initializeApp, deleteApp } = await import("firebase/app");
      const { getAuth, createUserWithEmailAndPassword } = await import("firebase/auth");
      const { firebaseConfig } = await import("@/lib/firebase");

      const secondaryApp = initializeApp(firebaseConfig, `temp-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);

      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const uid = cred.user.uid;

      await deleteApp(secondaryApp);
      const newStudent: UserProfile = {
        uid,
        name: newName.trim(),
        email,
        role: "student",
        teacherId: user?.uid,
        studentNumber: num,
        strengths: newStrengths,
        gardenLevel: 0,
      };
      await setUser(newStudent);
      setStudents((prev) => [...prev, newStudent].sort((a, b) => (a.studentNumber ?? 0) - (b.studentNumber ?? 0)));
      setNewName("");
      setNewNumber("");
      setNewEmail("");
      setNewPassword("");
      setNewStrengths([]);
      toast({
        title: "학생 추가 완료",
        description: `${newStudent.name} (${email}) — 계정이 자동 생성되었습니다.`,
      });
    } catch (err: unknown) {
      console.error("Failed to add student:", err);
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        toast({ title: "중복된 이메일", description: "이미 사용 중인 이메일입니다." });
      } else if (code === "auth/invalid-email") {
        toast({ title: "이메일 오류", description: "올바른 이메일 형식이 아닙니다." });
      } else {
        toast({ title: "추가 실패", description: "다시 시도해주세요." });
      }
    } finally {
      setAdding(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetStudent) return;
    if (resetPassword.length < 6) {
      toast({ title: "비밀번호 오류", description: "비밀번호는 6자 이상이어야 합니다." });
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: resetStudent.uid, newPassword: resetPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: "비밀번호 변경 완료",
        description: `${resetStudent.name} 학생의 비밀번호가 변경되었습니다.`,
      });
      setResetStudent(null);
      setResetPassword("");
    } catch (err: unknown) {
      console.error("Password reset failed:", err);
      const message = err instanceof Error ? err.message : "다시 시도해주세요.";
      toast({ title: "비밀번호 변경 실패", description: message });
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    setDeleting(true);
    try {
      await deleteStudent(deletingStudent.uid);
      setStudents((prev) => prev.filter((s) => s.uid !== deletingStudent.uid));
      toast({
        title: "삭제 완료",
        description: `${deletingStudent.name} 학생의 모든 데이터가 삭제되었습니다.`,
      });
    } catch (err) {
      console.error("Failed to delete student:", err);
      toast({ title: "삭제 실패", description: "다시 시도해주세요." });
    } finally {
      setDeleting(false);
      setDeletingStudent(null);
    }
  };


  const handleEditStrength = (strengthId: string) => {
    if (editStrengths.includes(strengthId)) {
      setEditStrengths(editStrengths.filter((s) => s !== strengthId));
    } else {
      setEditStrengths([...editStrengths, strengthId]);
    }
  };

  const handleSaveStrengths = async () => {
    if (!editingStudent) return;
    setSavingStrengths(true);
    try {
      const updated: UserProfile = { ...editingStudent, strengths: editStrengths };
      await setUser(updated);
      setStudents((prev) =>
        prev.map((s) => (s.uid === editingStudent.uid ? updated : s))
      );
      toast({
        title: "강점 수정 완료",
        description: `${editingStudent.name} 학생의 강점이 저장되었습니다.`,
      });
      setEditingStudent(null);
    } catch (err) {
      console.error("Failed to update strengths:", err);
      toast({ title: "수정 실패", description: "다시 시도해주세요." });
    } finally {
      setSavingStrengths(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Gemini API Key */}
      <Card className="border-violet-100/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-violet-600" />
            Gemini API 키
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">
              AI 리포트 생성에 사용할 Google Gemini API 키를 입력하세요
            </Label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="API 키를 입력하세요"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 border-violet-200 focus-visible:ring-violet-500"
              />
              <Button
                onClick={handleSaveApiKey}
                className="bg-violet-600 hover:bg-violet-700 text-white flex-shrink-0"
              >
                <Save className="h-4 w-4 mr-1.5" />
                저장
              </Button>
            </div>
            <p className="text-[11px] text-gray-400">
              * API 키는 브라우저의 localStorage에 저장됩니다.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Student management */}
      <Card className="border-emerald-100/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-emerald-600" />
            학생 추가
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">이름</Label>
              <Input
                placeholder="홍길동"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border-gray-200 focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">번호</Label>
              <Input
                type="number"
                placeholder="1"
                min="1"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                className="border-gray-200 focus-visible:ring-emerald-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1"><Mail className="h-3 w-3" />아이디 (이메일)</Label>
              <Input
                type="email"
                placeholder={newNumber ? `student${newNumber}@school.com` : "student1@school.com"}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="border-gray-200 focus-visible:ring-emerald-500"
              />
              <p className="text-[10px] text-gray-400">비워두면 student{"{\ubc88\ud638}"}@school.com</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1"><Lock className="h-3 w-3" />비밀번호</Label>
              <Input
                type="text"
                placeholder="school1234"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border-gray-200 focus-visible:ring-emerald-500"
              />
              <p className="text-[10px] text-gray-400">비워두면 school1234 (최소 6자)</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">대표 강점 선택 (선택사항)</Label>
            {newStrengths.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {newStrengths.map((sId) => (
                  <button
                    key={sId}
                    type="button"
                    onClick={() => handleAddStrength(sId)}
                    className="cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <StrengthBadge strengthId={sId} size="sm" />
                  </button>
                ))}
              </div>
            )}
            <StrengthPicker
              value={undefined}
              onChange={handleAddStrength}
            />
          </div>
          <Button
            onClick={handleAddStudent}
            disabled={adding}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {adding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            학생 추가 (계정 자동 생성)
          </Button>
        </CardContent>
      </Card>

      {/* Student list */}
      <Card className="border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            등록된 학생 ({students.length}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              아직 등록된 학생이 없습니다
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-10">
                      번호
                    </th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 whitespace-nowrap">
                      이름
                    </th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />아이디</span>
                    </th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">
                      강점
                    </th>
                    <th className="text-center px-3 py-2 text-xs font-medium text-gray-500 w-16">
                      <span className="flex items-center justify-center gap-1"><Sprout className="h-3 w-3" />레벨</span>
                    </th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-gray-500">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.uid} className="border-b last:border-b-0 hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 text-gray-600">
                        {s.studentNumber}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-900 whitespace-nowrap">
                        {s.name}
                      </td>
                      <td className="px-3 py-2.5">
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                          {s.email || `student${s.studentNumber}@school.com`}
                        </code>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1 items-center">
                          {s.strengths.map((sId) => (
                            <StrengthBadge key={sId} strengthId={sId} size="sm" />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStudent(s);
                              setEditStrengths([...s.strengths]);
                            }}
                            className="inline-flex items-center gap-0.5 text-[10px] text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded px-1.5 py-0.5 transition-colors"
                          >
                            <Pencil className="h-2.5 w-2.5" />
                            {s.strengths.length === 0 ? "추가" : "수정"}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={async () => {
                              const newLevel = Math.max((s.gardenLevel ?? 0) - 1, 0);
                              await updateUserGardenLevel(s.uid, newLevel);
                              setStudents((prev) => prev.map((st) => st.uid === s.uid ? { ...st, gardenLevel: newLevel } : st));
                            }}
                            disabled={(s.gardenLevel ?? 0) <= 0}
                            className="h-5 w-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-semibold text-emerald-700 w-6 text-center">
                            {s.gardenLevel ?? 0}
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              const newLevel = Math.min((s.gardenLevel ?? 0) + 1, 10);
                              await updateUserGardenLevel(s.uid, newLevel);
                              setStudents((prev) => prev.map((st) => st.uid === s.uid ? { ...st, gardenLevel: newLevel } : st));
                            }}
                            disabled={(s.gardenLevel ?? 0) >= 10}
                            className="h-5 w-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setResetStudent(s);
                            setResetPassword("");
                          }}
                          className="h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          비밀번호 변경
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingStudent(s)}
                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 ml-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          삭제
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingStudent} onOpenChange={(open) => !open && setDeletingStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              학생 삭제
            </DialogTitle>
            <DialogDescription className="text-left space-y-2">
              <span className="block font-semibold text-gray-900">
                {deletingStudent?.studentNumber}번 {deletingStudent?.name} 학생을 삭제하시겠습니까?
              </span>
              <span className="block text-red-600 font-medium">
                ⚠️ 이 학생의 모든 관찰 기록, 강점 데이터가 영구적으로 삭제됩니다.
              </span>
              <span className="block text-gray-500">
                이 작업은 되돌릴 수 없습니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingStudent(null)}
              disabled={deleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStudent}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              삭제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Password reset dialog */}
      <Dialog open={!!resetStudent} onOpenChange={(open) => !open && setResetStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Lock className="h-5 w-5" />
              비밀번호 변경 — {resetStudent?.studentNumber}번 {resetStudent?.name}
            </DialogTitle>
            <DialogDescription>
              새 비밀번호를 입력하면 즉시 변경됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">새 비밀번호</Label>
              <Input
                type="text"
                placeholder="새 비밀번호 입력 (최소 6자)"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="border-orange-200 focus-visible:ring-orange-500"
              />
              <p className="text-[10px] text-gray-400">최소 6자 이상 입력해주세요</p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setResetStudent(null)}
              disabled={resetting}
            >
              취소
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetting || resetPassword.length < 6}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {resetting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <RotateCcw className="h-4 w-4 mr-1.5" />
              )}
              변경하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit strengths dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-violet-700">
              <Pencil className="h-5 w-5" />
              강점 수정 — {editingStudent?.studentNumber}번 {editingStudent?.name}
            </DialogTitle>
            <DialogDescription>
              대표 강점을 선택하거나 수정하세요. 클릭하여 추가/제거할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {editStrengths.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {editStrengths.map((sId) => (
                  <button
                    key={sId}
                    type="button"
                    onClick={() => handleEditStrength(sId)}
                    className="cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <StrengthBadge strengthId={sId} size="sm" />
                  </button>
                ))}
              </div>
            )}
            {editStrengths.length === 0 && (
              <p className="text-sm text-gray-400">아래에서 강점을 선택해주세요</p>
            )}
            <StrengthPicker
              value={undefined}
              onChange={handleEditStrength}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditingStudent(null)}
              disabled={savingStrengths}
            >
              취소
            </Button>
            <Button
              onClick={handleSaveStrengths}
              disabled={savingStrengths}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {savingStrengths ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
