import { createApp } from "../app.js"

describe("createApp", () => {
  it("GET /health returns ok", async () => {
    const app = createApp({} as never)
    const res = await app.request("/health")
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean }
    expect(body.ok).toBe(true)
  })

  it("POST /v1/audit/demo rejects without tenant header", async () => {
    const app = createApp({} as never)
    const res = await app.request("/v1/audit/demo", { method: "POST" })
    expect(res.status).toBe(400)
  })
})
