import { describe, expect, it } from "vitest"

import { cn } from "../cn"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("dedupes conflicting Tailwind utilities via tailwind-merge", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})
