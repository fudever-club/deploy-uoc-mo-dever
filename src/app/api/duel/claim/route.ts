import { NextRequest, NextResponse } from "next/server";
import { claimDuelReward } from "@/lib/duel-storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { codeOrId, rewardCode, phone } = body;
    const targetCode = (codeOrId || rewardCode || "").trim();

    if (!targetCode) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp mã đổi thưởng" },
        { status: 400 }
      );
    }

    const result = await claimDuelReward(targetCode, phone);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Không thể xác nhận đổi quà" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xác nhận đã trao quà thành công!",
      data: result.session,
    });
  } catch (err) {
    console.error("Claim reward API error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống khi xử lý đổi quà" },
      { status: 500 }
    );
  }
}
