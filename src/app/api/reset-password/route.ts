import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { uid, newPassword } = await request.json();

    if (!uid || !newPassword) {
      return NextResponse.json(
        { error: "uid와 newPassword가 필요합니다." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const auth = getAdminAuth();
    await auth.updateUser(uid, { password: newPassword });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Password reset failed:", err);
    const message = err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
