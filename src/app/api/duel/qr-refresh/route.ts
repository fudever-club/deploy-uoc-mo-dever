import { NextRequest, NextResponse } from "next/server";
import { refreshRewardTokenInStorage } from "@/lib/duel-storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Thiếu sessionId" },
        { status: 400 }
      );
    }

    const session = await refreshRewardTokenInStorage(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy session hoặc session đã đổi quà" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Tạo lại mã đổi thưởng thành công",
      data: {
        rewardCode: session.rewardCode,
        reward_code: session.rewardCode,
        rewardCodeExpiresAt: session.rewardCodeExpiresAt,
        reward_code_expires_at: session.rewardCodeExpiresAt,
      },
    });
  } catch (err) {
    console.error("QR refresh API error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống khi tạo lại mã QR" },
      { status: 500 }
    );
  }
}
