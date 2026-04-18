import { afterEach, describe, expect, it, vi } from "vitest"

import {
  afendaAuthAllPluginsEnabled,
  afendaAuthPasskeyPluginOn,
  afendaAuthTestUtilsPluginOn,
} from "./afenda-auth-plugin-flags.js"

describe("afenda-auth-plugin-flags", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("defaults all-plugins to on when AFENDA_AUTH_ALL_PLUGINS is unset", () => {
    vi.stubEnv("AFENDA_AUTH_ALL_PLUGINS", "")
    expect(afendaAuthAllPluginsEnabled()).toBe(true)
  })

  it("disables all-plugins mode when AFENDA_AUTH_ALL_PLUGINS is false", () => {
    vi.stubEnv("AFENDA_AUTH_ALL_PLUGINS", "false")
    expect(afendaAuthAllPluginsEnabled()).toBe(false)
  })

  it("honors legacy passkey flag when all-plugins is off", () => {
    vi.stubEnv("AFENDA_AUTH_ALL_PLUGINS", "false")
    vi.stubEnv("AFENDA_AUTH_DISABLE_PASSKEY", "")
    vi.stubEnv("AFENDA_AUTH_PASSKEY_ENABLED", "")
    expect(afendaAuthPasskeyPluginOn()).toBe(false)
    vi.stubEnv("AFENDA_AUTH_PASSKEY_ENABLED", "true")
    expect(afendaAuthPasskeyPluginOn()).toBe(true)
  })

  describe("afendaAuthTestUtilsPluginOn (Better Auth testUtils plugin)", () => {
    it("is on when NODE_ENV is test", () => {
      vi.stubEnv("NODE_ENV", "test")
      vi.stubEnv("AFENDA_AUTH_TEST_UTILS", "")
      expect(afendaAuthTestUtilsPluginOn()).toBe(true)
    })

    it("is on when AFENDA_AUTH_TEST_UTILS is true (e.g. explicit opt-in outside Vitest)", () => {
      vi.stubEnv("NODE_ENV", "production")
      vi.stubEnv("AFENDA_AUTH_TEST_UTILS", "true")
      expect(afendaAuthTestUtilsPluginOn()).toBe(true)
    })

    it("is off in production when AFENDA_AUTH_TEST_UTILS is unset", () => {
      vi.stubEnv("NODE_ENV", "production")
      vi.stubEnv("AFENDA_AUTH_TEST_UTILS", "")
      expect(afendaAuthTestUtilsPluginOn()).toBe(false)
    })
  })
})
