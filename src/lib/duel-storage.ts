import { DuelSession, LeaderboardEntry, LiveDuelBroadcast, LiveDuelEvent } from "@/types/duel";
import { generateRewardToken, verifyRewardToken } from "./duel-engine";
import { realtimeBus } from "./storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var __localDuelSessions: DuelSession[] | undefined;
  // eslint-disable-next-line no-var
  var __currentLiveDuel: LiveDuelBroadcast | null | undefined;
}

const DUEL_STORAGE_FILE = path.join(process.cwd(), "data", "duel_sessions.json");

function ensureDataDir() {
  const dir = path.dirname(DUEL_STORAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initial Sample Sessions for Booth Leaderboard Seed
const INITIAL_DUEL_SESSIONS: DuelSession[] = [
  {
    id: "duel-init-1",
    nickname: "MinhHacker",
    score: 920,
    correctCount: 5,
    correct_count: 5,
    totalQuestions: 5,
    total_questions: 5,
    streakMax: 5,
    streak_max: 5,
    tier: 2,
    tierLabel: "Tier 2 — Cao Thủ Hacker DEVER",
    tier_label: "Tier 2 — Cao Thủ Hacker DEVER",
    rewardCode: "DEVER-9821-nit1-SIGINIT1",
    reward_code: "DEVER-9821-nit1-SIGINIT1",
    rewardCodeExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
    reward_code_expires_at: Date.now() + 1000 * 60 * 60 * 24,
    rewardStatus: "claimed",
    reward_status: "claimed",
    phone: "0905***123",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "duel-init-2",
    nickname: "HuyenTrang_K22",
    score: 740,
    correctCount: 4,
    correct_count: 4,
    totalQuestions: 5,
    total_questions: 5,
    streakMax: 3,
    streak_max: 3,
    tier: 1,
    tierLabel: "Tier 1 — Tân Binh Xuất Sắc",
    tier_label: "Tier 1 — Tân Binh Xuất Sắc",
    rewardCode: "DEVER-4521-nit2-SIGINIT2",
    reward_code: "DEVER-4521-nit2-SIGINIT2",
    rewardCodeExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
    reward_code_expires_at: Date.now() + 1000 * 60 * 60 * 24,
    rewardStatus: "claimed",
    reward_status: "claimed",
    phone: "0912***456",
    createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: "duel-init-3",
    nickname: "BugHunter",
    score: 680,
    correctCount: 4,
    correct_count: 4,
    totalQuestions: 5,
    total_questions: 5,
    streakMax: 2,
    streak_max: 2,
    tier: 1,
    tierLabel: "Tier 1 — Tân Binh Xuất Sắc",
    tier_label: "Tier 1 — Tân Binh Xuất Sắc",
    rewardCode: "DEVER-3312-nit3-SIGINIT3",
    reward_code: "DEVER-3312-nit3-SIGINIT3",
    rewardCodeExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
    reward_code_expires_at: Date.now() + 1000 * 60 * 60 * 24,
    rewardStatus: "pending",
    reward_status: "pending",
    phone: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

function loadLocalDuelSessions(): DuelSession[] {
  if (global.__localDuelSessions && global.__localDuelSessions.length > 0) {
    return global.__localDuelSessions;
  }
  try {
    ensureDataDir();
    if (fs.existsSync(DUEL_STORAGE_FILE)) {
      const data = fs.readFileSync(DUEL_STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        global.__localDuelSessions = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to load duel sessions file, using fallback:", err);
  }
  global.__localDuelSessions = [...INITIAL_DUEL_SESSIONS];
  saveLocalDuelSessions(global.__localDuelSessions);
  return global.__localDuelSessions;
}

function saveLocalDuelSessions(sessions: DuelSession[]) {
  global.__localDuelSessions = sessions;
  try {
    ensureDataDir();
    fs.writeFileSync(DUEL_STORAGE_FILE, JSON.stringify(sessions, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to save local duel sessions:", err);
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

function getSupabaseClient(): SupabaseClient | null {
  if (supabaseUrl && supabaseKey) {
    try {
      return createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });
    } catch {
      // ignore
    }
  }
  return null;
}

export async function getDuelSessions(limit = 100): Promise<DuelSession[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("duel_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && Array.isArray(data)) {
        return data.map((d: any) => ({
          ...d,
          correctCount: d.correct_count ?? d.correctCount,
          totalQuestions: d.total_questions ?? d.totalQuestions,
          streakMax: d.streak_max ?? d.streakMax,
          tierLabel: d.tier_label ?? d.tierLabel,
          rewardCode: d.reward_code ?? d.rewardCode,
          rewardCodeExpiresAt: d.reward_code_expires_at ?? d.rewardCodeExpiresAt,
          rewardStatus: d.reward_status ?? d.rewardStatus,
          createdAt: d.created_at ?? d.createdAt,
          aiReading: d.ai_reading ?? d.aiReading,
        })) as DuelSession[];
      }
    } catch {
      // fallback to local
    }
  }
  const local = loadLocalDuelSessions();
  return [...local].slice(0, limit);
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const sessions = await getDuelSessions(200);

  const sorted = [...sessions].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.createdAt || a.created_at || 0).getTime() - new Date(b.createdAt || b.created_at || 0).getTime();
  });

  return sorted.slice(0, limit).map((s, index) => ({
    id: s.id,
    nickname: s.nickname,
    score: s.score,
    correctCount: s.correctCount ?? s.correct_count ?? 0,
    correct_count: s.correctCount ?? s.correct_count ?? 0,
    tier: s.tier,
    tierLabel: s.tierLabel ?? s.tier_label ?? "",
    tier_label: s.tierLabel ?? s.tier_label ?? "",
    createdAt: s.createdAt ?? s.created_at ?? new Date().toISOString(),
    created_at: s.createdAt ?? s.created_at ?? new Date().toISOString(),
    rank: index + 1,
  }));
}

export const getDuelLeaderboard = getLeaderboard;

export async function saveDuelSession(session: DuelSession): Promise<DuelSession> {
  const normalized: DuelSession = {
    ...session,
    correct_count: session.correctCount,
    total_questions: session.totalQuestions,
    streak_max: session.streakMax,
    tier_label: session.tierLabel,
    reward_code: session.rewardCode,
    reward_code_expires_at: session.rewardCodeExpiresAt,
    reward_status: session.rewardStatus,
    created_at: session.createdAt,
    ai_reading: session.aiReading,
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("duel_sessions")
        .insert([normalized])
        .select("*")
        .single();
      if (!error && data) {
        realtimeBus.emit("duel:session_created", normalized);
        return normalized;
      }
    } catch {
      // fallback to local
    }
  }

  const list = loadLocalDuelSessions();
  const existingIdx = list.findIndex((s) => s.id === session.id);
  if (existingIdx >= 0) {
    list[existingIdx] = normalized;
  } else {
    list.unshift(normalized);
  }
  saveLocalDuelSessions(list);

  realtimeBus.emit("duel:session_created", normalized);
  return normalized;
}

export async function getDuelSessionById(id: string): Promise<DuelSession | null> {
  const sessions = loadLocalDuelSessions();
  const found = sessions.find((s) => s.id === id);
  return found || null;
}

export async function getDuelSessionByRewardCode(code: string): Promise<DuelSession | null> {
  const sessions = loadLocalDuelSessions();
  const found = sessions.find((s) => s.rewardCode === code || s.reward_code === code);
  return found || null;
}

export async function claimDuelReward(
  rewardCode: string,
  phone?: string
): Promise<{ success: boolean; session?: DuelSession; error?: string }> {
  const list = loadLocalDuelSessions();
  const session = list.find((s) => s.rewardCode === rewardCode || s.reward_code === rewardCode);

  if (!session) {
    return { success: false, error: "Không tìm thấy mã đổi thưởng trong hệ thống!" };
  }

  if (session.rewardStatus === "claimed" || session.reward_status === "claimed") {
    return {
      success: false,
      error: `Phần quà này đã được trao trước đó cho SĐT: ${session.phone || "Ẩn danh"}!`,
    };
  }

  if (session.tier === 0) {
    return {
      success: false,
      error: "Phiên chơi này chưa đủ điều kiện nhận quà (Tier 0).",
    };
  }

  session.rewardStatus = "claimed";
  session.reward_status = "claimed";
  if (phone && phone.trim()) {
    session.phone = phone.trim();
  }
  saveLocalDuelSessions(list);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from("duel_sessions")
        .update({ reward_status: "claimed", phone: session.phone })
        .eq("id", session.id);
    } catch {
      // ignore
    }
  }

  realtimeBus.emit("duel:reward_claimed", session);
  return { success: true, session };
}

