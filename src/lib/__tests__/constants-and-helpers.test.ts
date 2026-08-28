import { describe, it, expect } from "vitest";
import {
  DREAM_CATEGORIES,
  EVENT_INFO,
  BUGGY_MOODS,
  getBuggyMascotUrl,
} from "../constants";

describe("Brand Constants & Asset Helpers", () => {
  it("should have all 6 dream categories with valid labels and hex colors", () => {
    expect(DREAM_CATEGORIES.length).toBe(6);
    const ids = DREAM_CATEGORIES.map((c) => c.id);
    expect(ids).toContain("career");
    expect(ids).toContain("study");
    expect(ids).toContain("travel");
    expect(ids).toContain("family");
    expect(ids).toContain("big_dream");
    expect(ids).toContain("other");

    DREAM_CATEGORIES.forEach((cat) => {
      expect(cat.label.length).toBeGreaterThan(0);
      expect(cat.emoji.length).toBeGreaterThan(0);
      expect(cat.colorHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it("should contain event info and brand hashtags", () => {
    expect(EVENT_INFO.clubName).toContain("FU-DEVER");
    expect(EVENT_INFO.university).toContain("FPT");
    expect(EVENT_INFO.eventLocation).toContain("Gian hàng");
    expect(EVENT_INFO.hashtags).toContain("#FUDEVER");
    expect(EVENT_INFO.hashtags).toContain("#DeployUocMo");
  });

  it("should resolve Buggy mascot URLs accurately", () => {
    // Number index (19 is 19.png, 1 maps to 11.png)
    expect(getBuggyMascotUrl(19)).toBe("/assets/buggy/19.png");
    expect(getBuggyMascotUrl(1)).toBe("/assets/buggy/11.png");

    // String number
    expect(getBuggyMascotUrl("11")).toBe("/assets/buggy/11.png");
    expect(getBuggyMascotUrl("6")).toBe("/assets/buggy/6.png");

    // Subpath string (Mid-Autumn special series)
    const midAutumnPath = "trung-thu/04_buggy_chu_cuoi_coder.png";
    expect(getBuggyMascotUrl(midAutumnPath)).toBe("/assets/buggy/trung-thu/04_buggy_chu_cuoi_coder.png");

    // Named sticker
    expect(getBuggyMascotUrl("buggy_hang_nga_fairy")).toBe("/assets/buggy/trung-thu/buggy_hang_nga_fairy.png");
  });

  it("should contain Buggy moods list", () => {
    expect(BUGGY_MOODS.length).toBeGreaterThan(5);
    const first = BUGGY_MOODS[0];
    expect(first.label).toBeDefined();
    expect(first.emoji).toBeDefined();
    expect(first.image).toBeDefined();
  });
});
