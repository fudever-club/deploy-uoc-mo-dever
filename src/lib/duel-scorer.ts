import { DuelQuestion, DuelTier, DuelTierInfo, BuggyLinesBank } from "@/types/duel";
import questionsData from "@/data/duel-questions.json";
import buggyLinesData from "@/data/buggy-lines.json";

export const DUEL_TIERS: Record<DuelTier, DuelTierInfo> = {
  0: {
    tier: 0,
    title: "Chưa Đạt Tier",
    rewardName: "Lời Chúc May Mắn",
    rewardEmoji: "🌱",
    minCorrect: 0,
    badgeColor: "#64748B",
    description: "Cố gắng hơn ở lượt chơi sau để rinh quà từ Buggy nhé!",
  },
  1: {
    tier: 1,
    title: "Tier 1: Tân Binh Logic",
    rewardName: "Sticker DEVER Hologram Độc Quyền",
    rewardEmoji: "🐞",
    minCorrect: 3,
    badgeColor: "#4CE0D2",
    description: "Bộ sticker chống nước phản quang phiên bản giới hạn Club Day 2026.",
  },
  2: {
    tier: 2,
    title: "Tier 2: Chiến Thần Hacker DEVER",
    rewardName: "Móc Khoá / Thẻ Hacker DEVER + Vinh Danh",
    rewardEmoji: "⚡",
    minCorrect: 5,
    badgeColor: "#FAC775",
    description: "Móc khóa mica dạ quang khắc laser và vinh danh trên màn hình lớn sảnh trường.",
  },
  3: {
    tier: 3,
    title: "Tier 3: Huyền Thoại Top Leaderboard",
    rewardName: "Phần Quà Đặc Biệt Ban Chủ Nhiệm",
    rewardEmoji: "👑",
    minCorrect: 5,
    badgeColor: "#E14CE8",
    description: "Phần quà danh giá do Admin trao tay cho Top 5 xuất sắc nhất ngày hội.",
  },
};

export const DUEL_CONFIG = {
  TOTAL_QUESTIONS: 5,
  TIME_PER_QUESTION_SEC: 10,
  BASE_CORRECT_POINTS: 100,
  POINTS_PER_REMAINING_SEC: 10,
  STREAK_STEP_BONUS: 20, // +20 from 2nd consecutive correct answer
  QR_EXPIRATION_SECONDS: 90, // 90s dynamic token
};

export interface QuestionAnswerRecord {
  questionId: string;
  isCorrect: boolean;
  timeRemainingSec: number;
}

export function calculateSingleScore(
  isCorrect: boolean,
  timeRemainingSec: number,
  streakCount: number
): { points: number; bonus: number; streak: number } {
  if (!isCorrect) {
    return { points: 0, bonus: 0, streak: 0 };
  }

  const newStreak = streakCount + 1;
  const timeBonus = Math.max(0, Math.round(timeRemainingSec)) * DUEL_CONFIG.POINTS_PER_REMAINING_SEC;
  const streakBonus = newStreak >= 2 ? (newStreak - 1) * DUEL_CONFIG.STREAK_STEP_BONUS : 0;
  const totalPoints = DUEL_CONFIG.BASE_CORRECT_POINTS + timeBonus + streakBonus;

  return {
    points: totalPoints,
    bonus: timeBonus + streakBonus,
    streak: newStreak,
  };
}

export function calculateTotalSessionScore(answers: QuestionAnswerRecord[]): {
  totalScore: number;
  correctCount: number;
  maxStreak: number;
  tier: DuelTier;
} {
  let totalScore = 0;
  let correctCount = 0;
  let currentStreak = 0;
  let maxStreak = 0;

  for (const ans of answers) {
    if (ans.isCorrect) {
      correctCount++;
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      const timeBonus = Math.max(0, Math.round(ans.timeRemainingSec)) * DUEL_CONFIG.POINTS_PER_REMAINING_SEC;
      const streakBonus = currentStreak >= 2 ? (currentStreak - 1) * DUEL_CONFIG.STREAK_STEP_BONUS : 0;
      totalScore += DUEL_CONFIG.BASE_CORRECT_POINTS + timeBonus + streakBonus;
    } else {
      currentStreak = 0;
    }
  }

  const tier = determineTier(correctCount);

  return {
    totalScore,
    correctCount,
    maxStreak,
    tier,
  };
}

export function determineTier(correctCount: number, rank?: number): DuelTier {
  if (rank && rank <= 5 && correctCount >= 5) {
    return 3;
  }
  if (correctCount >= 5) {
    return 2;
  }
  if (correctCount >= 3) {
    return 1;
  }
  return 0;
}

export function getTierInfo(tier: DuelTier): DuelTierInfo {
  return DUEL_TIERS[tier] || DUEL_TIERS[0];
}

// Select 5 random questions ensuring representation across topics
export function getRandomDuelQuestions(count = 5): DuelQuestion[] {
  const allQuestions: DuelQuestion[] = (questionsData as unknown as DuelQuestion[]) || [];
  if (allQuestions.length <= count) {
    return [...allQuestions];
  }

  const topics: ("logic_it" | "fptu_meme" | "trick_riddles" | "fu_dever")[] = [
    "logic_it",
    "fptu_meme",
    "trick_riddles",
    "fu_dever",
  ];

  const selected: DuelQuestion[] = [];
  const usedIds = new Set<string>();

  // Ensure at least 1 question per topic
  for (const topic of topics) {
    const topicPool = allQuestions.filter((q) => q.topic === topic && !usedIds.has(q.id));
    if (topicPool.length > 0) {
      const picked = topicPool[Math.floor(Math.random() * topicPool.length)];
      selected.push(picked);
      usedIds.add(picked.id);
    }
  }

  // Fill remaining slots randomly from leftover pool
  const leftover = allQuestions.filter((q) => !usedIds.has(q.id));
  const shuffledLeftover = [...leftover].sort(() => Math.random() - 0.5);

  while (selected.length < count && shuffledLeftover.length > 0) {
    selected.push(shuffledLeftover.pop()!);
  }

  // Shuffle the final selected questions
  return selected.sort(() => Math.random() - 0.5);
}

// Pick a contextual Buggy line
export function getBuggyLine(
  category: keyof BuggyLinesBank,
  fallback?: string
): string {
  const bank = buggyLinesData as BuggyLinesBank;
  const list = bank[category];
  if (Array.isArray(list) && list.length > 0) {
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  }
  return fallback || "Buggy luôn đồng hành cùng bạn!";
}
