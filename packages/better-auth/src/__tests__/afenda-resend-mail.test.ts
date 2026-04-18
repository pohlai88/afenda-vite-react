import { isAPIError } from "better-auth/api"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const sendMock = vi.fn()

vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = {
      send: (payload: unknown) => sendMock(payload),
    }
  },
}))

import {
  AFENDA_EMAIL_DELIVERY_FAILED,
  AFENDA_EMAIL_DELIVERY_FAILED_MESSAGE,
  redactUrlForDevLog,
  resetResendClientForTests,
  sendVerificationEmail,
} from "../afenda-resend-mail.js"

function expectEmailDeliveryApiError(
  error: unknown,
  expectedStatusCode: number
): void {
  expect(isAPIError(error)).toBe(true)
  if (!isAPIError(error)) return
  expect(error.statusCode).toBe(expectedStatusCode)
  expect(error.body).toMatchObject({
    code: AFENDA_EMAIL_DELIVERY_FAILED,
    message: AFENDA_EMAIL_DELIVERY_FAILED_MESSAGE,
  })
}

describe("redactUrlForDevLog", () => {
  it("strips query strings from absolute URLs", () => {
    expect(
      redactUrlForDevLog("https://example.com/verify?token=secret&x=1")
    ).toBe("https://example.com/verify")
  })

  it("strips query from malformed href-like strings", () => {
    expect(redactUrlForDevLog("/path?token=abc")).toBe("/path")
  })
})

describe("sendVerificationEmail (Resend)", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    resetResendClientForTests()
    delete process.env.RESEND_API_KEY
    delete process.env.RESEND_FROM_EMAIL
    process.env.NODE_ENV = "test"
  })

  afterEach(() => {
    resetResendClientForTests()
    delete process.env.RESEND_API_KEY
    process.env.NODE_ENV = "test"
  })

  it("resolves without calling Resend when API key is unset (non-production)", async () => {
    await sendVerificationEmail({
      to: "a@b.com",
      url: "https://app/callback?token=x",
    })
    expect(sendMock).not.toHaveBeenCalled()
  })

  it("throws when API key is unset in production", async () => {
    process.env.NODE_ENV = "production"
    await expect(
      sendVerificationEmail({
        to: "a@b.com",
        url: "https://app/callback",
      })
    ).rejects.toSatisfy((e: unknown) => {
      expectEmailDeliveryApiError(e, 503)
      return true
    })
  })

  it("throws when Resend returns an error payload", async () => {
    process.env.RESEND_API_KEY = "re_test_key_for_unit_tests"
    sendMock.mockResolvedValueOnce({
      data: null,
      error: {
        message: "Invalid",
        statusCode: 422,
        name: "validation_error",
      },
    })

    await expect(
      sendVerificationEmail({
        to: "a@b.com",
        url: "https://app/callback",
      })
    ).rejects.toSatisfy((e: unknown) => {
      expectEmailDeliveryApiError(e, 502)
      return true
    })
  })

  it("sends when configured and Resend succeeds", async () => {
    process.env.RESEND_API_KEY = "re_test_key_for_unit_tests"
    sendMock.mockResolvedValueOnce({
      data: { id: "email-id" },
      error: null,
    })

    await sendVerificationEmail({
      to: "a@b.com",
      url: "https://app/callback",
    })

    expect(sendMock).toHaveBeenCalledTimes(1)
    const payload = sendMock.mock.calls[0][0] as { to: string[] }
    expect(payload.to).toEqual(["a@b.com"])
  })
})
