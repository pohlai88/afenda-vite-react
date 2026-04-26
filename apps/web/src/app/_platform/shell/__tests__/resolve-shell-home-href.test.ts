import { describe, expect, it } from "vitest"

import { resolveShellHomeHref } from "../services/resolve-shell-home-href"

describe("resolveShellHomeHref", () => {
  it("prefers the first active allowed route in shell order", () => {
    expect(resolveShellHomeHref(["ops:event:view", "ops:audit:view"])).toBe(
      "/app/dashboard"
    )
  })

  it("returns the dashboard when gated workspace routes are absent", () => {
    expect(resolveShellHomeHref(["ops:audit:view"])).toBe("/app/dashboard")
  })

  it("returns the dashboard when no permission-gated workspace routes are allowed", () => {
    expect(resolveShellHomeHref([])).toBe("/app/dashboard")
  })
})
