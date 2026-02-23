"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { setUser } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { profile, loading } = useAuth();
  const router = useRouter();

  // If already logged in, redirect based on role
  if (!loading && profile) {
    if (profile.role === "teacher") {
      router.replace("/teacher");
    } else {
      router.replace("/student");
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setUser({
        uid: cred.user.uid,
        name: name.trim(),
        email,
        role: "teacher",
        strengths: [],
        gardenLevel: 0,
      });
      router.replace("/teacher");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/email-already-in-use") {
        setError("이미 사용 중인 이메일입니다.");
      } else if (code === "auth/invalid-email") {
        setError("올바른 이메일 형식이 아닙니다.");
      } else if (code === "auth/weak-password") {
        setError("비밀번호가 너무 약합니다. 6자 이상 입력해주세요.");
      } else {
        setError("회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-amber-50 to-sky-50">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-bounce">🌱</div>
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-amber-50/60 to-sky-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-amber-200/25 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl" />
        <div className="absolute top-[15%] left-[10%] text-4xl opacity-20 animate-pulse">🌿</div>
        <div className="absolute top-[60%] right-[12%] text-3xl opacity-15 animate-pulse" style={{ animationDelay: "1s" }}>🌸</div>
        <div className="absolute bottom-[20%] left-[20%] text-3xl opacity-15 animate-pulse" style={{ animationDelay: "2s" }}>🍃</div>
      </div>

      <Card className="w-full max-w-md mx-4 shadow-2xl shadow-emerald-900/5 border-emerald-100/60 backdrop-blur-sm bg-white/80 relative z-10">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 relative">
            <div className="text-6xl mb-2 drop-shadow-sm">🌿</div>
            <div className="absolute -inset-4 bg-emerald-400/10 rounded-full blur-xl -z-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-900">
            교사 회원가입
          </h1>
          <p className="text-sm text-emerald-600/80 mt-1 font-medium">
            강점 로그 2.0 교사 계정 만들기
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-emerald-800 text-sm font-medium">
                이름
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="선생님 이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 border-emerald-200 focus-visible:ring-emerald-500 bg-white/70 placeholder:text-emerald-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-emerald-800 text-sm font-medium">
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-emerald-200 focus-visible:ring-emerald-500 bg-white/70 placeholder:text-emerald-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-emerald-800 text-sm font-medium">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호 (6자 이상)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-emerald-200 focus-visible:ring-emerald-500 bg-white/70 placeholder:text-emerald-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="text-emerald-800 text-sm font-medium">
                비밀번호 확인
              </Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className="h-11 border-emerald-200 focus-visible:ring-emerald-500 bg-white/70 placeholder:text-emerald-300"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50/80 rounded-lg px-3 py-2 border border-red-100">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                "회원가입"
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}