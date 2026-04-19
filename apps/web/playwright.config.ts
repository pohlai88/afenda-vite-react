import path from "node:path"
import { fileURLToPath } from "node:url"

import { defineConfig, devices } from "@playwright/test"

const configDir = path.dirname(fileURLToPath(import.meta.url))
const webAppDir = configDir

/** Centralized under `apps/web/.artifacts/` (gitignored). */
const playwrightArtifacts = path.join(webAppDir, ".artifacts", "playwright")
const playwrightReportDir = path.join(playwrightArtifacts, "report")
const playwrightResultsDir = path.join(playwrightArtifacts, "results")

/** Dedicated port so E2E does not fight a developer’s normal Vite dev server on 5173. */
const e2eWebPort = process.env.E2E_WEB_PORT?.trim() || "5199"
/** Use `localhost` (not `127.0.0.1`) so the URL matches Vite’s dev banner and Playwright’s readiness probe. */
const e2eOrigin = `http://localhost:${e2eWebPort}`

const reuseExisting =
  process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "true" ||
  process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "1"

/**
 * End-to-end Better Auth + Afenda auth UI (see `e2e/better-auth.spec.ts`).
 *
 * Prereqs: repo-root `.env` with a working `DATABASE_URL` and `BETTER_AUTH_SECRET`.
 *
 * **API:** `@afenda/api` must listen on port **8787** (default) before tests — `e2e/global-setup.ts` waits up to 90s.
 * Start it in another terminal: `pnpm --filter @afenda/api dev`
 *
 * **Web:** Playwright starts **only Vite** on `E2E_WEB_PORT` (default **5199**) so it does not collide with a normal dev server on 5173.
 *
 * - First time: `pnpm --filter @afenda/web exec playwright install chromium`
 * - Full stack: Terminal 1 `pnpm --filter @afenda/api dev` → Terminal 2 `pnpm --filter @afenda/web run test:e2e`
 * - Reuse an already-running Vite on 5199: `PLAYWRIGHT_REUSE_EXISTING_SERVER=1 pnpm --filter @afenda/web run test:e2e`
 */
export default defineConfig({
  testDir: "./e2e",
  /** Test artifacts (screenshots, traces, attachments) — not HTML report. */
  outputDir: playwrightResultsDir,
  globalSetup: "./e2e/global-setup.ts",
  /** Default per-test timeout — Vite’s first compile + SPA hydration can exceed Playwright’s 30s default. @see https://playwright.dev/docs/test-timeouts */
  timeout: 90_000,
  /** Default for `expect(locator).toBeVisible()` etc. (Playwright default is 5000ms). @see https://playwright.dev/docs/test-configuration */
  expect: {
    timeout: 20_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  /** SPA + Vite dev: avoid hammering the dev server with parallel navigations before deps are warm. */
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: playwrightReportDir }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || e2eOrigin,
    /** @see https://playwright.dev/docs/test-timeouts#global-timeout */
    navigationTimeout: 60_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: reuseExisting
    ? undefined
    : {
        // Invoke Vite directly so `--strictPort` is not swallowed by pnpm’s `--` forwarding.
        command: `node --disable-warning=ExperimentalWarning ./node_modules/vite/bin/vite.js --configLoader bundle --strictPort --port ${e2eWebPort}`,
        cwd: webAppDir,
        env: {
          ...process.env,
          /** Skip `@vitejs/devtools` during Playwright (avoids permission prompts / RPC noise). */
          E2E: "true",
          /** Avoid clashing with a dev’s primary Vite HMR port when reusing machines. */
          VITE_HMR_PORT: process.env.VITE_HMR_PORT_E2E || "24679",
        },
        url: e2eOrigin,
        /** @see https://playwright.dev/docs/test-web-server — reuse locally; fresh server in CI. */
        reuseExistingServer: reuseExisting || !process.env.CI,
        timeout: 120_000,
        stdout: "ignore",
        stderr: "pipe",
      },
})