export async function refreshRewardTokenInStorage(sessionId: string): Promise<DuelSession | null> {
  const list = loadLocalDuelSessions();
  const session = list.find((s) => s.id === sessionId);

  if (!session || session.rewardStatus === "claimed" || session.tier === 0) {
    return null;
  }

  const { rewardCode, expiresAt } = generateRewardToken(session.id, session.tier, 90);
  session.rewardCode = rewardCode;
  session.reward_code = rewardCode;
  session.rewardCodeExpiresAt = expiresAt;
  session.reward_code_expires_at = expiresAt;
  session.rewardStatus = "pending";
  session.reward_status = "pending";

  saveLocalDuelSessions(list);
  realtimeBus.emit("duel:token_refreshed", session);
  return session;
}

export const refreshDuelRewardToken = refreshRewardTokenInStorage;

export function updateLiveDuelState(broadcast: LiveDuelBroadcast): LiveDuelBroadcast {
  global.__currentLiveDuel = broadcast;
  realtimeBus.emit("duel:live_broadcast", broadcast);
  return broadcast;
}

export function broadcastLiveDuelUpdate(event: LiveDuelEvent): void {
  updateLiveDuelState({
    type: "duel_progress",
    sessionId: `live-${Date.now()}`,
    nickname: event.nickname,
    currentQuestionIndex: event.currentQuestionIndex,
    totalQuestions: event.totalQuestions,
    currentScore: event.score,
    streak: event.streak,
    isCorrect: event.isCorrect,
    buggyComment: event.latestBuggyLine,
    timestamp: event.timestamp,
  });
}

