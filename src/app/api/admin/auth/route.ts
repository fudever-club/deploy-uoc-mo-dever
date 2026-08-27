import { NextRequest, NextResponse } from "next/server";
import { EVENT_INFO } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();
    const correctPasscode = process.env.ADMIN_PASSCODE || EVENT_INFO.defaultAdminPasscode;

    if (!passcode || passcode !== correctPasscode) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu quản trị không chính xác" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, message: "Đăng nhập thành công" });
  } catch (error) {
    console.error("POST /api/admin/auth error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi xử lý xác thực" },
      { status: 500 }
    );
  }
}
