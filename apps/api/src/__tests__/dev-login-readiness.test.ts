import { describe, expect, it } from "vitest"

import { evaluateAfendaDevLoginEnv } from "../dev-login-readiness.js"

describe("evaluateAfendaDevLoginEnv", () => {
  it("reports not configured when env is empty", () => {
    const r = evaluateAfendaDevLoginEnv({ NODE_ENV: "development" })
    expect(r.routeRegistered).toBe(true)
    expect(r.configuredForSignIn).toBe(false)
    expect(r.missing.length).toBeGreaterThan(0)
    expect(r.missing.some((m) => m.includes("AFENDA_DEV_LOGIN_ENABLED"))).toBe(
      true
    )
  })

  it("reports configured when all dev-login vars are set", () => {
    const r = evaluateAfendaDevLoginEnv({
      NODE_ENV: "development",
      AFENDA_DEV_LOGIN_ENABLED: "true",
      AFENDA_DEV_LOGIN_EMAIL: "dev@local.test",
      AFENDA_DEV_LOGIN_PASSWORD: "secret",
      BETTER_AUTH_URL: "http://localhost:5173",
      BETTER_AUTH_SECRET: "x".repeat(32),
      DATABASE_URL: "postgresql://localhost/db",
    })
    expect(r.configuredForSignIn).toBe(true)
    expect(r.missing).toHaveLength(0)
  })

  it("does not register route in production", () => {
    const r = evaluateAfendaDevLoginEnv({
      NODE_ENV: "production",
      AFENDA_DEV_LOGIN_ENABLED: "true",
      AFENDA_DEV_LOGIN_EMAIL: "a@b.c",
      AFENDA_DEV_LOGIN_PASSWORD: "p",
    })
    expect(r.routeRegistered).toBe(false)
  })

  it("treats empty password as missing", () => {
    const r = evaluateAfendaDevLoginEnv({
      NODE_ENV: "development",
      AFENDA_DEV_LOGIN_ENABLED: "true",
      AFENDA_DEV_LOGIN_EMAIL: "a@b.c",
      AFENDA_DEV_LOGIN_PASSWORD: "",
    })
    expect(r.configuredForSignIn).toBe(false)
    expect(r.missing.some((m) => m.includes("PASSWORD"))).toBe(true)
  })
})
