import { expect, test } from "@playwright/test";

test.describe("settings", () => {
  test("switching language updates the UI", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("button", { name: "日本語" }).click();

    await expect(page.getByRole("button", { name: "開始", exact: true })).toBeVisible();
    await expect(page.getByText("テーマ")).toBeVisible();

    // The choice is persisted, so it should stick across a reload.
    await page.reload();
    await expect(page.getByRole("button", { name: "開始", exact: true })).toBeVisible();
  });

  test("the summary toggle shows and hides the calendar", async ({ page }) => {
    await page.goto("/");

    // Hidden by default. (The calendar's prev/next-month buttons are a
    // stable marker of the summary being rendered — unlike the monthly
    // total list below it, they don't depend on there being any records.)
    const prevMonthButton = page.getByRole("button", { name: "Previous month" });
    await expect(prevMonthButton).toHaveCount(0);

    await page.getByRole("button", { name: "Settings" }).click();
    const summaryToggle = page.getByRole("switch", { name: "Summary" });
    await summaryToggle.click();
    await expect(prevMonthButton).toBeVisible();

    await summaryToggle.click();
    await expect(prevMonthButton).toHaveCount(0);
  });
});
