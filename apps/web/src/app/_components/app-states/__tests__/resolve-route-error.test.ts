import { describe, expect, it } from "vitest"

import { resolveRouteErrorMessage } from "../resolve-route-error"

describe("resolveRouteErrorMessage", () => {
  it("formats route error responses", () => {
    const err = {
      status: 404,
      statusText: "Not Found",
      data: null,
      internal: false,
    }
    expect(resolveRouteErrorMessage(err)).toBe("404 Not Found")
  })

  it("falls back to status when statusText is empty", () => {
    const err = { status: 500, statusText: "", data: null, internal: false }
    expect(resolveRouteErrorMessage(err)).toBe("500")
  })

  it("reads Error.message", () => {
    expect(resolveRouteErrorMessage(new Error("x"))).toBe("x")
  })

  it("stringifies unknown values", () => {
    expect(resolveRouteErrorMessage(42)).toBe("42")
  })
})
