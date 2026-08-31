import { describe, it, expect } from "vitest";
import {
  calculateDuelScore,
  evaluateTier,
  getRandomQuestions,
  getRandomBuggyLine,
  generateRewardToken,
  verifyRewardToken,
  shuffleArray,
} from "../duel-engine";

describe("Duel Engine - Scoring & Game Logic", () => {
  it("calculates score correctly based on formula (correct * 100) + (timeLeft * 10) + streak bonus", () => {
    // 5 correct answers, each with 5s left, streak reaches 5
    // Answer 1: 100 + 50 + 0 = 150 (streak 1)
    // Answer 2: 100 + 50 + 20 = 170 (streak 2)
    // Answer 3: 100 + 50 + 40 = 190 (streak 3)
    // Answer 4: 100 + 50 + 60 = 210 (streak 4)
    // Answer 5: 100 + 50 + 80 = 230 (streak 5)
    // Total = 150 + 170 + 190 + 210 + 230 = 950
    const answers = [
      { isCorrect: true, timeLeftSeconds: 5, timeSpentMs: 5000 },
      { isCorrect: true, timeLeftSeconds: 5, timeSpentMs: 5000 },
      { isCorrect: true, timeLeftSeconds: 5, timeSpentMs: 5000 },
      { isCorrect: true, timeLeftSeconds: 5, timeSpentMs: 5000 },
      { isCorrect: true, timeLeftSeconds: 5, timeSpentMs: 5000 },
    ];

    const result = calculateDuelScore(answers);
    expect(result.correctCount).toBe(5);
    expect(result.streakMax).toBe(5);
    expect(result.totalScore).toBe(950);
  });

  it("handles mixed correct and wrong answers with streak reset", () => {
    const answers = [
      { isCorrect: true, timeLeftSeconds: 8, timeSpentMs: 2000 },  // streak 1: 100 + 80 + 0 = 180
      { isCorrect: false, timeLeftSeconds: 0, timeSpentMs: 10000 }, // streak 0: 0
      { isCorrect: true, timeLeftSeconds: 6, timeSpentMs: 4000 },  // streak 1: 100 + 60 + 0 = 160
      { isCorrect: true, timeLeftSeconds: 7, timeSpentMs: 3000 },  // streak 2: 100 + 70 + 20 = 190
      { isCorrect: false, timeLeftSeconds: 2, timeSpentMs: 8000 }, // streak 0: 0
    ];

    const result = calculateDuelScore(answers);
    expect(result.correctCount).toBe(3);
    expect(result.streakMax).toBe(2);
    expect(result.totalScore).toBe(180 + 0 + 160 + 190 + 0);
  });

  it("evaluates tiers accurately", () => {
    expect(evaluateTier(5).tier).toBe(2);
    expect(evaluateTier(4).tier).toBe(1);
    expect(evaluateTier(3).tier).toBe(1);
    expect(evaluateTier(2).tier).toBe(0);
    expect(evaluateTier(0).tier).toBe(0);
  });

  it("selects 5 unique questions across topics", () => {
    const questions = getRandomQuestions(5);
    expect(questions.length).toBe(5);
    const uniqueIds = new Set(questions.map((q) => q.id));
    expect(uniqueIds.size).toBe(5);
  });

  it("returns appropriate Buggy lines according to scenario", () => {
    const startLine = getRandomBuggyLine("game_start");
    expect(startLine).toBeTruthy();
    expect(typeof startLine).toBe("string");

    const perfectLine = getRandomBuggyLine("game_win_perfect");
    expect(perfectLine).toBeTruthy();
  });

  it("generates and verifies dynamic reward QR tokens", () => {
    const sessionId = "session-test-123";
    const tokenData = generateRewardToken(sessionId, 2, 90); // 90 seconds TTL
    expect(tokenData.rewardCode).toContain("DEVER-");
    expect(tokenData.expiresAt).toBeGreaterThan(Date.now());

    const verification = verifyRewardToken(tokenData.rewardCode, sessionId);
    expect(verification.valid).toBe(true);

    const wrongSessionVerification = verifyRewardToken(tokenData.rewardCode, "other-session");
    expect(wrongSessionVerification.valid).toBe(false);

    // Tampered token test
    const tamperedCode = tokenData.rewardCode + "invalid";
    expect(verifyRewardToken(tamperedCode, sessionId).valid).toBe(false);
  });
});
