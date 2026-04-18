import { afterEach, describe, expect, it, vi } from "vitest"

import { buildAfendaAuthPlugins } from "../build-afenda-auth-plugins.js"

const minimalCtx = {
  baseURL: "http://localhost:3000",
  rpId: "localhost",
  socialProviders: {} as Record<
    string,
    { clientId: string; clientSecret: string }
  >,
  betterAuthInfraKey: undefined as string | undefined,
}

function pluginIds(plugins: unknown[]): string[] {
  return plugins
    .filter(
      (p): p is { id: string } =>
        typeof p === "object" &&
        p !== null &&
        "id" in p &&
        typeof (p as { id: unknown }).id === "string"
    )
    .map((p) => p.id)
}

describe("buildAfendaAuthPlugins — testUtils plugin", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("registers Better Auth testUtils (id test-utils) when NODE_ENV is test", () => {
    vi.stubEnv("NODE_ENV", "test")
    vi.stubEnv("AFENDA_AUTH_TEST_UTILS", "")
    vi.stubEnv("AFENDA_AUTH_TEST_UTILS_CAPTURE_OTP", "")
    const plugins = buildAfendaAuthPlugins(minimalCtx)
    expect(pluginIds(plugins)).toContain("test-utils")
    const tu = plugins.find(
      (p): p is { id: string; options?: { captureOTP?: boolean } } =>
        typeof p === "object" &&
        p !== null &&
        "id" in p &&
        (p as { id: string }).id === "test-utils"
    )
    expect(tu?.options?.captureOTP).toBe(true)
  })

  it("registers test-utils when AFENDA_AUTH_TEST_UTILS=true even if NODE_ENV is production", () => {
    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("AFENDA_AUTH_TEST_UTILS", "true")
    const plugins = buildAfendaAuthPlugins(minimalCtx)
    expect(pluginIds(plugins)).toContain("test-utils")
  })

  it("does not register test-utils in production when AFENDA_AUTH_TEST_UTILS is unset", () => {
    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("AFENDA_AUTH_TEST_UTILS", "")
    const plugins = buildAfendaAuthPlugins(minimalCtx)
    expect(pluginIds(plugins)).not.toContain("test-utils")
  })

  it("passes captureOTP: false when AFENDA_AUTH_TEST_UTILS_CAPTURE_OTP=false", () => {
    vi.stubEnv("NODE_ENV", "test")
    vi.stubEnv("AFENDA_AUTH_TEST_UTILS_CAPTURE_OTP", "false")
    const plugins = buildAfendaAuthPlugins(minimalCtx)
    const tu = plugins.find(
      (p): p is { id: string; options?: { captureOTP?: boolean } } =>
        typeof p === "object" &&
        p !== null &&
        "id" in p &&
        (p as { id: string }).id === "test-utils"
    )
    expect(tu?.options?.captureOTP).toBe(false)
  })
})
