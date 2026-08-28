export type DreamCategory =
  | "career"
  | "study"
  | "travel"
  | "family"
  | "big_dream"
  | "other";

export type CardTheme = "classic" | "tech" | "gold";

export interface CategoryInfo {
  id: DreamCategory;
  label: string;
  emoji: string;
  shortLabel: string;
  colorHex: string;
}

export interface BuggyMood {
  index: number | string;
  label: string;
  emoji: string;
  image?: string;
}

export interface Dream {
  id: string;
  name: string | null;
  content: string;
  tag: DreamCategory;
  consent: boolean;
  created_at: string;
  hidden: boolean;
  mascotIndex?: number | string;
  theme?: CardTheme;
  lanternShape?: string;
}

export interface DreamInput {
  name?: string;
  content: string;
  tag?: DreamCategory;
  consent: boolean;
  mascotIndex?: number | string;
  theme?: CardTheme;
  lanternShape?: string;
}

export interface LanternItem extends Dream {
  x: number; // percentage 5..90
  y: number; // percentage from top 10..85
  delay: number; // animation delay in seconds
  scale: number; // 0.85 .. 1.1
  isNew?: boolean;
}

export interface BroadcastAnnouncement {
  id: string;
  message: string;
  active: boolean;
  timestamp: string;
}

export interface LiveReaction {
  id: string;
  emoji: string;
  x: number; // random percentage
  timestamp: number;
}

export interface MysteryDrop {
  id: string;
  rewardName: string;
  rewardCode: string;
  rewardEmoji: string;
  description: string;
  active: boolean;
  claimed: boolean;
  claimedBy: string | null;
  claimedAt: string | null;
  createdAt: number;
  expiresAt: number;
}
