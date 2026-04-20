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

  it("reads route error data message when statusText is blank", () => {
    const err = {
      status: 400,
      statusText: "   ",
      data: { message: "Validation failed" },
      internal: false,
    }
    expect(resolveRouteErrorMessage(err)).toBe("400 Validation failed")
  })

  it("returns a trimmed Error.message", () => {
    expect(resolveRouteErrorMessage(new Error("  x  "))).toBe("x")
  })

  it("falls back to the error name when Error.message is blank", () => {
    const err = new Error("   ")
    err.name = "TypeError"

    expect(resolveRouteErrorMessage(err)).toBe("TypeError")
  })

  it("reads message from plain objects", () => {
    expect(resolveRouteErrorMessage({ message: "  bad request  " })).toBe(
      "bad request"
    )
  })

  it("collapses multiline string errors into a single line", () => {
    expect(resolveRouteErrorMessage("Failed\n\nrequest")).toBe("Failed request")
  })

  it("stringifies unknown values", () => {
    expect(resolveRouteErrorMessage(42)).toBe("42")
  })

  it("falls back to unknown error for blank strings and nullish values", () => {
    expect(resolveRouteErrorMessage("   ")).toBe("Unknown error")
    expect(resolveRouteErrorMessage(null)).toBe("Unknown error")
    expect(resolveRouteErrorMessage(undefined)).toBe("Unknown error")
  })
})
