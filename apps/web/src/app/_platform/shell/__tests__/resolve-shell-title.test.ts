import { describe, expect, it } from "vitest"

import type { ShellMetadata } from "../contract/shell-metadata-contract"
import { resolveShellTitle } from "../services/resolve-shell-title"

describe("resolveShellTitle", () => {
  it("returns undefined when titleKey is missing", () => {
    const metadata: ShellMetadata = {}

    expect(
      resolveShellTitle({
        metadata,
        translate: (key) => `t:${key}`,
      })
    ).toBeUndefined()
  })

  it("returns undefined when titleKey is blank", () => {
    const metadata: ShellMetadata = {
      titleKey: "   ",
    }

    expect(
      resolveShellTitle({
        metadata,
        translate: (key) => `t:${key}`,
      })
    ).toBeUndefined()
  })

  it("returns the translated title when titleKey exists", () => {
    const metadata: ShellMetadata = {
      titleKey: "nav.dashboard",
    }

    expect(
      resolveShellTitle({
        metadata,
        translate: (key) => `t:${key}`,
      })
    ).toBe("t:nav.dashboard")
  })

  it("trims titleKey before translation", () => {
    const metadata: ShellMetadata = {
      titleKey: " nav.profile ",
    }

    expect(
      resolveShellTitle({
        metadata,
        translate: (key) => `resolved:${key}`,
      })
    ).toBe("resolved:nav.profile")
  })
})
