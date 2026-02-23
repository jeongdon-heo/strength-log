"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  PenLine,
  CheckCircle,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/teacher", label: "대시보드", icon: LayoutDashboard },
  { href: "/teacher/diagnosis", label: "강점 진단하기", icon: ClipboardCheck },
  { href: "/teacher/log", label: "관찰 기록", icon: PenLine },
  { href: "/teacher/approval", label: "승인함", icon: CheckCircle },
  { href: "/teacher/report", label: "AI 리포트", icon: Sparkles },
  { href: "/teacher/settings", label: "설정", icon: Settings },
];

function getPageTitle(pathname: string): string {
  const item = NAV_ITEMS.find((item) =>
    item.href === "/teacher"
      ? pathname === "/teacher"
      : pathname.startsWith(item.href)
  );
  return item?.label ?? "강점 로그";
}

function SidebarContent({
  pathname,
  profileName,
  onSignOut,
  onNavigate,
}: {
  pathname: string;
  profileName: string;
  onSignOut: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="text-2xl">🌱</span>
        <div>
          <h2 className="text-sm font-bold text-emerald-900 tracking-tight">
            강점 로그 2.0
          </h2>
          <p className="text-[11px] text-emerald-600/70">교사 대시보드</p>
        </div>
      </div>
      <Separator className="bg-emerald-100" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/teacher"
                ? pathname === "/teacher"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-emerald-100/80 text-emerald-900 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4.5 w-4.5",
                    isActive ? "text-emerald-700" : "text-gray-400"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="border-t border-emerald-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
            {profileName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profileName}
            </p>
            <p className="text-[11px] text-gray-500">교사</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!profile || profile.role !== "teacher")) {
      router.replace("/");
    }
  }, [loading, profile, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!profile || profile.role !== "teacher") {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-emerald-100/60 bg-white/80 backdrop-blur-sm">
        <SidebarContent
          pathname={pathname}
          profileName={profile.name}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 lg:px-6">
          {/* Mobile menu */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden -ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">내비게이션 메뉴</SheetTitle>
              <SidebarContent
                pathname={pathname}
                profileName={profile.name}
                onSignOut={handleSignOut}
                onNavigate={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
