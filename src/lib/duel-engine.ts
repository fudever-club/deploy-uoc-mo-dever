import {
  DuelQuestion,
  DuelTopic,
  RewardTier,
  BuggyLineCategory,
  BuggyLineBank,
  DuelAnswerRecord,
} from "@/types/duel";
import questionsData from "@/data/duel-questions.json";
import linesData from "@/data/buggy-lines.json";

const rawQuestions = questionsData as any[];
const buggyLines = linesData as any;

// Helper to shuffle array in-place (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Topic display names
export const TOPIC_LABELS: Record<DuelTopic, string> = {
  logic_it: "💻 Logic IT Cơ Bản",
  meme_fptu: "🐸 Meme Sinh Viên FPTU",
  trick: "⚡ Đố Mẹo Bẻ Lái",
  fu_dever: "🏮 Văn Hóa FU-DEVER",
};

// Normalize questions from JSON
export function getAllQuestions(): DuelQuestion[] {
  return rawQuestions.map((q) => {
    let topic: DuelTopic = "logic_it";
    if (q.topic === "fptu_meme" || q.topic === "meme_fptu") topic = "meme_fptu";
    else if (q.topic === "trick_riddles" || q.topic === "trick") topic = "trick";
    else if (q.topic === "fu_dever") topic = "fu_dever";

    return {
      id: q.id,
      topic,
      topicLabel: TOPIC_LABELS[topic] || "Logic & IT",
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation || "",
      hint: q.hint || "",
    };
  });
}

// Pick 5 random questions balanced across topics
export function getRandomQuestions(count = 5): DuelQuestion[] {
  const all = getAllQuestions();
  const topics: DuelTopic[] = ["logic_it", "meme_fptu", "trick", "fu_dever"];

  const picked: DuelQuestion[] = [];
  const usedIds = new Set<string>();

  // Try to pick at least 1 from each topic
  for (const topic of topics) {
    if (picked.length >= count) break;
    const candidates = all.filter((q) => q.topic === topic && !usedIds.has(q.id));
    if (candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      picked.push(chosen);
      usedIds.add(chosen.id);
    }
  }

  // Fill remaining slots randomly from unused pool
  const remainingPool = all.filter((q) => !usedIds.has(q.id));
  const shuffledRemaining = shuffleArray(remainingPool);

  while (picked.length < count && shuffledRemaining.length > 0) {
    const next = shuffledRemaining.pop();
    if (next) {
      picked.push(next);
      usedIds.add(next.id);
    }
  }

  return shuffleArray(picked);
}

export interface ScoreCalculationResult {
  correctCount: number;
  streakMax: number;
  totalScore: number;
  detailedAnswers: DuelAnswerRecord[];
}

// Score formula: (Correct * 100) + (TimeLeft * 10) + Streak Bonus
// Streak bonus: +20 for 2nd correct, +40 for 3rd, +60 for 4th, +80 for 5th
export function calculateDuelScore(
  answers: {
    questionId?: string;
    selectedIndex?: number;
    isCorrect: boolean;
    timeLeftSeconds: number;
    timeSpentMs: number;
  }[]
): ScoreCalculationResult {
  let totalScore = 0;
  let currentStreak = 0;
  let streakMax = 0;
  let correctCount = 0;
  const detailedAnswers: DuelAnswerRecord[] = [];

  for (let i = 0; i < answers.length; i++) {
    const ans = answers[i];
    let points = 0;

    if (ans.isCorrect) {
      correctCount++;
      currentStreak++;
      if (currentStreak > streakMax) streakMax = currentStreak;

      const baseScore = 100;
      const timeBonus = Math.max(0, Math.floor(ans.timeLeftSeconds)) * 10;
      const streakBonus = currentStreak > 1 ? (currentStreak - 1) * 20 : 0;

      points = baseScore + timeBonus + streakBonus;
      totalScore += points;
    } else {
      currentStreak = 0;
    }

    detailedAnswers.push({
      questionId: ans.questionId || `q-${i + 1}`,
      selectedIndex: ans.selectedIndex ?? -1,
      isCorrect: ans.isCorrect,
      timeSpentMs: ans.timeSpentMs,
      timeLeftSeconds: ans.timeLeftSeconds,
      pointsAwarded: points,
      streak: currentStreak,
    });
  }

  return {
    correctCount,
    streakMax,
    totalScore,
    detailedAnswers,
  };
}

