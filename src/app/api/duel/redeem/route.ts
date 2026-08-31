import { NextRequest, NextResponse } from "next/server";
import {
  claimDuelReward,
  refreshRewardTokenInStorage,
  getDuelSessionByRewardCode,
} from "@/lib/duel-storage";

// POST /api/duel/redeem -> Verify and Claim Reward OR Refresh Token
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, rewardCode, sessionId, phone } = body;

    // Action 1: Refresh Expired Token (called from Mobile /duel screen)
    if (action === "refresh") {
      if (!sessionId) {
        return NextResponse.json(
          { success: false, error: "Thiếu session ID để tạo lại mã" },
          { status: 400 }
        );
      }
      const refreshed = await refreshRewardTokenInStorage(sessionId);
      if (!refreshed) {
        return NextResponse.json(
          { success: false, error: "Không thể tạo lại mã cho phiên này" },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        data: {
          rewardCode: refreshed.rewardCode,
          rewardCodeExpiresAt: refreshed.rewardCodeExpiresAt,
        },
      });
    }

    // Action 2: Check Code Validity (preview at Admin)
    if (action === "check") {
      if (!rewardCode) {
        return NextResponse.json(
          { success: false, error: "Mã đổi thưởng là bắt buộc" },
          { status: 400 }
        );
      }
      const session = await getDuelSessionByRewardCode(rewardCode.trim());
      if (!session) {
        return NextResponse.json(
          { success: false, error: "Mã không tồn tại trong hệ thống" },
          { status: 404 }
        );
      }
      const isExpired = Date.now() > session.rewardCodeExpiresAt;
      return NextResponse.json({
        success: true,
        data: {
          session,
          isExpired,
        },
      });
    }

    // Action 3: Claim / Confirm Reward Given (called from Admin God Mode)
    if (!rewardCode) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập mã đổi thưởng" },
        { status: 400 }
      );
    }

    const claimResult = await claimDuelReward(rewardCode.trim(), phone);
    if (!claimResult.success) {
      return NextResponse.json(
        { success: false, error: claimResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Xác nhận trao quà thành công!",
      data: claimResult.session,
    });
  } catch (err) {
    console.error("Redeem reward error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi máy chủ khi đổi thưởng" },
      { status: 500 }
    );
  }
}
