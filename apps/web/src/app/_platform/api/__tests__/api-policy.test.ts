import { afterEach, describe, expect, it, vi } from "vitest"

import { fetchWithTimeout } from "../adapters/fetch-adapter"
import { apiCapabilityContract, apiPlatformPolicy } from "../policy/api-policy"
import { createApiCapabilityReport } from "../scripts/api-capability-report"
import {
  ApiHttpError,
  createApiClient,
  getSharedApiClient,
  resetSharedApiClientForTests,
  resolveApiClientConfigFromEnv,
} from "../services/api-client-service"
import {
  joinApiUrl,
  normalizeApiBaseUrl,
  parseTimeoutMs,
} from "../utils/api-utils"

describe("_platform/api", () => {
  afterEach(() => {
    resetSharedApiClientForTests()
    vi.unstubAllGlobals()
  })

  it("keeps feature internals outside the platform boundary", () => {
    expect(apiCapabilityContract.mayImportFeatureRoots).toBe(true)
    expect(apiCapabilityContract.mayImportFeatureInternals).toBe(false)
    expect(apiPlatformPolicy.featureInternalImportPattern).toBe(
      "@/app/_features/*/*"
    )
  })

  it("joins base URL and path", () => {
    expect(joinApiUrl("", "/api/tenants/acme")).toBe("/api/tenants/acme")
    expect(joinApiUrl("http://localhost:3000", "/api/foo")).toBe(
      "http://localhost:3000/api/foo"
    )
  })

  it("normalizes API base URLs for same-origin and http backends", () => {
    expect(normalizeApiBaseUrl(undefined)).toBe("")
    expect(normalizeApiBaseUrl(" /api/ ")).toBe("/api")
    expect(normalizeApiBaseUrl("http://localhost:3000/")).toBe(
      "http://localhost:3000"
    )
    expect(() => normalizeApiBaseUrl("//api.test")).toThrow(/protocol-relative/)
    expect(() => normalizeApiBaseUrl("ftp://api.test")).toThrow(/http or https/)
  })

  it("parses timeout from env with sane bounds", () => {
    expect(parseTimeoutMs(undefined, 30_000)).toBe(30_000)
    expect(parseTimeoutMs("5000", 30_000)).toBe(5000)
    expect(parseTimeoutMs("999999", 30_000)).toBe(120_000)
  })

  it("resolves config from import.meta.env", () => {
    const cfg = resolveApiClientConfigFromEnv({
      VITE_API_BASE_URL: "http://api.test",
      VITE_API_TIMEOUT: "15000",
    } as ImportMetaEnv)

    expect(cfg.baseUrl).toBe("http://api.test")
    expect(cfg.defaultTimeoutMs).toBe(15_000)
  })

  it("creates a report for onboarding checks", () => {
    const report = createApiCapabilityReport()
    expect(report.contract.id).toBe("api")
    expect(report.requiredFolders).toEqual(
      expect.arrayContaining(["policy", "services", "adapters"])
    )
  })

  it("returns the same shared client instance", () => {
    expect(getSharedApiClient()).toBe(getSharedApiClient())
  })

  it("maps non-OK responses to ApiHttpError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({ error: "nope" }), {
            status: 404,
            statusText: "Not Found",
          })
        )
      )
    )

    const client = createApiClient({
      baseUrl: "",
      defaultTimeoutMs: 5000,
      defaultHeaders: { Accept: "application/json" },
    })

    await expect(client.get("/api/missing")).rejects.toMatchObject({
      name: "ApiHttpError",
      status: 404,
    })

    try {
      await client.get("/api/missing")
    } catch (e) {
      expect(e).toBeInstanceOf(ApiHttpError)
      expect((e as ApiHttpError).body).toEqual({ error: "nope" })
    }
  })

  it("sets JSON content type only for JSON request bodies", async () => {
    const fetchMock = vi.fn((_: RequestInfo | URL, _init?: RequestInit) =>
      Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json" },
        })
      )
    )
    vi.stubGlobal("fetch", fetchMock)

    const client = createApiClient({
      baseUrl: "",
      defaultTimeoutMs: 5000,
      defaultHeaders: { Accept: "application/json" },
    })

    await client.post("/api/json", { name: "Afenda" })
    const jsonInit = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(jsonInit.body).toBe(JSON.stringify({ name: "Afenda" }))
    expect(new Headers(jsonInit.headers).get("Content-Type")).toBe(
      "application/json"
    )

    const params = new URLSearchParams({ q: "ledger" })
    await client.post("/api/search", params)
    const paramsInit = fetchMock.mock.calls[1]?.[1] as RequestInit
    expect(paramsInit.body).toBe(params)
    expect(new Headers(paramsInit.headers).has("Content-Type")).toBe(false)
  })

  it("removes caller abort listeners after fetch settles", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response("{}")))
    )
    const caller = new AbortController()
    const removeAbortListener = vi.spyOn(caller.signal, "removeEventListener")

    await fetchWithTimeout({
      url: "/api/health",
      init: { signal: caller.signal },
      timeoutMs: 5000,
    })

    expect(removeAbortListener).toHaveBeenCalledWith(
      "abort",
      expect.any(Function)
    )
  })
})
