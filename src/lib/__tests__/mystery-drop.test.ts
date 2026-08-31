import { describe, it, expect, beforeEach } from "vitest";
import {
  triggerMysteryDrop,
  getActiveMysteryDrop,
  claimMysteryDrop,
  cancelMysteryDrop,
} from "../storage";

describe("Mystery Drop System (Atomic Single-Winner Lock)", () => {
  beforeEach(() => {
    cancelMysteryDrop();
  });

  it("should trigger a mystery drop with valid presets and duration", () => {
    const drop = triggerMysteryDrop({
      rewardName: "Sticker Buggy Hologram",
      rewardEmoji: "🐞",
      description: "Phần quà giới hạn độc quyền",
      durationSeconds: 25,
    });

    expect(drop.id).toBeDefined();
    expect(drop.rewardName).toBe("Sticker Buggy Hologram");
    expect(drop.rewardEmoji).toBe("🐞");
    expect(drop.rewardCode).toMatch(/^DEVER-\d{4}$/);
    expect(drop.active).toBe(true);
    expect(drop.claimed).toBe(false);
    expect(drop.claimedBy).toBeNull();
    expect(drop.expiresAt).toBeGreaterThan(Date.now());

    const active = getActiveMysteryDrop();
    expect(active).not.toBeNull();
    expect(active?.id).toBe(drop.id);
  });

  it("should allow the first user to claim the drop successfully", () => {
    const drop = triggerMysteryDrop({
      rewardName: "Ly Trà Đào Thanh Mát DEVER",
      rewardEmoji: "🍹",
    });

    const result = claimMysteryDrop(drop.id, "Nguyễn Văn A - K22");
    expect(result.success).toBe(true);
    expect(result.drop?.claimed).toBe(true);
    expect(result.drop?.claimedBy).toBe("Nguyễn Văn A - K22");
    expect(result.drop?.claimedAt).toBeDefined();
  });

  it("should strictly reject the second user when the drop has already been claimed (Atomic Lock)", () => {
    const drop = triggerMysteryDrop({
      rewardName: "Móc Khóa Cyber 2026",
      rewardEmoji: "🔑",
    });

    // 1st User Claims
    const firstClaim = claimMysteryDrop(drop.id, "Người Nhanh Nhất (QE180001)");
    expect(firstClaim.success).toBe(true);

    // 2nd User Tries to Claim 0.1s later
    const secondClaim = claimMysteryDrop(drop.id, "Người Chậm Hơn (QE180002)");
    expect(secondClaim.success).toBe(false);
    expect(secondClaim.winner).toBe("Người Nhanh Nhất (QE180001)");
    expect(secondClaim.error).toContain("nhanh tay săn thành công");

    // 3rd User also rejected
    const thirdClaim = claimMysteryDrop(drop.id, "Người Thứ Ba");
    expect(thirdClaim.success).toBe(false);
    expect(thirdClaim.winner).toBe("Người Nhanh Nhất (QE180001)");
  });

  it("should reject claim attempts for non-existent drop IDs", () => {
    triggerMysteryDrop();
    const result = claimMysteryDrop("invalid-drop-id-999", "Nguyễn Văn C");
    expect(result.success).toBe(false);
    expect(result.error).toContain("kết thúc hoặc không tồn tại");
  });

  it("should cancel an active mystery drop cleanly", () => {
    triggerMysteryDrop({ rewardName: "Test Drop" });
    expect(getActiveMysteryDrop()).not.toBeNull();

    cancelMysteryDrop();
    expect(getActiveMysteryDrop()).toBeNull();
  });
});
