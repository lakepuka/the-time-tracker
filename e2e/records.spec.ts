import { expect, test } from "@playwright/test";

/** Starts and immediately stops the timer, producing exactly one record row. */
async function createRecord(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  return page.locator(".rec").first();
}

test.describe("record row", () => {
  test("adding a note and editing the adjustment persist on the row", async ({ page }) => {
    const row = await createRecord(page);

    await row.getByRole("button", { name: /Add note/ }).click();
    const noteField = row.getByLabel("Notes");
    await noteField.fill("Client meeting");
    await expect(noteField).toHaveValue("Client meeting");

    const adjustmentField = row.getByLabel("Adj. (min)");
    await adjustmentField.fill("15");
    await expect(adjustmentField).toHaveValue("15");

    // Both edits should survive a reload (localStorage-backed).
    await page.reload();
    const reloadedRow = page.locator(".rec").first();
    await expect(reloadedRow.getByLabel("Notes")).toHaveValue("Client meeting");
    await expect(reloadedRow.getByLabel("Adj. (min)")).toHaveValue("15");
  });

  test("deleting a row requires confirmation", async ({ page }) => {
    const row = await createRecord(page);

    // Opening the confirm and then cancelling leaves the row intact.
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(row.getByRole("button", { name: "Cancel" })).toBeVisible();
    await row.getByRole("button", { name: "Cancel" }).click();
    await expect(page.locator(".rec")).toHaveCount(1);

    // Confirming actually removes it.
    await row.getByRole("button", { name: "Delete" }).click();
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator(".rec")).toHaveCount(0);
    await expect(page.getByText("No records yet")).toBeVisible();
  });

  test("exporting CSV downloads a file named after the active tab", async ({ page }) => {
    await createRecord(page);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export CSV" }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/^Timer1_.*\.csv$/);
  });
});
