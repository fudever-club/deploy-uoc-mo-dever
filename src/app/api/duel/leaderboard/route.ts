import { NextRequest, NextResponse } from "next/server";
import { getDuelLeaderboard } from "@/lib/duel-storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const leaderboard = await getDuelLeaderboard(limit);
    return NextResponse.json({ success: true, data: leaderboard });
  } catch (err) {
    console.error("GET /api/duel/leaderboard error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
