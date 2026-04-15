import { describe, expect, it } from "vitest"

import { authPostLoginPath } from "../auth-redirect-urls"

describe("authPostLoginPath", () => {
  it("uses state.from when it is a safe in-app path", () => {
    expect(authPostLoginPath({ from: "/app/workspace-demo" })).toBe(
      "/app/workspace-demo"
    )
  })

  it("ignores open redirects", () => {
    expect(authPostLoginPath({ from: "//evil.com" })).toMatch(/\/app$/)
  })

  it("falls back to shell home when state is empty", () => {
    expect(authPostLoginPath(undefined)).toMatch(/\/app$/)
  })
})
