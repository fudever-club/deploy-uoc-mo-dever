import { NextRequest, NextResponse } from "next/server";
import { generateMockBatch } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { count } = await req.json().catch(() => ({ count: 5 }));
    const created = await generateMockBatch(Number(count) || 5);
    return NextResponse.json({ success: true, data: created, message: `Đã tạo thành công ${created.length} ước mơ thử nghiệm!` });
  } catch (err) {
    console.error("POST mock error:", err);
    return NextResponse.json({ success: false, error: "Lỗi tạo dữ liệu mẫu" }, { status: 500 });
  }
}
