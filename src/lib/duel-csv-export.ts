import { DuelSession } from "@/types/duel";

function escapeCSV(text: string | null | undefined): string {
  if (!text) return '""';
  const str = String(text).replace(/"/g, '""').replace(/\r?\n/g, " ");
  return `"${str}"`;
}

export function generateDuelCSV(sessions: DuelSession[]): string {
  const headers = [
    "ID Phiên",
    "Nickname",
    "Điểm Số",
    "Số Câu Đúng",
    "Tổng Câu Hỏi",
    "Chuỗi Đúng Max",
    "Phân Tầng (Tier)",
    "Mã Đổi Thưởng",
    "Trạng Thái Quà",
    "Số Điện Thoại",
    "Thời Gian Chơi",
    "Thời Gian Hết Hạn Mã",
  ];

  const rows = sessions.map((s) => {
    const rawCreated = s.createdAt || s.created_at;
    const timeStr = rawCreated ? new Date(rawCreated).toLocaleString("vi-VN") : "";

    const rawExp = s.rewardCodeExpiresAt ?? s.reward_code_expires_at;
    const expStr = typeof rawExp === "number" && rawExp > 0 ? new Date(rawExp).toLocaleString("vi-VN") : "";

    const statusLabel =
      (s.rewardStatus || s.reward_status) === "claimed"
        ? "Đã trao quà"
        : (rawExp || 0) < Date.now()
        ? "Đã hết hạn"
        : "Chưa sử dụng";

    return [
      escapeCSV(s.id),
      escapeCSV(s.nickname),
      s.score,
      s.correctCount ?? s.correct_count ?? 0,
      s.totalQuestions ?? s.total_questions ?? 5,
      s.streakMax ?? s.streak_max ?? 0,
      escapeCSV(s.tierLabel || s.tier_label || `Tier ${s.tier}`),
      escapeCSV(s.rewardCode || s.reward_code),
      escapeCSV(statusLabel),
      escapeCSV(s.phone || "Chưa cung cấp"),
      escapeCSV(timeStr),
      escapeCSV(expStr),
    ].join(",");
  });

  // UTF-8 BOM for Excel Vietnamese display
  return "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
}
