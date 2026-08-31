import { describe, it, expect } from "vitest";
import { generateDuelCSV } from "../duel-csv-export";
import { DuelSession } from "@/types/duel";

describe("Duel CSV Export Utility", () => {
  const sampleSessions: DuelSession[] = [
    {
      id: "duel-001",
      nickname: "MinhHacker",
      score: 950,
      correctCount: 5,
      correct_count: 5,
      totalQuestions: 5,
      total_questions: 5,
      streakMax: 5,
      streak_max: 5,
      tier: 2,
      tierLabel: "Tier 2 — Cao Thủ Hacker DEVER",
      tier_label: "Tier 2 — Cao Thủ Hacker DEVER",
      rewardCode: "DEVER-9999-ABC-SIG1",
      reward_code: "DEVER-9999-ABC-SIG1",
      rewardCodeExpiresAt: Date.now() + 60000,
      reward_code_expires_at: Date.now() + 60000,
      rewardStatus: "claimed",
      reward_status: "claimed",
      phone: "0905123456",
      createdAt: "2026-09-12T09:30:00.000Z",
      created_at: "2026-09-12T09:30:00.000Z",
    },
    {
      id: "duel-002",
      nickname: 'Coder, "Pro" & Fast',
      score: 720,
      correctCount: 4,
      correct_count: 4,
      totalQuestions: 5,
      total_questions: 5,
      streakMax: 3,
      streak_max: 3,
      tier: 1,
      tierLabel: "Tier 1 — Tân Binh Xuất Sắc",
      tier_label: "Tier 1 — Tân Binh Xuất Sắc",
      rewardCode: "DEVER-8888-XYZ-SIG2",
      reward_code: "DEVER-8888-XYZ-SIG2",
      rewardCodeExpiresAt: Date.now() - 10000,
      reward_code_expires_at: Date.now() - 10000,
      rewardStatus: "pending",
      reward_status: "pending",
      phone: null,
      createdAt: "2026-09-12T09:45:00.000Z",
      created_at: "2026-09-12T09:45:00.000Z",
    },
  ];

  it("should generate valid CSV with UTF-8 BOM and correct headers", () => {
    const csv = generateDuelCSV(sampleSessions);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("ID Phiên");
    expect(csv).toContain("Nickname");
    expect(csv).toContain("Số Điện Thoại");
    expect(csv).toContain("MinhHacker");
    expect(csv).toContain("0905123456");
    expect(csv).toContain("Đã trao quà");
    expect(csv).toContain('""Pro""'); // Escaped quotes
  });
});
