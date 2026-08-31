export type DuelTopic = "logic_it" | "meme_fptu" | "trick" | "fu_dever";

export interface DuelQuestion {
  id: string;
  topic: DuelTopic;
  topicLabel: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  hint?: string;
}

export type RewardTier = 0 | 1 | 2 | 3;
export type DuelTier = RewardTier;
export type DuelRewardTier = RewardTier;

export interface DuelTierInfo {
  tier: RewardTier;
  tierLabel?: string;
  tier_label?: string;
  title?: string;
  badgeName?: string;
  rewardName?: string;
  rewardEmoji?: string;
  rewardDescription?: string;
  reward_description?: string;
  minCorrect?: number;
  [key: string]: any;
}

export type RewardStatus = "pending" | "claimed" | "expired";
export type DuelRewardStatus = RewardStatus;

export interface DuelAnswerRecord {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpentMs: number;
  timeLeftSeconds: number;
  pointsAwarded: number;
  streak: number;
}

export interface DuelSession {
  id: string;
  nickname: string;
  score: number;
  correctCount: number;
  correct_count?: number;
  totalQuestions: number;
  total_questions?: number;
  streakMax: number;
  streak_max?: number;
  tier: RewardTier;
  tierLabel: string;
  tier_label?: string;
  rewardCode: string;
  reward_code?: string;
  rewardCodeExpiresAt: number;
  reward_code_expires_at?: number;
  rewardStatus: RewardStatus;
  reward_status?: RewardStatus;
  phone?: string | null;
  createdAt: string;
  created_at?: string;
  answers?: DuelAnswerRecord[];
  aiReading?: string | null;
  ai_reading?: string | null;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  correctCount?: number;
  correct_count?: number;
  tier: RewardTier;
  tierLabel?: string;
  tier_label?: string;
  createdAt?: string;
  created_at?: string;
  rank?: number;
}

export type BuggyMood = "idle" | "thinking" | "happy" | "smug" | "shocked" | "victory" | "crying";

export type BuggyLineCategory =
  | "game_start"
  | "fast_correct"
  | "slow_correct"
  | "normal_correct"
  | "wrong"
  | "streak"
  | "timeout"
  | "game_win_perfect"
  | "game_win_high"
  | "game_lose"
  | "idle"
  | "intro"
  | "correct_fast"
  | "correct_slow"
  | "win_perfect"
  | "win_tier1"
  | "lose";

export interface BuggyLineBank {
  [key: string]: string[];
}

export type BuggyLinesBank = BuggyLineBank;

export interface LiveDuelBroadcast {
  type: "duel_start" | "duel_progress" | "duel_finish" | "duel_glitch";
  sessionId: string;
  nickname: string;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  currentScore?: number;
  streak?: number;
  isCorrect?: boolean;
  buggyComment?: string;
  tier?: RewardTier;
  timestamp: number;
}

export interface LiveDuelEvent {
  id?: string;
  sessionId?: string;
  status: "idle" | "playing" | "finished";
  nickname: string;
  score: number;
  streak: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  isCorrect?: boolean;
  latestBuggyLine?: string;
  timestamp: number;
}
