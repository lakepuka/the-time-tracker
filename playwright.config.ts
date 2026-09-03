import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests drive a real `next dev` server in a real browser. Each test gets
 * a fresh browser context (Playwright's default), so localStorage — where
 * this app keeps all of its state — starts empty every time; no manual
 * cleanup needed between tests.
 *
 * Run with `pnpm test:e2e` (headless) or `pnpm test:e2e:ui` (interactive).
 * Requires `pnpm exec playwright install chromium` once, to fetch the
 * browser binary (not a pnpm dependency, so it isn't pulled in by
 * `pnpm install`).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Only one `next dev` per directory (see CLAUDE.md) — reuse it if it's
  // already running instead of trying to start a second one.
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
