import { expect, test } from "@playwright/test"

/**
 * Prefer `commit` over default `load` for SPAs (Vite/React): navigation resolves when the response
 * is received and loading starts — then web-first `expect(locator)` waits for UI readiness.
 * (`networkidle` is discouraged; see Frame#page.goto waitUntil in Playwright docs.)
 * @see https://playwright.dev/docs/api/class-frame#page-goto
 */
const NAV = { waitUntil: "commit" as const }

/**
 * Better Auth end-to-end (API wiring + Afenda auth UX).
 *
 * Covers:
 * - API: Better Auth mounted behind Vite `/api` proxy (`/api/auth/ok`)
 * - UI: login / register / forgot-password shells (i18n, identity panels, forms)
 *
 * Run: `pnpm --filter @afenda/web run test:e2e` (from repo root after `playwright install chromium`).
 */

test.describe("Better Auth API (via Vite proxy)", () => {
  test("GET /api/auth/ok reports Better Auth mounted", async ({ request }) => {
    const res = await request.get("/api/auth/ok")
    expect(res.ok()).toBeTruthy()
    const json = (await res.json()) as {
      ok?: boolean
      betterAuthMounted?: boolean
    }
    expect(json.ok).toBe(true)
    expect(json.betterAuthMounted).toBe(true)
  })
})

test.describe("Auth UI / UX", () => {
  test("login: command-center layout, identify step, and links", async ({
    page,
  }) => {
    await page.goto("/auth/login", NAV)

    await expect(
      page.getByRole("heading", { name: "Sign in", level: 1 })
    ).toBeVisible()

    await expect(page.getByText("Identity intelligence")).toBeVisible()
    await expect(page.getByText("Session continuity")).toBeVisible()

    await expect(page.locator("#login-identify-email")).toBeVisible()
    await expect(
      page.getByRole("button", {
        name: "Continue to method selection",
        exact: true,
      })
    ).toBeVisible()

    await expect(
      page.getByRole("link", { name: "Create account" })
    ).toBeVisible()
    /** Session continuity panel — not the marketing.login footer (forgot link is on password step). */
    await expect(
      page.getByRole("link", { name: "Open recovery options" })
    ).toBeVisible()
  })

  test("register: create-account shell", async ({ page }) => {
    await page.goto("/auth/register", NAV)
    await expect(
      page.getByRole("heading", { name: "Create account", level: 1 })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible()
  })

  test("forgot password: reset flow entry", async ({ page }) => {
    await page.goto("/auth/forgot-password", NAV)
    await expect(
      page.getByRole("heading", { name: "Reset password", level: 1 })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Send reset link" })
    ).toBeVisible()
  })
})
