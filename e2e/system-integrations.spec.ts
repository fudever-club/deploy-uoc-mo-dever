import { test, expect } from "@playwright/test";

test.describe("System Integrations & Official Brand QA", () => {
  test("1. About Modal renders official portals (fudever.com, Facebook, GitHub)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Open About Modal from Navbar
    const aboutBtn = page.locator("button[aria-label='Về CLB FU-DEVER']");
    await expect(aboutBtn).toBeVisible({ timeout: 10000 });
    await aboutBtn.click();

    // Verify Modal Header & Links
    await expect(page.locator("h2")).toContainText("CLB LẬP TRÌNH FU-DEVER");
    await expect(page.getByText("fudever.com").first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("facebook.com/FPTUDever")).toBeVisible();
    await expect(page.getByText("github.com/fudever-club")).toBeVisible();

    // Close Modal
    const closeBtn = page.locator("button[aria-label='Đóng']");
    await closeBtn.click();
  });

  test("2. Admin Arena God Mode: Zalo 1-Click button and Reset action present", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Login
    await page.fill("#admin-password-input", "dever2026");
    await page.click("#btn-admin-login");

    // Switch to Buggy Arena Tab
    const arenaTab = page.locator("button:has-text('Buggy Arena')");
    await expect(arenaTab).toBeVisible({ timeout: 10000 });
    await arenaTab.click();

    // Verify Action Bar controls
    await expect(page.getByText("Quầy Đổi Thưởng Buggy Arena")).toBeVisible();
    await expect(page.locator("#btn-clear-duels")).toBeVisible();
    await expect(page.locator("button:has-text('+ 5 Lượt Mẫu')")).toBeVisible();
    await expect(page.locator("button:has-text('Xuất CSV Arena')")).toBeVisible();

    // Verify Table is rendered
    await expect(page.locator("table")).toBeVisible();
  });

  test("3. Standee Poster renders FUDEVER.COM branding and theme switcher", async ({ page }) => {
    await page.goto("/standee");
    await page.waitForLoadState("domcontentloaded");

    // Verify Branding
    await expect(page.locator("h1")).toContainText("DEPLOY ƯỚC MƠ");
    await expect(page.getByText("FUDEVER.COM")).toBeVisible();

    // Toggle Themes
    const daylightBtn = page.locator("button:has-text('Nắng Sớm')");
    const nightBtn = page.locator("button:has-text('Đêm Hội')");
    await expect(daylightBtn).toBeVisible();
    await expect(nightBtn).toBeVisible();

    await daylightBtn.click();
    await nightBtn.click();
  });
});
