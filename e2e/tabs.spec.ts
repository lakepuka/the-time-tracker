import { expect, test } from "@playwright/test";

test.describe("tabs", () => {
  test("adding, naming, switching and deleting a tab", async ({ page }) => {
    await page.goto("/");

    const defaultTab = page.getByRole("button", { name: "Timer1" });
    await expect(defaultTab).toHaveAttribute("aria-current", "true");

    // Add a tab: the name field appears focused and empty, ready to type.
    await page.getByRole("button", { name: "Add tab" }).click();
    await page.getByLabel("New tab name").fill("Client A");
    await page.getByLabel("New tab name").press("Enter");

    const newTab = page.getByRole("button", { name: "Client A" });
    await expect(newTab).toBeVisible();
    await expect(newTab).toHaveAttribute("aria-current", "true");
    await expect(defaultTab).toHaveAttribute("aria-current", "false");

    // Switching back to the original tab moves the active state.
    await defaultTab.click();
    await expect(defaultTab).toHaveAttribute("aria-current", "true");
    await expect(newTab).toHaveAttribute("aria-current", "false");

    // Deleting a tab goes through settings and a native confirm dialog.
    await page.getByRole("button", { name: "Settings" }).click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete Client A" }).click();

    await expect(page.getByRole("button", { name: "Client A" })).toHaveCount(0);
  });

  test("renaming the active tab updates the tab switcher", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Settings" }).click();
    const renameField = page.locator("ul li input[type='text']").first();
    await renameField.fill("Work");

    await expect(page.getByRole("button", { name: "Work" })).toBeVisible();
  });
});
