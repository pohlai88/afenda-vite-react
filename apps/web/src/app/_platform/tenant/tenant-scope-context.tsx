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

import { getSharedApiClient } from "../api-client/services/api-client-service"
import { resolveApiV1Path } from "../api-client/utils/api-client-utils"
import { useAfendaSession } from "../auth"

import type { AfendaMeResponse } from "./tenant-scope-types"

const STORAGE_KEY = "afenda.selectedTenantId"

export type TenantScopeState =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | {
      readonly status: "ready"
      readonly me: AfendaMeResponse
      readonly selectedTenantId: string | null
      readonly setSelectedTenantId: (id: string | null) => void
    }
  | { readonly status: "error"; readonly message: string }

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
      setErrorMessage(null)
      return
    }

    let cancelled = false
    setPhase("loading")
    setErrorMessage(null)

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
        const message =
          e instanceof Error ? e.message : "Failed to load tenant scope"
        setSnapshot(null)
        setPhase("error")
        setErrorMessage(message)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [data?.session, isPending])

  const value: TenantScopeState = useMemo(() => {
    if (phase === "loading" || (data?.session && phase === "idle")) {
      return { status: "loading" }
    }
    if (phase === "error" && errorMessage !== null) {
      return { status: "error", message: errorMessage }
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
  }, [data?.session, phase, errorMessage, snapshot, setSelectedTenantId])

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
