import { test, expect } from "@playwright/test";

test.describe("Deploy Ước Mơ — End to End User Flows", () => {
  test("1. Full Wish Submission and Dream Card generation flow", async ({ page }) => {
    // 1. Visit Main Page
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/Deploy Ước Mơ/, { timeout: 10000 });

    // 2. Verify Intro Screen
    const startBtn = page.locator("#btn-start-dream");
    await expect(startBtn).toBeVisible();
    await expect(page.locator("h1")).toContainText(/deploy ước mơ/i);

    // 3. Start Form
    await startBtn.click();

    // 4. Fill form
    const nameInput = page.locator("#name-input");
    const contentInput = page.locator("#content-input");
    const submitBtn = page.locator("#btn-submit-dream");

    await nameInput.fill("Phan Quang Nhật K22");
    await contentInput.fill("Xây dựng cộng đồng lập trình FU-DEVER ngày càng vững mạnh và rực rỡ!");

    // Choose Category Tag
    const tagBtn = page.locator("button:has-text('Ước mơ lớn')");
    if (await tagBtn.isVisible()) {
      await tagBtn.click();
    }

    // Submit
    await submitBtn.click();

    // 5. Verify Thank You Screen
    await expect(page.locator("h2")).toContainText(/ước mơ đã bay lên/i);
    const viewCardBtn = page.locator("#btn-view-card");
    await expect(viewCardBtn).toBeVisible();

    // 6. Open Dream Card Modal
    await viewCardBtn.click();
    await expect(page.locator("text=Thiệp Ước Mơ Cá Nhân Hoá")).toBeVisible();
    await expect(page.locator("button:has-text('Tải Ảnh Về Máy')")).toBeVisible();
  });

  test("2. Public Lantern Sky Display Screen (/display)", async ({ page }) => {
    await page.goto("/display");
    await expect(page.locator("text=Deploy Ước Mơ · Club Day 2026")).toBeVisible();
    await expect(page.locator("text=CLB LẬP TRÌNH FU-DEVER").first()).toBeVisible();
    await expect(page.locator("#counter-pill")).toBeVisible();
  });

  test("3. Admin Dashboard Authentication & Management (/admin)", async ({ page }) => {
    await page.goto("/admin");

    // Login
    const passInput = page.locator("#admin-password-input");
    const loginBtn = page.locator("#btn-admin-login");
    await expect(passInput).toBeVisible();

    await passInput.fill("dever2026");
    await loginBtn.click();

    // Verify Dashboard Loaded
    await expect(page.locator("h1")).toContainText("Bảng Quản Trị Ước Mơ");
    await expect(page.locator("#btn-export-csv")).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
  });

  test("4. Standee Poster Generator Screen (/standee)", async ({ page }) => {
    await page.goto("/standee");
    await expect(page.locator("h1")).toContainText("DEPLOY ƯỚC MƠ");
    await expect(page.locator("text=Quét Mã Tham Gia Ngay")).toBeVisible();
    await expect(page.locator("button:has-text('In Poster')")).toBeVisible();
  });

  test("5. Lucky Draw Minigame Screen (/admin/lucky-draw)", async ({ page }) => {
    await page.goto("/admin/lucky-draw");
    await expect(page.locator("h1")).toContainText("VÒNG QUAY MAY MẮN");
    const spinBtn = page.locator("button:has-text('Quay Số Ngay!')");
    await expect(spinBtn).toBeVisible();
    await spinBtn.click();
    await expect(page.locator("text=Đang quay số...")).toBeVisible();
  });
});
