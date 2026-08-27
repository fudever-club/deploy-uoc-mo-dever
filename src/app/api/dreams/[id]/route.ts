import { NextRequest, NextResponse } from "next/server";
import { deleteDream, updateDreamVisibility } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (typeof body.hidden !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Trường 'hidden' không hợp lệ" },
        { status: 400 }
      );
    }

    const updated = await updateDreamVisibility(id, body.hidden);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy ước mơ" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/dreams/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi cập nhật trạng thái ước mơ" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteDream(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy ước mơ để xóa" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Đã xóa thành công" });
  } catch (error) {
    console.error("DELETE /api/dreams/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi khi xóa ước mơ" },
      { status: 500 }
    );
  }
}
