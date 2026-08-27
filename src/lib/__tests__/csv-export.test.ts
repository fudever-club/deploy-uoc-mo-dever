import { describe, it, expect } from "vitest";
import { generateDreamsCSV } from "../csv-export";
import { Dream } from "@/types/dream";

describe("CSV Export utility", () => {
  it("should generate CSV with UTF-8 BOM and correct headers", () => {
    const mockDreams: Dream[] = [
      {
        id: "test-1",
        name: "Nguyễn Văn Nhật",
        content: 'Ước mơ trở thành "Lead Architect" & Startup',
        tag: "career",
        consent: true,
        created_at: "2026-09-12T08:30:00.000Z",
        hidden: false,
      },
    ];

    const csv = generateDreamsCSV(mockDreams);

    // Checks BOM
    expect(csv.startsWith("\uFEFF")).toBe(true);

    // Checks headers
    expect(csv).toContain("Mã ID,Họ và Tên,Nội dung ước mơ,Chủ đề,Đồng ý điều khoản,Thời gian gửi,Trạng thái hiển thị");

    // Checks data row and proper quote escaping
    expect(csv).toContain('"Nguyễn Văn Nhật"');
    expect(csv).toContain('"Ước mơ trở thành ""Lead Architect"" & Startup"');
    expect(csv).toContain("Sự nghiệp");
    expect(csv).toContain("Đang hiện");
  });

  it("should handle anonymous dreams gracefully", () => {
    const mockDreams: Dream[] = [
      {
        id: "test-anon",
        name: null,
        content: "Ước mơ bình an",
        tag: "other",
        consent: true,
        created_at: "2026-09-12T09:00:00.000Z",
        hidden: true,
      },
    ];

    const csv = generateDreamsCSV(mockDreams);
    expect(csv).toContain('"Ẩn danh"');
    expect(csv).toContain("Đã ẩn");
  });
});
