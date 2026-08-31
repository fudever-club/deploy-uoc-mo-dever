import { NextRequest, NextResponse } from "next/server";
import { generateMockDuelBatch } from "@/lib/duel-storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const count = typeof body.count === "number" ? body.count : 5;
    const mocks = await generateMockDuelBatch(count);
    return NextResponse.json({ success: true, data: mocks });
  } catch (err) {
    console.error("POST /api/admin/duel-mock error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate mock duel batch" },
      { status: 500 }
    );
  }
}