// Evaluate Reward Tier
export function evaluateTier(correctCount: number): {
  tier: RewardTier;
  tierLabel: string;
  rewardDescription: string;
} {
  if (correctCount === 5) {
    return {
      tier: 2,
      tierLabel: "Tier 2 — Cao Thủ Hacker DEVER",
      rewardDescription: "Móc Khóa / Thẻ Hacker DEVER độc quyền + Vinh danh Màn hình lớn",
    };
  }
  if (correctCount >= 3) {
    return {
      tier: 1,
      tierLabel: "Tier 1 — Tân Binh Xuất Sắc",
      rewardDescription: "Bộ Sticker Buggy Hologram & DEVER chống nước độc quyền",
    };
  }
  return {
    tier: 0,
    tierLabel: "Thử Thách Hoàn Thành",
    rewardDescription: "Cơ hội phục thù ở lượt tiếp theo hoặc nhận quà may mắn tại quầy Check-in!",
  };
}

// Get Random Buggy Dialogue
export function getRandomBuggyLine(category: BuggyLineCategory): string {
  let key = category;
  if (category === "game_start") key = "intro" as any;
  else if (category === "fast_correct") key = "correct_fast" as any;
  else if (category === "slow_correct") key = "correct_slow" as any;
  else if (category === "normal_correct") key = "correct_fast" as any;
  else if (category === "game_win_perfect") key = "win_perfect" as any;
  else if (category === "game_win_high") key = "win_tier1" as any;
  else if (category === "game_lose") key = "lose" as any;

  const pool = buggyLines[key] || buggyLines["idle"] || [
    "Buggy luôn đồng hành cùng bạn tại FU-DEVER Club Day 2026!",
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ----------------------------------------------------
// DYNAMIC QR CODE SECURITY TOKENS (HMAC-like signature)
// ----------------------------------------------------

const SECRET_SALT = "FU_DEVER_CLUB_DAY_2026_BUGGY_ARENA_SALT";

function sanitizeSegment(str: string): string {
  return str.replace(/[^a-zA-Z0-9]/g, "").slice(-4);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit int
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(6, "0");
}

export function generateRewardToken(
  sessionId: string,
  tier: RewardTier,
  durationSeconds = 90
): {
  rewardCode: string;
  expiresAt: number;
} {
  const expiresAt = Date.now() + durationSeconds * 1000;
  const sessionTag = sanitizeSegment(sessionId);
  const rawPayload = `${sessionId}:${tier}:${sessionTag}:${SECRET_SALT}`;
  const signature = simpleHash(rawPayload);
  const codePrefix = Math.floor(1000 + Math.random() * 9000);
  const rewardCode = `DEVER-${codePrefix}-${sessionTag}-${signature}`;

  return {
    rewardCode,
    expiresAt,
  };
}

export function verifyRewardToken(
  rewardCode: string,
  sessionId: string
): { valid: boolean; reason?: string } {
  if (!rewardCode || !rewardCode.startsWith("DEVER-")) {
    return { valid: false, reason: "Mã đổi thưởng không hợp lệ" };
  }

  const parts = rewardCode.split("-");
  if (parts.length !== 4) {
    return { valid: false, reason: "Định dạng mã QR không đúng" };
  }

  const sessionTag = sanitizeSegment(sessionId);
  if (parts[2] !== sessionTag) {
    return { valid: false, reason: "Mã này không khớp với phiên đấu hiện tại" };
  }

  const signature = parts[3];
  const isSignatureValid = [0, 1, 2, 3].some((tier) => {
    const expected = simpleHash(`${sessionId}:${tier}:${sessionTag}:${SECRET_SALT}`);
    return expected === signature;
  });

  if (!isSignatureValid) {
    return { valid: false, reason: "Chữ ký mã xác thực không hợp lệ" };
  }

  return { valid: true };
}
