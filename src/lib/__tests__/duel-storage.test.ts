import { describe, it, expect } from "vitest";
import {
  saveDuelSession,
  getDuelSessions,
  getLeaderboard,
  claimDuelReward,
  refreshRewardTokenInStorage,
  getDuelSessionById,
  clearDuelSessions,
} from "../duel-storage";
import { DuelSession } from "@/types/duel";

describe("Duel Storage - Session & Reward Management", () => {
  const testSession: DuelSession = {
    id: `test-session-${Date.now()}-abc1`,
    nickname: "DevK22",
    score: 850,
    correctCount: 4,
    totalQuestions: 5,
    streakMax: 4,
    tier: 1,
    tierLabel: "Tier 1 — Tân Binh Xuất Sắc",
    rewardCode: "DEVER-1234-abc1-EB228E",
    rewardCodeExpiresAt: Date.now() + 90000,
    rewardStatus: "pending",
    phone: null,
    createdAt: new Date().toISOString(),
  };

  it("saves a duel session and retrieves it", async () => {
    const saved = await saveDuelSession(testSession);
    expect(saved.id).toBe(testSession.id);

    const found = await getDuelSessionById(testSession.id);
    expect(found).not.toBeNull();
    expect(found?.nickname).toBe("DevK22");
    expect(found?.score).toBe(850);
  });

  it("builds leaderboard sorted by score descending with correct ranks", async () => {
    const sessionLow: DuelSession = {
      ...testSession,
      id: `test-session-low-${Date.now()}-abc2`,
      nickname: "NewbieCoder",
      score: 300,
      correctCount: 2,
      tier: 0,
      rewardCode: "DEVER-1111-abc2-EB228E",
    };
    const sessionHigh: DuelSession = {
      ...testSession,
      id: `test-session-high-${Date.now()}-abc3`,
      nickname: "ProHacker",
      score: 980,
      correctCount: 5,
      tier: 2,
      rewardCode: "DEVER-9999-abc3-EB228E",
    };

    await saveDuelSession(sessionLow);
    await saveDuelSession(sessionHigh);

    const leaderboard = await getLeaderboard(10);
    expect(leaderboard.length).toBeGreaterThanOrEqual(3);

    // Ensure strictly descending
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].score).toBeGreaterThanOrEqual(leaderboard[i + 1].score);
    }
  });

  it("claims a reward with phone number and marks status as claimed", async () => {
    const claimRes = await claimDuelReward(testSession.rewardCode, "0905123456");
    expect(claimRes.success).toBe(true);
    expect(claimRes.session?.rewardStatus).toBe("claimed");
    expect(claimRes.session?.phone).toBe("0905123456");

    // Try claiming again -> must be rejected
    const secondClaim = await claimDuelReward(testSession.rewardCode, "0905999999");
    expect(secondClaim.success).toBe(false);
    expect(secondClaim.error).toContain("đã được trao");
  });

  it("refreshes an expired reward token for the same session", async () => {
    const expiredSession: DuelSession = {
      ...testSession,
      id: `test-session-exp-${Date.now()}-abc4`,
      nickname: "LateRunner",
      rewardCode: "DEVER-4444-abc4-SIGOLD",
      rewardCodeExpiresAt: Date.now() - 10000, // already expired
      rewardStatus: "pending",
    };
    await saveDuelSession(expiredSession);

    const refreshed = await refreshRewardTokenInStorage(expiredSession.id);
    expect(refreshed).not.toBeNull();
    expect(refreshed?.rewardCodeExpiresAt).toBeGreaterThan(Date.now());
  });

  it("clears all duel sessions completely when requested", async () => {
    const cleared = await clearDuelSessions();
    expect(cleared).toBe(true);

    const sessions = await getDuelSessions(50);
    expect(sessions.length).toBe(0);
  });
});
