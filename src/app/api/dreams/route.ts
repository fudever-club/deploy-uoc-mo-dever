import { NextRequest, NextResponse } from "next/server";
import { createDream, getDreams, getDreamsCount } from "@/lib/storage";
import { DreamInput } from "@/types/dream";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeHidden = searchParams.get("includeHidden") === "true";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 150;
    
    const [dreams, totalVisible, totalAll] = await Promise.all([
      getDreams(includeHidden, limit),
      getDreamsCount(false),
      getDreamsCount(true),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: dreams,
        total: includeHidden ? totalAll : totalVisible,
        totalVisible,
        totalAll,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
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
      mascotIndex: body.mascotIndex || "11",
      theme: body.theme || "classic",
      lanternShape: body.lanternShape || "hoian_lotus",
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
