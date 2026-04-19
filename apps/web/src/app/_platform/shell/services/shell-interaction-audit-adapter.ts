/**
 * SHELL INTERACTION AUDIT ADAPTER
 *
 * Fire-and-forget POST to the audit API. Does not block UX on failure.
 */

import { resolveApiV1Path } from "../../runtime/utils/api-client-utils"

import type { ShellInteractionAuditEnvelope } from "../contract/shell-interaction-audit-contract"
import {
  mapShellInteractionAuditPayload,
  type ShellInteractionAuditRequestBody,
} from "./map-shell-interaction-audit-payload"

export interface EmitShellInteractionAuditOptions {
  /** Forward correlation headers; tenant should match envelope when possible. */
  headers?: {
    tenantId?: string
    requestId?: string
    traceId?: string
    correlationId?: string
  }
  signal?: AbortSignal
}

function resolveShellInteractionAuditUrl(): string {
  return resolveApiV1Path("/audit/shell-interaction")
}

function buildRequestHeaders(
  body: ShellInteractionAuditRequestBody,
  options?: EmitShellInteractionAuditOptions
): HeadersInit {
  const headers = new Headers()
  headers.set("Content-Type", "application/json")
  headers.set("Accept", "application/json")

  const tenant = options?.headers?.tenantId ?? body.tenantId
  if (typeof tenant === "string" && tenant.length > 0) {
    headers.set("X-Tenant-Id", tenant)
  }

  const rid = options?.headers?.requestId
  if (rid) {
    headers.set("X-Request-Id", rid)
  }
  const tid = options?.headers?.traceId
  if (tid) {
    headers.set("X-Trace-Id", tid)
  }
  const cid = options?.headers?.correlationId
  if (cid) {
    headers.set("X-Correlation-Id", cid)
  }

  return headers
}

/**
 * POST interaction envelope to the governed audit API. Swallows errors; logs in dev.
 */
export async function emitShellInteractionAudit(
  envelope: ShellInteractionAuditEnvelope,
  options?: EmitShellInteractionAuditOptions
): Promise<void> {
  const body = mapShellInteractionAuditPayload(envelope)
  const tenant =
    options?.headers?.tenantId ?? body.tenantId ?? envelope.tenantId
  if (tenant === undefined || tenant === "") {
    if (import.meta.env.DEV) {
      console.warn(
        "[shell-interaction-audit] skipped: missing tenantId on envelope and headers"
      )
    }
    return
  }

  const url = resolveShellInteractionAuditUrl()
  const headers = buildRequestHeaders(body, options)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: options?.signal,
      credentials: "same-origin",
    })

    if (!res.ok && import.meta.env.DEV) {
      const text = await res.text().catch(() => "")
      console.warn(
        `[shell-interaction-audit] ${res.status} ${res.statusText}`,
        text.slice(0, 200)
      )
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[shell-interaction-audit] fetch failed", e)
    }
  }
}
