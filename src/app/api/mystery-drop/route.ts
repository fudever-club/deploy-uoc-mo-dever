import { NextRequest, NextResponse } from "next/server";
import {
  getActiveMysteryDrop,
  triggerMysteryDrop,
  claimMysteryDrop,
  cancelMysteryDrop,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const drop = getActiveMysteryDrop();
    return NextResponse.json({
      success: true,
      data: drop,
    });
  } catch (err) {
    console.error("GET mystery-drop error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi lấy thông tin đợt thả quà" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, dropId, claimantName, rewardName, rewardEmoji, description, durationSeconds } =
      body;

    if (action === "trigger") {
      const drop = triggerMysteryDrop({
        rewardName,
        rewardEmoji,
        description,
        durationSeconds,
      });
      return NextResponse.json({
        success: true,
        message: "Đã kích hoạt đợt thả đèn bí ẩn thành công!",
        data: drop,
      });
    }

    if (action === "claim") {
      if (!dropId) {
        return NextResponse.json(
          { success: false, error: "Mã đợt thả đèn (dropId) không hợp lệ" },
          { status: 400 }
        );
      }
      if (!claimantName || typeof claimantName !== "string" || !claimantName.trim()) {
        return NextResponse.json(
          { success: false, error: "Vui lòng nhập tên của bạn để nhận quà" },
          { status: 400 }
        );
      }

      const result = claimMysteryDrop(dropId, claimantName.trim());
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            winner: result.winner,
          },
          { status: 409 } // Conflict / Already claimed
        );
      }

      return NextResponse.json({
        success: true,
        message: "Chúc mừng bạn đã là người đầu tiên săn được ngọn đèn bí ẩn!",
        data: result.drop,
      });
    }

    if (action === "cancel") {
      cancelMysteryDrop();
      return NextResponse.json({
        success: true,
        message: "Đã hủy đợt thả đèn bí ẩn",
      });
    }

    return NextResponse.json(
      { success: false, error: "Hành động (action) không hợp lệ" },
      { status: 400 }
    );
  } catch (err) {
    console.error("POST mystery-drop error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi xử lý yêu cầu đèn bí ẩn" },
      { status: 500 }
    );
  }
}
