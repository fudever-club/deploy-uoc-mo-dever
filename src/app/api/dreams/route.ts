import { NextRequest, NextResponse } from "next/server";
import { createDream, getDreams } from "@/lib/storage";
import { DreamInput } from "@/types/dream";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeHidden = searchParams.get("includeHidden") === "true";
    const dreams = await getDreams(includeHidden);
    return NextResponse.json({ success: true, data: dreams });
  } catch (error) {
    console.error("GET /api/dreams error:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh sách ước mơ" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DreamInput;

    // Validate requirements
    if (!body.content || typeof body.content !== "string" || body.content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Nội dung ước mơ không được để trống" },
        { status: 400 }
      );
    }

    if (!body.consent) {
      return NextResponse.json(
        { success: false, error: "Vui lòng tick chọn đồng ý chia sẻ ước mơ" },
        { status: 400 }
      );
    }

    const dream = await createDream({
      name: body.name?.trim() || undefined,
      content: body.content.trim(),
      tag: body.tag || "other",
      consent: true,
    });

    return NextResponse.json({ success: true, data: dream }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dreams error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi hệ thống khi gửi ước mơ" },
      { status: 500 }
    );
  }
}
