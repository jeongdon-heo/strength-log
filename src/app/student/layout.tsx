"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Flower2, BookOpen, Gift, BookMarked, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TAB_ITEMS = [
  { href: "/student", label: "나의 정원", icon: Flower2 },
  { href: "/student/self-log", label: "셀프 기록", icon: BookOpen },
  { href: "/student/peer-gift", label: "친구 선물", icon: Gift },
  { href: "/student/dictionary", label: "강점 사전", icon: BookMarked },
  { href: "/student/stats", label: "성장 기록", icon: BarChart3 },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "student")) {
      router.replace("/");
    }
  }, [loading, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50 to-amber-50/30">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-bounce">🌱</div>
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== "student") {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 to-amber-50/20 pb-20">
      {/* Top header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-emerald-100/50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <div>
              <h1 className="text-sm font-bold text-emerald-900">
                {profile.name}의 정원
              </h1>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="px-4 py-4 max-w-lg mx-auto">{children}</main>

      {/* Bottom tab navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-emerald-100/50 safe-area-pb">
        <div className="flex items-center justify-around max-w-lg mx-auto h-16">
          {TAB_ITEMS.map((item) => {
            const isActive =
              item.href === "/student"
                ? pathname === "/student"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-all",
                  isActive
                    ? "text-emerald-700"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-all",
                    isActive && "bg-emerald-100 shadow-sm"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isActive && "text-emerald-700"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive && "text-emerald-700"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
