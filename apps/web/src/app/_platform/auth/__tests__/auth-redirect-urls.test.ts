import { describe, expect, it } from "vitest"

import { authPostLoginPath } from "../auth-redirect-urls"
import type { AuthReturnTarget } from "../contracts/auth-return-target"

describe("authPostLoginPath", () => {
  it("uses structured state.returnTarget (pathname + search + hash)", () => {
    const returnTarget: AuthReturnTarget = {
      pathname: "/app/workspace-demo",
      search: "?tab=1",
      hash: "#pane",
    }
    expect(authPostLoginPath({ returnTarget })).toBe(
      "/app/workspace-demo?tab=1#pane"
    )
  })

  it("uses legacy state.from as structured object", () => {
    const from: AuthReturnTarget = {
      pathname: "/app/workspace-demo",
      search: "?tab=1",
      hash: "",
    }
    expect(authPostLoginPath({ from })).toBe("/app/workspace-demo?tab=1")
  })

  it("uses legacy string from when safe", () => {
    expect(authPostLoginPath({ from: "/app/workspace-demo" })).toBe(
      "/app/workspace-demo"
    )
  })

  it("parses search and hash from legacy combined string", () => {
    expect(authPostLoginPath({ from: "/app/workspace-demo?tab=1#pane" })).toBe(
      "/app/workspace-demo?tab=1#pane"
    )
  })

  it("ignores open redirects", () => {
    expect(authPostLoginPath({ from: "//evil.com" })).toMatch(/\/app$/)
  })

  it("falls back to shell home when state is empty", () => {
    expect(authPostLoginPath(undefined)).toMatch(/\/app$/)
  })
})
