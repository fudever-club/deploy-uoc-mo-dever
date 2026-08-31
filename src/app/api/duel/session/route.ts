import { NextRequest, NextResponse } from "next/server";
import {
  getRandomQuestions,
  calculateDuelScore,
  evaluateTier,
  generateRewardToken,
  getRandomBuggyLine,
} from "@/lib/duel-engine";
import {
  saveDuelSession,
  getLeaderboard,
  getDuelSessions,
  updateLiveDuelState,
  clearDuelSessions,
} from "@/lib/duel-storage";
import { DuelSession } from "@/types/duel";

// GET /api/duel/session -> Fetch questions for a new match OR leaderboard
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type === "leaderboard") {
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const leaderboard = await getLeaderboard(limit);
    return NextResponse.json({ success: true, data: leaderboard });
  }

  if (type === "all" || type === "sessions" || (!type && searchParams.has("limit"))) {
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const sessions = await getDuelSessions(limit);
    return NextResponse.json({ success: true, data: sessions });
  }

  // Default / type === "questions": Get randomized balanced questions for playing
  const count = parseInt(searchParams.get("count") || "5", 10);
  const questions = getRandomQuestions(count);
  const introLine = getRandomBuggyLine("game_start");

  return NextResponse.json({
    success: true,
    data: {
      questions,
      introLine,
    },
  });
}

// POST /api/duel/session -> Submit completed game results
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nickname,
      answers, // array of { questionId, selectedIndex, isCorrect, timeLeftSeconds, timeSpentMs }
      action, // optional: "progress_update" to sync live question to /display
      currentQuestionIndex,
      currentScore,
      streak,
    } = body;

    // Handle live progress update during gameplay (for /display arena sync)
    if (action === "progress_update") {
      updateLiveDuelState({
        type: "duel_progress",
        sessionId: body.sessionId || `duel-live-${Date.now()}`,
        nickname: nickname?.trim() || "Tân binh",
        currentQuestionIndex: currentQuestionIndex ?? 0,
        totalQuestions: 5,
        currentScore: currentScore ?? 0,
        streak: streak ?? 0,
        isCorrect: body.isCorrect,
        buggyComment: body.buggyComment,
        timestamp: Date.now(),
      });
      return NextResponse.json({ success: true });
    }

    if (!nickname || typeof nickname !== "string") {
      return NextResponse.json(
        { success: false, error: "Nickname là bắt buộc" },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu câu trả lời không hợp lệ" },
        { status: 400 }
      );
    }

    // 1. Calculate Score and Tier
    const scoreResult = calculateDuelScore(answers);
    const tierInfo = evaluateTier(scoreResult.correctCount);

    // 2. Generate Dynamic Reward Code if Tier >= 1
    const sessionId = `duel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const { rewardCode, expiresAt } = generateRewardToken(
      sessionId,
      tierInfo.tier,
      90 // 90 seconds TTL
    );

    // 3. Select Buggy Summary Line
    let summaryLineCategory: any = "game_lose";
    if (tierInfo.tier === 2) summaryLineCategory = "game_win_perfect";
    else if (tierInfo.tier === 1) summaryLineCategory = "game_win_high";
    const buggySummary = getRandomBuggyLine(summaryLineCategory);

    // 4. Save Session
    const newSession: DuelSession = {
      id: sessionId,
      nickname: nickname.trim().slice(0, 30),
      score: scoreResult.totalScore,
      correctCount: scoreResult.correctCount,
      totalQuestions: answers.length,
      streakMax: scoreResult.streakMax,
      tier: tierInfo.tier,
      tierLabel: tierInfo.tierLabel,
      rewardCode,
      rewardCodeExpiresAt: expiresAt,
      rewardStatus: "pending",
      phone: null,
      createdAt: new Date().toISOString(),
      answers: scoreResult.detailedAnswers,
      aiReading: null,
    };

    await saveDuelSession(newSession);

    // 5. Broadcast to Display
    updateLiveDuelState({
      type: "duel_finish",
      sessionId,
      nickname: newSession.nickname,
      currentScore: newSession.score,
      streak: newSession.streakMax,
      tier: newSession.tier,
      buggyComment: buggySummary,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      data: {
        session: newSession,
        tierInfo,
        buggySummary,
      },
    });
  } catch (err) {
    console.error("Submit duel session error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi máy chủ khi lưu kết quả đấu" },
      { status: 500 }
    );
  }
}

// DELETE /api/duel/session -> Clear all duel sessions (Admin action)
export async function DELETE() {
  try {
    await clearDuelSessions();
    return NextResponse.json({
      success: true,
      message: "Đã làm rỗng toàn bộ dữ liệu Đấu trường Buggy Arena thành công!",
    });
  } catch (err) {
    console.error("Clear duel sessions error:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi khi làm rỗng dữ liệu arena" },
      { status: 500 }
    );
  }
}
