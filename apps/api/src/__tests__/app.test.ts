import { createApp } from "../app.js"

const authStub = {
  handler: async () => new Response("not found", { status: 404 }),
}

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
})
