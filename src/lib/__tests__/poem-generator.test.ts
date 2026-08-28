import { describe, it, expect } from "vitest";
import { generatePoem } from "../poem-generator";
import { DreamCategory } from "@/types/dream";

describe("FU-DEVER Mid-Autumn Poetry Generator", () => {
  it("generates a personalized 4-line poem for a named user", () => {
    const poem = generatePoem("Quang Nhật", "career");
    expect(poem).toBeDefined();
    expect(poem.title).toBeTypeOf("string");
    expect(poem.lines).toHaveLength(4);
    expect(poem.lines[0]).toContain("Quang Nhật");
    expect(poem.badge).toBeTypeOf("string");
  });

  it("handles empty names gracefully with default phrasing", () => {
    const poem = generatePoem("", "tech");
    expect(poem.lines).toHaveLength(4);
    expect(poem.title).toBeTypeOf("string");
  });

  it("supports all 6 dream categories", () => {
    const categories: DreamCategory[] = ["career", "tech", "friendship", "academic", "club", "love"];
    categories.forEach((cat) => {
      const poem = generatePoem("Sinh viên K22", cat);
      expect(poem.lines.length).toBeGreaterThanOrEqual(4);
      expect(poem.badge).toBeTruthy();
    });
  });
});
