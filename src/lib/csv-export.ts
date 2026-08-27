import { Dream } from "@/types/dream";
import { DREAM_CATEGORIES } from "./constants";

export function generateDreamsCSV(dreams: Dream[]): string {
  const headers = [
    "Mã ID",
    "Họ và Tên",
    "Nội dung ước mơ",
    "Chủ đề",
    "Đồng ý điều khoản",
    "Thời gian gửi",
    "Trạng thái hiển thị",
  ];

  const escapeCSV = (val: string | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const getCategoryLabel = (tag: string | null): string => {
    if (!tag) return "Khác";
    const found = DREAM_CATEGORIES.find((c) => c.id === tag);
    return found ? `${found.emoji} ${found.label}` : tag;
  };

  const rows = dreams.map((d) => {
    const formattedDate = new Date(d.created_at).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });

    return [
      escapeCSV(d.id),
      escapeCSV(d.name || "Ẩn danh"),
      escapeCSV(d.content),
      escapeCSV(getCategoryLabel(d.tag)),
      escapeCSV(d.consent ? "Có" : "Không"),
      escapeCSV(formattedDate),
      escapeCSV(d.hidden ? "Đã ẩn" : "Đang hiện"),
    ].join(",");
  });

  // UTF-8 BOM for Windows Excel compatibility
  const BOM = "\uFEFF";
  return BOM + [headers.join(","), ...rows].join("\r\n");
}
