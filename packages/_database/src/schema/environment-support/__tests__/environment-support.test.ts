import { describe, expect, it } from "vitest"

import {
  optionalCoercedIntegerSchema,
  optionalIntegerWithDefault,
  readOptionalInteger,
} from ".."

describe("readOptionalInteger", () => {
  it("returns fallback for undefined, blank, or non-integer tokens", () => {
    expect(readOptionalInteger(undefined, 7)).toBe(7)
    expect(readOptionalInteger("", 7)).toBe(7)
    expect(readOptionalInteger("   ", 7)).toBe(7)
    expect(readOptionalInteger("12.5", 7)).toBe(7)
    expect(readOptionalInteger("99x", 7)).toBe(7)
    expect(readOptionalInteger("x12", 7)).toBe(7)
  })

  it("parses plain integer strings", () => {
    expect(readOptionalInteger("0", 7)).toBe(0)
    expect(readOptionalInteger(" 42 ", 7)).toBe(42)
    expect(readOptionalInteger("-3", 7)).toBe(-3)
  })

  it("rejects values outside safe integer range", () => {
    const tooBig = `${Number.MAX_SAFE_INTEGER}0`
    expect(readOptionalInteger(tooBig, 7)).toBe(7)
  })
})

describe("optionalCoercedIntegerSchema", () => {
  it("parses valid tokens and empty to undefined", () => {
    expect(optionalCoercedIntegerSchema.parse("")).toBeUndefined()
    expect(optionalCoercedIntegerSchema.parse(undefined)).toBeUndefined()
    expect(optionalCoercedIntegerSchema.parse(" 41 ")).toBe(41)
  })

  it("rejects non-integer strings", () => {
    expect(optionalCoercedIntegerSchema.safeParse("41x").success).toBe(false)
  })
})

describe("optionalIntegerWithDefault", () => {
  it("applies fallback", () => {
    const s = optionalIntegerWithDefault(9)
    expect(s.parse(undefined)).toBe(9)
    expect(s.parse("")).toBe(9)
    expect(s.parse("3")).toBe(3)
  })
})