export function broadcastGlitchEffect(): void {
  const broadcast: LiveDuelBroadcast = {
    type: "duel_glitch",
    sessionId: `glitch-${Date.now()}`,
    nickname: "ADMIN",
    timestamp: Date.now(),
  };
  global.__currentLiveDuel = broadcast;
  realtimeBus.emit("duel:glitch", broadcast);
}

export async function generateMockDuelBatch(count = 5): Promise<DuelSession[]> {
  const mockNames = ["MinhDev K22", "HuyenTrang IT", "GiaKhiem DEVER", "PhuongLinh", "DuyAnh_C9"];
  const created: DuelSession[] = [];

  for (let i = 0; i < count; i++) {
    const correctCount = (i % 3) + 3; // 3, 4, or 5
    const score = correctCount * 150 + Math.floor(Math.random() * 100);
    const tier = correctCount === 5 ? 2 : 1;
    const sessionId = `duel-mock-${Date.now()}-${i}`;
    const { rewardCode, expiresAt } = generateRewardToken(sessionId, tier, 300);

    const s: DuelSession = {
      id: sessionId,
      nickname: mockNames[i % mockNames.length],
      score,
      correctCount,
      totalQuestions: 5,
      streakMax: correctCount,
      tier,
      tierLabel: tier === 2 ? "Tier 2 — Cao Thủ Hacker DEVER" : "Tier 1 — Tân Binh Xuất Sắc",
      rewardCode,
      rewardCodeExpiresAt: expiresAt,
      rewardStatus: "pending",
      phone: null,
      createdAt: new Date().toISOString(),
    };
    const saved = await saveDuelSession(s);
    created.push(saved);
  }
  return created;
}

export async function clearDuelSessions(): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from("duel_sessions").delete().neq("id", "none_to_delete_all");
    } catch (e) {
      console.warn("Supabase clear duel sessions error:", e);
    }
  }

  global.__localDuelSessions = [];
  try {
    ensureDataDir();
    fs.writeFileSync(DUEL_STORAGE_FILE, JSON.stringify([], null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write empty duel sessions file:", err);
  }

  realtimeBus.emit("duel:cleared", true);
  return true;
}

export function getLiveDuelState(): LiveDuelBroadcast | null {
  return global.__currentLiveDuel || null;
}
