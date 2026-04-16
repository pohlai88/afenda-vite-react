/* eslint-disable react-hooks/set-state-in-effect -- Syncs tenant snapshot to Better Auth session and GET /v1/me; resets when session ends. */
/* eslint-disable react-refresh/only-export-components -- Context module: provider plus colocated hooks. */
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  ApiClientHttpError,
  getSharedApiClient,
} from "../api-client/services/api-client-service"
import { resolveApiV1Path } from "../api-client/utils/api-client-utils"
import { useAfendaSession } from "../auth"

import type { AfendaMeResponse } from "./tenant-scope-types"

const STORAGE_KEY = "afenda.selectedTenantId"

/** Classifies `GET /v1/me` failures for UI + i18n (`states.tenant_scope.*`). */
export type TenantScopeErrorKind =
  | "api_session"
  | "identity_bridge"
  | "forbidden"
  | "api_unavailable"
  | "network"
  | "unknown"

/**
 * Maps `GET /v1/me` failures to a stable kind (and optional HTTP status for copy).
 * @see apps/api `GET /v1/me` — 401 session, 403 `IDENTITY_LINK_REQUIRED`, 5xx proxy/API.
 */
function resolveTenantScopeLoadError(error: unknown): {
  readonly kind: TenantScopeErrorKind
  readonly httpStatus?: number
} {
  if (error instanceof ApiClientHttpError) {
    const body =
      error.body && typeof error.body === "object"
        ? (error.body as { code?: unknown })
        : null
    const code = body?.code
    if (error.status === 401) {
      return { kind: "api_session", httpStatus: 401 }
    }
    if (error.status === 403 && code === "IDENTITY_LINK_REQUIRED") {
      return { kind: "identity_bridge", httpStatus: 403 }
    }
    if (error.status === 403) {
      return { kind: "forbidden", httpStatus: 403 }
    }
    if (error.status >= 500 || error.status === 429 || error.status === 408) {
      return { kind: "api_unavailable", httpStatus: error.status }
    }
    return { kind: "unknown", httpStatus: error.status }
  }
  if (error instanceof Error) {
    if (error.name === "AbortError" || /aborted|timeout/i.test(error.message)) {
      return { kind: "network" }
    }
    if (
      error.message === "Failed to fetch" ||
      (error.name === "TypeError" && /fetch|network/i.test(error.message))
    ) {
      return { kind: "network" }
    }
  }
  return { kind: "unknown" }
}

export type TenantScopeState =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | {
      readonly status: "ready"
      readonly me: AfendaMeResponse
      readonly selectedTenantId: string | null
      readonly setSelectedTenantId: (id: string | null) => void
    }
  | {
      readonly status: "error"
      readonly kind: TenantScopeErrorKind
      readonly httpStatus?: number
      readonly retry: () => void
    }

const TenantScopeContext = createContext<TenantScopeState | null>(null)

/**
 * After Better Auth session exists, loads `GET /v1/me` and keeps a selected tenant id
 * (for `X-Tenant-Id` on governed API calls). Persists selection in `sessionStorage`.
 */
