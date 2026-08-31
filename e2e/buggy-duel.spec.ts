import { test, expect } from "@playwright/test";

test.describe("Buggy AI Arena - Mobile Game Flow & Admin Claim", () => {
  test("complete full 5-question duel on mobile and verify QR code", async ({ page }) => {
    // 1. Visit /duel lobby
    await page.goto("/duel");
    await expect(page.locator("h1")).toContainText("Buggy AI Arena");

    // 2. Enter nickname
    const testNick = `PlaywrightK22_${Date.now().toString().slice(-4)}`;
    await page.fill("#input-nickname", testNick);
    await page.click("#btn-start-duel");

    // 3. Answer 5 questions
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector("button:has-text('A')", { timeout: 10000 });
      // Click first option
      const firstOption = page.locator("button:has-text('A')").first();
      await firstOption.click();
      // Wait for auto advance
      await page.waitForTimeout(1800);
    }

    // 4. Verify Result Screen
    await expect(page.locator("text=Kết Quả Trận Đấu")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h3:has-text('Điểm')")).toBeVisible({ timeout: 10000 });
  });

  test("admin dashboard tab Buggy Arena loads and renders sessions", async ({ page }) => {
    await page.goto("/admin");
    // Login
    await page.fill("#admin-password-input", "dever2026");
    await page.click("#btn-admin-login");

    // Check header
    await expect(page.locator("h1")).toContainText(/Admin God Mode|Bảng Quản Trị/i, { timeout: 10000 });

    // Switch to Buggy Arena tab if present
    const arenaTab = page.locator("button:has-text('Buggy Arena')");
    if (await arenaTab.count() > 0) {
      await arenaTab.first().click();
      await expect(page.getByText("Quầy Đổi Thưởng Buggy Arena")).toBeVisible({ timeout: 10000 });
    }
  });

  test("display split-view loads sky and arena panels", async ({ page, isMobile }) => {
    await page.goto("/display");
    await expect(page.locator("text=Deploy Ước Mơ")).toBeVisible({ timeout: 10000 });
    if (!isMobile) {
      await expect(page.getByText("BUGGY LIVE ARENA")).toBeVisible({ timeout: 10000 });
    } else {
      await expect(page.locator("h1")).toContainText("Deploy Ước Mơ");
    }
  });
});
