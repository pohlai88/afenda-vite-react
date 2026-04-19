import { beforeEach, vi } from "vitest"

import { createApp } from "../app.js"

beforeEach(() => {
  process.env.BETTER_AUTH_SECRET =
    "test-secret-for-challenge-tests-min-32-chars!!"
})

const authStub = {
  handler: async () => new Response("not found", { status: 404 }),
  api: {
    getSession: async () => ({
      session: { id: "test-session" },
      user: {
        id: "test-user",
        email: "test@afenda.local",
        name: "Test User",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }),
  },
} as import("@afenda/better-auth").AfendaAuth

describe("createApp", () => {
  it("GET /health returns ok", async () => {
    const app = createApp({} as never, authStub)
    const res = await app.request("/health")
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean }
    expect(body.ok).toBe(true)
  })

  it("GET /api/auth/ok confirms Better Auth route wiring", async () => {
    const app = createApp({} as never, authStub)
    const res = await app.request("/api/auth/ok")
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ok: boolean
      betterAuthMounted: boolean
    }
    expect(body.ok).toBe(true)
    expect(body.betterAuthMounted).toBe(true)
  })

  it("POST /v1/audit/demo rejects without tenant header", async () => {
    const app = createApp({} as never, authStub)
    const res = await app.request("/v1/audit/demo", { method: "POST" })
    expect(res.status).toBe(400)
  })

  it("GET /v1/auth/intelligence returns envelope", async () => {
    const app = createApp({} as never, authStub)
    const res = await app.request("/v1/auth/intelligence")
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      data: { score: number; trustLevel: string }
      meta: { timestamp: string }
    }
    expect(body.data.score).toBeGreaterThan(0)
    expect(typeof body.data.trustLevel).toBe("string")
    expect(typeof body.meta.timestamp).toBe("string")
  })

  it("GET /v1/auth/sessions returns 503 without PostgreSQL session storage", async () => {
    const app = createApp({} as never, authStub)
    const res = await app.request("/v1/auth/sessions")
    expect(res.status).toBe(503)
    const body = (await res.json()) as {
      error: { code: string }
    }
    expect(body.error.code).toBe("auth.sessions.storage_unavailable")
  })

  it("POST /v1/auth/sessions/revoke validates session id", async () => {
    const app = createApp({} as never, authStub)
    const res = await app.request("/v1/auth/sessions/revoke", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as {
      error: { code: string }
    }
    expect(body.error.code).toBe("auth.sessions.revoke.invalid_body")
  })

  it("POST /v1/auth/challenge/start rejects passkey when disabled", async () => {
    const prev = process.env.AFENDA_AUTH_PASSKEY_ENABLED
    process.env.AFENDA_AUTH_PASSKEY_ENABLED = "false"
    try {
      const app = createApp({} as never, authStub)
      const res = await app.request("/v1/auth/challenge/start", {
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          method: "passkey",
        }),
        headers: { "content-type": "application/json" },
      })
      expect(res.status).toBe(400)
      const body = (await res.json()) as {
        error: { code: string }
      }
      expect(body.error.code).toBe("auth.challenge.passkey_disabled")
    } finally {
      process.env.AFENDA_AUTH_PASSKEY_ENABLED = prev
    }
  })

  it("POST /v1/auth/challenge/start then verify succeeds for totp (opaque ticket)", async () => {
    let otpLogLine = ""
    const infoSpy = vi.spyOn(console, "info").mockImplementation((msg) => {
      otpLogLine = String(msg)
    })
    const app = createApp({} as never, authStub)
    const start = await app.request("/v1/auth/challenge/start", {
      method: "POST",
      body: JSON.stringify({
        email: "user@example.com",
        method: "totp",
      }),
      headers: { "content-type": "application/json" },
    })
    infoSpy.mockRestore()
    expect(start.status).toBe(200)
    const started = (await start.json()) as {
      data: {
        ticket: { challengeId: string; method: string }
      }
    }
    const otpMatch = otpLogLine.match(/: (\d{6})\s*$/)
    const otpCode = otpMatch?.[1]
    expect(otpCode).toBeDefined()
    const verify = await app.request("/v1/auth/challenge/verify", {
      method: "POST",
      body: JSON.stringify({
        challengeId: started.data.ticket.challengeId,
        method: "totp",
        proof: { code: otpCode },
      }),
      headers: { "content-type": "application/json" },
    })
    expect(verify.status).toBe(200)
    const out = (await verify.json()) as {
      data: { verified: boolean; receipt: string[] }
    }
    expect(out.data.verified).toBe(true)
    expect(out.data.receipt.length).toBeGreaterThan(0)
  })

  it("GET /v1/studio/glossary returns glossary snapshot with ETag", async () => {
    const app = createApp({} as never, authStub)
    const res = await app.request("/v1/studio/glossary")
    expect(res.status).toBe(200)
    const etag = res.headers.get("etag")
    expect(etag).toMatch(/^"[a-f0-9]{64}"$/)
    const body = (await res.json()) as {
      document_kind: string
      entries: unknown[]
      source_content_sha256: string
    }
    expect(body.document_kind).toBe("business_glossary_snapshot")
    expect(Array.isArray(body.entries)).toBe(true)
    expect(body.source_content_sha256).toBe(etag?.replace(/^"|"$/g, ""))

    const notModified = await app.request("/v1/studio/glossary", {
      headers: { "if-none-match": etag ?? "" },
    })
    expect(notModified.status).toBe(304)
  })

  it("POST /v1/auth/challenge/verify rejects passkey when disabled", async () => {
    const prev = process.env.AFENDA_AUTH_PASSKEY_ENABLED
    process.env.AFENDA_AUTH_PASSKEY_ENABLED = "false"
    try {
      const app = createApp({} as never, authStub)
      const res = await app.request("/v1/auth/challenge/verify", {
        method: "POST",
        body: JSON.stringify({
          challengeId: "chlg_nonexistent",
          method: "passkey",
        }),
        headers: { "content-type": "application/json" },
      })
      expect(res.status).toBe(400)
      const body = (await res.json()) as {
        error: { code: string }
      }
      expect(body.error.code).toBe("auth.challenge.passkey_disabled")
    } finally {
      process.env.AFENDA_AUTH_PASSKEY_ENABLED = prev
    }
  })
})
