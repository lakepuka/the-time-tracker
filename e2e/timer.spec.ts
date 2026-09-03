import { expect, test } from "@playwright/test";

test.describe("timer", () => {
  test("starting and stopping the timer creates a record", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("No records yet")).toBeVisible();
    await expect(page.getByText("Idle", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Start", exact: true }).click();

    // Toggled to the running state: button flips to Stop, and the
    // in-progress record shows up in the table immediately.
    await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeVisible();
    await expect(page.getByText(/^Tracking · since/)).toBeVisible();
    await expect(page.locator(".rec")).toHaveCount(1);
    await expect(page.getByText("In progress")).toBeVisible();

    await page.getByRole("button", { name: "Stop", exact: true }).click();

    // Back to idle, and the record is now finished (no more "In progress").
    await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();
    await expect(page.getByText(/^Idle · last/)).toBeVisible();
    await expect(page.locator(".rec")).toHaveCount(1);
    await expect(page.getByText("In progress")).toHaveCount(0);
  });

  test("a running timer survives a reload", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeVisible();

    await page.reload();

    // State lives in localStorage, so the in-progress record and the
    // Stop button should both come back after a reload.
    await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeVisible();
    await expect(page.locator(".rec")).toHaveCount(1);
  });
});
