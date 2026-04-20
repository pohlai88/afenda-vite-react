import { describe, expect, it } from "vitest"

import {
  normalizePublicSpaBasePath,
  publicSpaHomeHref,
} from "../public-spa-href"

describe("publicSpaHomeHref", () => {
  it.each([
    ["/", "/"],
    ["", "/"],
    [undefined, "/"],
    ["/app/", "/app"],
    ["/app", "/app"],
    ["app/", "/app"],
    [" /portal/ ", "/portal"],
    ["/nested/base/", "/nested/base"],
    ["//cdn.example.com/app", "/"],
    ["https://example.com/app", "/"],
  ])("normalizes %p -> %p", (input, expected) => {
    expect(normalizePublicSpaBasePath(input)).toBe(expected)
  })

  it("reads the Vite BASE_URL through the same normalizer", () => {
    expect(publicSpaHomeHref()).toBe(
      normalizePublicSpaBasePath(import.meta.env.BASE_URL)
    )
  })
})
