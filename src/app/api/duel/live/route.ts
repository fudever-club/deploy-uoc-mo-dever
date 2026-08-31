import { NextRequest, NextResponse } from "next/server";
import { broadcastLiveDuelUpdate } from "@/lib/duel-storage";
import { LiveDuelEvent } from "@/types/duel";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event: LiveDuelEvent = {
      id: body.id || `live-${Date.now()}`,
      sessionId: body.sessionId,
      nickname: body.nickname || "Tân Sinh Viên K22",
      currentQuestionIndex: body.currentQuestionIndex || 0,
      totalQuestions: body.totalQuestions || 5,
      score: body.score || 0,
      streak: body.streak || 0,
      status: body.status || "playing",
      latestBuggyLine: body.latestBuggyLine,
      timestamp: Date.now(),
    };

    broadcastLiveDuelUpdate(event);
    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    console.error("POST /api/duel/live error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to broadcast live duel update" },
      { status: 500 }
    );
  }
}
