import { test, expect } from "@playwright/test";

test.describe("Deploy Ước Mơ — End to End User Flows", () => {
  test("1. Full Wish Submission, Poetry Generation, and Dream Card Studio flow", async ({ page }) => {
    // 1. Visit Main Page
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/Deploy Ước Mơ/, { timeout: 10000 });

    // 2. Verify Intro Screen
    const startBtn = page.locator("#btn-start-dream");
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h1")).toContainText(/deploy ước mơ/i);

    // 3. Start Form
    await startBtn.scrollIntoViewIfNeeded();
    await startBtn.click();

    // 4. Fill form
    const nameInput = page.locator("#name-input");
    const contentInput = page.locator("#content-input");
    const submitBtn = page.locator("#btn-submit-dream");

    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill("Phan Quang Nhật K22");

    // Test AI Poetry generator button
    const poemBtn = page.locator("button:has-text('Gieo Vần Thơ')");
    await expect(poemBtn).toBeVisible();
    await poemBtn.scrollIntoViewIfNeeded();
    await poemBtn.click();

    // Verify poem content filled
    await expect(contentInput).not.toBeEmpty();

    // Choose Category Tag
    const tagBtn = page.locator("button:has-text('Ước mơ lớn')");
    if (await tagBtn.isVisible()) {
      await tagBtn.click();
    }

    // Submit
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // 5. Verify Thank You Screen
    await expect(page.locator("h2")).toContainText(/đèn lồng đã cất cánh|ước mơ đã bay lên/i, { timeout: 10000 });
    const viewCardBtn = page.locator("#btn-view-card");
    await expect(viewCardBtn).toBeVisible();

    // 6. Open Dream Card Modal
    await viewCardBtn.scrollIntoViewIfNeeded();
    await viewCardBtn.click();
    await expect(page.locator("text=Thiệp Ước Mơ & Vé Lên Tàu Vũ Trụ K22")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("button:has-text('Lưu Ảnh Story')")).toBeVisible();

    // Close modal
    const closeBtn = page.locator("button[aria-label='Đóng']");
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test("2. Public Lantern Sky Display & Flight Modes (/display)", async ({ page }) => {
    await page.goto("/display");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText(/Deploy Ước Mơ/i, { timeout: 10000 });
    await expect(page.locator("#counter-pill")).toBeVisible();

    // Toggle Constellation Galaxy Mode
    const galaxyBtn = page.locator("button[title*='Chòm Sao']");
    if (await galaxyBtn.isVisible()) {
      await galaxyBtn.click();
      await expect(page.locator("button:has-text('Toàn Vũ Trụ')")).toBeVisible();
    }

    // Switch back to Carousel Mode
    const carouselBtn = page.locator("button:has-text('Bay Xoay Vòng')");
    if (await carouselBtn.isVisible()) {
      await carouselBtn.click();
    }
  });

  test("3. Admin Dashboard Authentication & Management (/admin)", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForLoadState("domcontentloaded");

    // Login
    const passInput = page.locator("#admin-password-input");
    const loginBtn = page.locator("#btn-admin-login");
    await expect(passInput).toBeVisible({ timeout: 10000 });

    await passInput.fill("dever2026");
    await loginBtn.click();

    // Verify Dashboard Loaded
    await expect(page.locator("h1")).toContainText("Bảng Quản Trị Ước Mơ", { timeout: 10000 });
    await expect(page.locator("#btn-export-csv")).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
  });

  test("4. Standee Poster Generator Screen (/standee)", async ({ page }) => {
    await page.goto("/standee");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("DEPLOY ƯỚC MƠ", { timeout: 10000 });
    await expect(page.locator("text=Quét Mã Tham Gia Ngay")).toBeVisible();
    await expect(page.locator("button:has-text('In Poster')")).toBeVisible();
  });

  test("5. Lucky Draw Minigame Screen (/admin/lucky-draw)", async ({ page }) => {
    await page.goto("/admin/lucky-draw");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("VÒNG QUAY MAY MẮN", { timeout: 10000 });
    const spinBtn = page.locator("button:has-text('Quay Thưởng May Mắn')");
    await expect(spinBtn).toBeVisible({ timeout: 10000 });
    await spinBtn.click();
    await expect(page.locator("text=Đang quay thưởng...")).toBeVisible();
  });

  test("6. Mystery Drop Gift Claim Screen (/claim)", async ({ page }) => {
    await page.goto("/claim");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Săn Đèn Lồng Bí Ẩn");
  });
});
