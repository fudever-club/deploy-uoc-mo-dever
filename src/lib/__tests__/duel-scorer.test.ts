import { describe, it, expect } from "vitest";
import {
  calculateSingleScore,
  calculateTotalSessionScore,
  determineTier,
  getTierInfo,
  getRandomDuelQuestions,
  getBuggyLine,
  DUEL_CONFIG,
} from "../duel-scorer";

describe("Buggy AI Arena — Scoring & Tier Logic", () => {
  it("calculates single score correctly for wrong answer", () => {
    const res = calculateSingleScore(false, 8, 3);
    expect(res.points).toBe(0);
    expect(res.bonus).toBe(0);
    expect(res.streak).toBe(0);
  });

  it("calculates single score correctly for 1st correct answer", () => {
    // 100 base + 7s * 10 = 170. Streak = 1 (no streak bonus on 1st)
    const res = calculateSingleScore(true, 7, 0);
    expect(res.points).toBe(170);
    expect(res.bonus).toBe(70);
    expect(res.streak).toBe(1);
  });

  it("calculates single score with streak bonus on consecutive correct answers", () => {
    // 2nd consecutive: streak = 2 -> +20 bonus -> 100 base + 8*10 + 20 = 200
    const res2 = calculateSingleScore(true, 8, 1);
    expect(res2.points).toBe(200);
    expect(res2.streak).toBe(2);

    // 3rd consecutive: streak = 3 -> +40 bonus -> 100 base + 5*10 + 40 = 190
    const res3 = calculateSingleScore(true, 5, 2);
    expect(res3.points).toBe(190);
    expect(res3.streak).toBe(3);
  });

  it("calculates total session score across all 5 questions correctly", () => {
    const answers = [
      { questionId: "q1", isCorrect: true, timeRemainingSec: 8 }, // 100 + 80 = 180 (streak 1)
      { questionId: "q2", isCorrect: true, timeRemainingSec: 6 }, // 100 + 60 + 20 = 180 (streak 2)
      { questionId: "q3", isCorrect: false, timeRemainingSec: 4 }, // 0 (streak resets)
      { questionId: "q4", isCorrect: true, timeRemainingSec: 9 }, // 100 + 90 = 190 (streak 1)
      { questionId: "q5", isCorrect: true, timeRemainingSec: 7 }, // 100 + 70 + 20 = 190 (streak 2)
    ];

    const summary = calculateTotalSessionScore(answers);
    expect(summary.correctCount).toBe(4);
    expect(summary.maxStreak).toBe(2);
    expect(summary.totalScore).toBe(180 + 180 + 0 + 190 + 190); // 740
    expect(summary.tier).toBe(1); // 4 correct -> Tier 1
  });

  it("determines correct reward tiers", () => {
    expect(determineTier(0)).toBe(0);
    expect(determineTier(2)).toBe(0);
    expect(determineTier(3)).toBe(1);
    expect(determineTier(4)).toBe(1);
    expect(determineTier(5)).toBe(2);
    expect(determineTier(5, 2)).toBe(3); // Rank 2 with 5 correct -> Tier 3
  });

  it("returns proper tier metadata", () => {
    const tier1 = getTierInfo(1);
    expect(tier1.title).toContain("Tier 1");
    expect(tier1.rewardName).toContain("Sticker");

    const tier2 = getTierInfo(2);
    expect(tier2.title).toContain("Tier 2");
    expect(tier2.rewardName).toContain("Hacker");
  });

  it("selects 5 random questions ensuring representation across topics", () => {
    const selected = getRandomDuelQuestions(5);
    expect(selected.length).toBe(5);
    const topics = new Set(selected.map((q) => q.topic));
    expect(topics.size).toBeGreaterThanOrEqual(3);
  });

  it("picks Buggy lines with persona", () => {
    const line = getBuggyLine("win_perfect");
    expect(typeof line).toBe("string");
    expect(line.length).toBeGreaterThan(5);
  });
});