export function TenantScopeProvider(props: { readonly children: ReactNode }) {
  const { children } = props
  const { data, isPending } = useAfendaSession()
  const [snapshot, setSnapshot] = useState<{
    readonly me: AfendaMeResponse
    readonly selectedTenantId: string | null
  } | null>(null)
  const [phase, setPhase] = useState<"idle" | "loading" | "error" | "ready">(
    "idle"
  )
  const [loadError, setLoadError] = useState<{
    readonly kind: TenantScopeErrorKind
    readonly httpStatus?: number
  } | null>(null)
  const [retryEpoch, setRetryEpoch] = useState(0)

  const retryLoad = useCallback(() => {
    setRetryEpoch((n) => n + 1)
  }, [])

  const setSelectedTenantId = useCallback((id: string | null) => {
    setSnapshot((prev) => {
      if (!prev) {
        return prev
      }
      if (typeof sessionStorage !== "undefined") {
        if (id === null || id === "") {
          sessionStorage.removeItem(STORAGE_KEY)
        } else {
          sessionStorage.setItem(STORAGE_KEY, id)
        }
      }
      return { ...prev, selectedTenantId: id }
    })
  }, [])

  useEffect(() => {
    if (isPending) {
      return
    }
    if (!data?.session) {
      setSnapshot(null)
      setPhase("idle")
      setLoadError(null)
      return
    }

    let cancelled = false
    setPhase("loading")
    setLoadError(null)

    void (async () => {
      try {
        const client = getSharedApiClient()
        const me = await client.get<AfendaMeResponse>(resolveApiV1Path("/me"))
        if (cancelled) {
          return
        }
        const tenantIds = me.afenda?.tenantIds ?? []
        const stored =
          typeof sessionStorage !== "undefined"
            ? sessionStorage.getItem(STORAGE_KEY)
            : null
        const fromStorage =
          stored !== null && tenantIds.includes(stored) ? stored : null
        const initial =
          fromStorage ?? me.afenda?.defaultTenantId ?? tenantIds[0] ?? null

        setSnapshot({ me, selectedTenantId: initial })
        setPhase("ready")
      } catch (e) {
        if (cancelled) {
          return
        }
        setSnapshot(null)
        setPhase("error")
        setLoadError(resolveTenantScopeLoadError(e))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [data?.session, isPending, retryEpoch])

  const value: TenantScopeState = useMemo(() => {
    if (phase === "loading" || (data?.session && phase === "idle")) {
      return { status: "loading" }
    }
    if (phase === "error" && loadError !== null) {
      return {
        status: "error",
        kind: loadError.kind,
        httpStatus: loadError.httpStatus,
        retry: retryLoad,
      }
    }
    if (phase === "ready" && snapshot !== null) {
      return {
        status: "ready",
        me: snapshot.me,
        selectedTenantId: snapshot.selectedTenantId,
        setSelectedTenantId,
      }
    }
    return { status: "idle" }
  }, [
    data?.session,
    phase,
    loadError,
    snapshot,
    setSelectedTenantId,
    retryLoad,
  ])

  return (
    <TenantScopeContext.Provider value={value}>
      {children}
    </TenantScopeContext.Provider>
  )
}

/**
 * Supplies a fixed {@link TenantScopeState} for tests and Storybook without Better Auth or `GET /v1/me`.
 * Do not use in production routes.
 */
export function TenantScopeTestDoubleProvider(props: {
  readonly value: TenantScopeState
  readonly children: ReactNode
}) {
  const { value, children } = props
  return (
    <TenantScopeContext.Provider value={value}>
      {children}
    </TenantScopeContext.Provider>
  )
}

export function useTenantScope(): TenantScopeState {
  const ctx = useContext(TenantScopeContext)
  if (ctx === null) {
    throw new Error("useTenantScope must be used within TenantScopeProvider")
  }
  return ctx
}

/** Returns `null` when no {@link TenantScopeProvider} ancestor (e.g. shell tests without auth tree). */
export function useOptionalTenantScope(): TenantScopeState | null {
  return useContext(TenantScopeContext)
}

/**
 * Headers to merge into `api-client` requests that require tenant scope.
 */
export function useTenantIdHeaders(): Record<string, string> {
  const scope = useTenantScope()
  return useMemo((): Record<string, string> => {
    if (scope.status !== "ready") {
      return {}
    }
    const id = scope.selectedTenantId
    if (id === null || id === "") {
      return {}
    }
    return { "X-Tenant-Id": id }
  }, [scope])
}

/** Safe variant: returns empty headers if not inside provider (for tests/storybook). */
export function useOptionalTenantIdHeaders(): Record<string, string> {
  const ctx = useContext(TenantScopeContext)
  return useMemo((): Record<string, string> => {
    if (ctx === null || ctx.status !== "ready") {
      return {}
    }
    const id = ctx.selectedTenantId
    if (id === null || id === "") {
      return {}
    }
    return { "X-Tenant-Id": id }
  }, [ctx])
}
