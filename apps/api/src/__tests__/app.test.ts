import { beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../app.js"
import { __resetUsersForTests } from "../modules/users/user.service.js"

describe("createApp (scaffold)", () => {
  beforeEach(() => {
    __resetUsersForTests()
  })
  it("GET /health returns ok", async () => {
    const app = createApp()
    const res = await app.request("/health")
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ok?: boolean
      data?: { status?: string }
    }
    expect(body.ok).toBe(true)
    expect(body.data?.status).toBe("ok")
  })

  it("GET / returns service map", async () => {
    const app = createApp()
    const res = await app.request("/")
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ok?: boolean
      data?: { service?: string; runtime?: string; version?: string }
    }
    expect(body.ok).toBe(true)
    expect(body.data?.service).toBe("@afenda/api")
    expect(body.data?.runtime).toBe("node")
    expect(typeof body.data?.version).toBe("string")
  })

  it("GET /api/users returns an empty list initially", async () => {
    const app = createApp()
    const res = await app.request("/api/users")
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok?: boolean; data?: unknown[] }
    expect(body.ok).toBe(true)
    expect(body.data).toEqual([])
  })

  it("POST /api/users accepts valid JSON and returns User", async () => {
    const app = createApp()
    const res = await app.request("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", name: "Ada" }),
    })
    expect(res.status).toBe(201)
    const body = (await res.json()) as {
      ok?: boolean
      data?: { id?: string; email?: string; name?: string }
    }
    expect(body.ok).toBe(true)
    expect(body.data?.email).toBe("user@example.com")
    expect(body.data?.name).toBe("Ada")
    expect(body.data?.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it("GET /api/users lists users after create", async () => {
    const app = createApp()
    await app.request("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "list@example.com", name: "Bob" }),
    })
    const res = await app.request("/api/users")
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      ok?: boolean
      data?: Array<{ email?: string; name?: string }>
    }
    expect(body.ok).toBe(true)
    expect(body.data).toHaveLength(1)
    expect(body.data?.[0]?.email).toBe("list@example.com")
    expect(body.data?.[0]?.name).toBe("Bob")
  })

  it("POST /api/users returns 400 when body fails Zod validation", async () => {
    const app = createApp()
    const res = await app.request("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", name: "" }),
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { success?: boolean }
    expect(body.success).toBe(false)
  })
})
