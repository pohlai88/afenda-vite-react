import { createApp } from "../app.js"

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

  it("GET /v1/auth/sessions returns session payload", async () => {
    const app = createApp({} as never, authStub)
    const res = await app.request("/v1/auth/sessions")
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      data: { sessions: Array<{ id: string }> }
    }
    expect(body.data.sessions.length).toBeGreaterThan(0)
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
    expect(body.error.code).toBe("auth.sessions.invalid_id")
  })

  it("POST /v1/auth/challenge/verify rejects disabled passkey challenge", async () => {
    const prev = process.env.AFENDA_AUTH_PASSKEY_ENABLED
    process.env.AFENDA_AUTH_PASSKEY_ENABLED = "false"
    try {
      const app = createApp({} as never, authStub)
      const res = await app.request("/v1/auth/challenge/verify", {
        method: "POST",
        body: JSON.stringify({
          challengeId: "pk_test",
          type: "passkey_assertion",
          expiresAt: new Date(Date.now() + 60_000).toISOString(),
          attemptsRemaining: 3,
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
