import { describe, expect, it } from "vitest"

import { resolveShellHomeHref } from "../services/resolve-shell-home-href"

describe("resolveShellHomeHref", () => {
  it("prefers the first active allowed route in shell order", () => {
    expect(resolveShellHomeHref(["ops:event:view", "ops:audit:view"])).toBe(
      "/app/events"
    )
  })

  it("falls through to the next active route when events access is absent", () => {
    expect(resolveShellHomeHref(["ops:audit:view"])).toBe("/app/audit")
  })

  it("returns null when no active app routes are allowed", () => {
    expect(resolveShellHomeHref([])).toBeNull()
  })
})
