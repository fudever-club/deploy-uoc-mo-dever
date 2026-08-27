import { NextRequest, NextResponse } from "next/server";
import { getActiveAnnouncement, setBroadcastAnnouncement } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const current = getActiveAnnouncement();
  return NextResponse.json({ success: true, data: current });
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const updated = setBroadcastAnnouncement(message);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("POST announcement error:", err);
    return NextResponse.json({ success: false, error: "Lỗi cập nhật thông báo" }, { status: 500 });
  }
}
