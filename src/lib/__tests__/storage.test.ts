import { describe, it, expect } from "vitest";
import { createDream, getDreams, updateDreamVisibility, deleteDream } from "../storage";

describe("Storage Engine", () => {
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
});
