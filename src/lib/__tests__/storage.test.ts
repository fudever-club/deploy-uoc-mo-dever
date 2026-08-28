import { describe, it, expect } from "vitest";
import {
  createDream,
  getDreams,
  getDreamsCount,
  updateDreamVisibility,
  deleteDream,
  broadcastReaction,
  setBroadcastAnnouncement,
  getActiveAnnouncement,
} from "../storage";

describe("Storage Engine", () => {
  it("should get dream count accurately", async () => {
    const initialVisibleCount = await getDreamsCount(false);
    const initialTotalCount = await getDreamsCount(true);

    const created = await createDream({
      name: "Count Test User",
      content: "Testing accurate count calculation",
      tag: "tech" as any,
      consent: true,
    });

    const newVisibleCount = await getDreamsCount(false);
    expect(newVisibleCount).toBe(initialVisibleCount + 1);

    await updateDreamVisibility(created.id, true);
    const hiddenVisibleCount = await getDreamsCount(false);
    const hiddenTotalCount = await getDreamsCount(true);
    expect(hiddenVisibleCount).toBe(initialVisibleCount);
    expect(hiddenTotalCount).toBe(initialTotalCount + 1);
  });
  it("should create and retrieve dreams", async () => {
    const created = await createDream({
      name: "Tân Sinh Viên K22",
      content: "Chinh phục kỳ thi học bổng ICPC cùng CLB FU-DEVER",
      tag: "study",
      consent: true,
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe("Tân Sinh Viên K22");
    expect(created.content).toBe("Chinh phục kỳ thi học bổng ICPC cùng CLB FU-DEVER");
    expect(created.tag).toBe("study");
    expect(created.hidden).toBe(false);

    const allVisible = await getDreams(false);
    const found = allVisible.find((d) => d.id === created.id);
    expect(found).toBeDefined();
  });

  it("should update visibility and hide from public display", async () => {
    const created = await createDream({
      name: "Test User",
      content: "Hide me",
      tag: "other",
      consent: true,
    });

    // Hide it
    const updated = await updateDreamVisibility(created.id, true);
    expect(updated?.hidden).toBe(true);

    // Visible list should not contain it
    const visibleList = await getDreams(false);
    expect(visibleList.find((d) => d.id === created.id)).toBeUndefined();

    // Admin list should contain it
    const adminList = await getDreams(true);
    expect(adminList.find((d) => d.id === created.id)).toBeDefined();
  });

  it("should delete dream", async () => {
    const created = await createDream({
      name: "Delete Me",
      content: "To be removed",
      tag: "other",
      consent: true,
    });

    const deleted = await deleteDream(created.id);
    expect(deleted).toBe(true);

    const all = await getDreams(true);
    expect(all.find((d) => d.id === created.id)).toBeUndefined();
  });

  it("should broadcast reactions", () => {
    const reaction = broadcastReaction("🚀");
    expect(reaction.id).toBeDefined();
    expect(reaction.emoji).toBe("🚀");
    expect(reaction.timestamp).toBeGreaterThan(0);
  });

  it("should manage broadcast announcements", () => {
    const ann = setBroadcastAnnouncement("Thử nghiệm phát thanh gian hàng DEVER");
    expect(ann).not.toBeNull();
    expect(ann?.message).toBe("Thử nghiệm phát thanh gian hàng DEVER");
    expect(ann?.active).toBe(true);

    const active = getActiveAnnouncement();
    expect(active?.message).toBe("Thử nghiệm phát thanh gian hàng DEVER");

    // Clear announcement
    const cleared = setBroadcastAnnouncement(null);
    expect(cleared).toBeNull();
    expect(getActiveAnnouncement()).toBeNull();
  });
});
