import { describe, expect, it } from "vitest"

import {
  AppError,
  badRequest,
  conflict,
  internalServerError,
  isOperationalError,
} from "../src"

describe("@afenda/errors", () => {
  it("creates typed app errors", () => {
    const error = badRequest("Invalid request", { field: "email" })

    expect(error).toBeInstanceOf(AppError)
    expect(error.code).toBe("BAD_REQUEST")
    expect(error.status).toBe(400)
    expect(error.details).toEqual({ field: "email" })
  })

  it("serializes shared error shape", () => {
    const error = conflict("Duplicate", { email: "test@example.com" })

    expect(error.toJSON()).toMatchObject({
      code: "CONFLICT",
      message: "Duplicate",
      status: 409,
      details: { email: "test@example.com" },
    })
  })

  it("distinguishes operational from system errors", () => {
    expect(isOperationalError(badRequest("Nope"))).toBe(true)
    expect(isOperationalError(internalServerError())).toBe(false)
  })
})
