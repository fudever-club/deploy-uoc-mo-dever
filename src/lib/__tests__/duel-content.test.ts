import { describe, it, expect } from "vitest";
import questionsData from "../../data/duel-questions.json";
import buggyLinesData from "../../data/buggy-lines.json";
import { DuelQuestion } from "@/types/duel";

describe("Buggy AI Arena — Content Bank & Persona Compliance", () => {
  const questions: DuelQuestion[] = questionsData as unknown as DuelQuestion[];

  it("contains at least 40 questions across all 4 topics", () => {
    expect(questions.length).toBeGreaterThanOrEqual(40);

    const topicCounts: Record<string, number> = {};
    for (const q of questions) {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    }

    expect(topicCounts.logic_it).toBeGreaterThanOrEqual(8);
    expect(topicCounts.fptu_meme).toBeGreaterThanOrEqual(8);
    expect(topicCounts.trick_riddles).toBeGreaterThanOrEqual(8);
    expect(topicCounts.fu_dever).toBeGreaterThanOrEqual(8);
  });

  it("ensures all questions have exactly 4 options and valid correctIndex", () => {
    for (const q of questions) {
      expect(q.id).toBeDefined();
      expect(q.question.length).toBeGreaterThan(5);
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.options[q.correctIndex]).toBeDefined();
    }
  });

  it("verifies Buggy lines bank contains 80+ lines across required situations", () => {
    const categories = [
      "intro",
      "correct_fast",
      "correct_slow",
      "wrong",
      "streak",
      "win_perfect",
      "win_tier1",
      "lose",
      "timeout",
      "idle",
    ];

    let totalLines = 0;
    for (const cat of categories) {
      const lines = (buggyLinesData as Record<string, string[]>)[cat];
      expect(Array.isArray(lines)).toBe(true);
      expect(lines.length).toBeGreaterThanOrEqual(5);
      totalLines += lines.length;
    }

    expect(totalLines).toBeGreaterThanOrEqual(80);
  });

  it("enforces mascot rule: strictly 3rd person 'Buggy' and never 1st person pronouns", () => {
    const allLines: string[] = Object.values(buggyLinesData).flat() as string[];

    const forbiddenPronounPattern =
      /(?:^|[\s,.\-!?"'“”])(?:tao|tôi|mình|tớ)(?:[\s,.\-!?"'“”]|$)/i;

    for (const line of allLines) {
      expect(forbiddenPronounPattern.test(line)).toBe(false);
    }
  });
});
