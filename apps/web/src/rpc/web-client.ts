/**
 * Typed Hono client (`hc<AppType>`) sharing the API's route types from `@afenda/api/app`.
 * Owns base URL resolution for dev proxy vs absolute `VITE_API_BASE_URL`; no request helpers.
 * platform · http · rpc · hono-rpc
 * Upstream: hono/client; types from `apps/api/src/app`. Env: `VITE_API_BASE_URL`.
 * Downstream: feature modules import `api` or wrap in hooks/services.
 * Side effects: none (client factory only).
 * Coupling: must stay aligned with `createApp()` route tree.
 * stable
 * @module rpc/web-client
 * @package @afenda/web
 */
import { hc } from "hono/client"

import type { AppType } from "@afenda/api/app"

import { normalizeApiClientBaseUrl } from "@/app/_platform/runtime"

function resolveHcBaseUrl(): string {
  const normalized = normalizeApiClientBaseUrl(
    import.meta.env.VITE_API_BASE_URL
  )
  if (normalized !== "" && /^https?:\/\//i.test(normalized)) {
    return normalized
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    if (normalized.startsWith("/")) {
      return `${window.location.origin}${normalized === "/" ? "" : normalized}`
    }
    return window.location.origin
  }
  return "http://localhost:8787"
}

function createHonoRpcClient(baseUrl: string) {
  return hc<AppType>(baseUrl, {
    init: {
      credentials: "include",
    },
    headers: {
      "x-request-id": crypto.randomUUID(),
    },
  })
}

export type HonoRpcClient = ReturnType<typeof createHonoRpcClient>

export const api: HonoRpcClient = createHonoRpcClient(resolveHcBaseUrl())

/**
 * Explicit base URL (tests, scripts, non-browser). Default SPA entry is {@link api}.
 * Pack parity: `credentials: "include"`, `x-request-id` on the client instance.
 */
export function createApiClient(baseUrl: string): HonoRpcClient {
  return createHonoRpcClient(baseUrl)
}

/** Explicit API origin for scripts / examples; SPA default remains {@link api}. */
const API_BASE_URL = "http://localhost:8787"

export const apiClient = createApiClient(API_BASE_URL)
