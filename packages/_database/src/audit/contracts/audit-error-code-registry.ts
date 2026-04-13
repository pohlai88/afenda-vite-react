/**
 * Stable audit error codes → invariant + optional default resolution.
 *
 * **Intended to be codegen-owned:** replace this module’s body with generated output
 * from your invariant/doctrine/resolution source of truth so CI can enforce
 * `specCode ↔ invariantKey ↔ doctrineRef` alignment without hand-editing strings here.
 */

import type { AuditInvariantKey } from "./audit-doctrine-registry"
import type { AuditResolutionKey } from "./audit-resolution-catalog"

export interface AuditErrorCodeSpec {
  invariantKey: AuditInvariantKey
  /** Used when the caller does not pass `resolutionRef` / `resolution` overrides. */
  defaultResolutionRef?: AuditResolutionKey
}

/**
 * One row per governed failure surface. Keys are stable public ids for codegen / APIs.
 */
export const auditErrorCodeRegistry = {
  "INV-AUD-001": {
    invariantKey: "invariant.audit.no-in-place-correction",
    defaultResolutionRef: "resolution.invariant.override-approved",
  },
  "INV-ID-001": {
    invariantKey: "invariant.identity.actor-required-for-user-action",
    defaultResolutionRef: "resolution.none",
  },
  "INV-FX-001": {
    invariantKey: "invariant.scope.legal-entity-required-when-applicable",
    defaultResolutionRef: "resolution.invoice.posting-approved",
  },
} as const satisfies Record<string, AuditErrorCodeSpec>

export type AuditErrorCode = keyof typeof auditErrorCodeRegistry

export function isAuditErrorCode(value: string): value is AuditErrorCode {
  return value in auditErrorCodeRegistry
}

export function getAuditErrorCodeSpec(code: string): AuditErrorCodeSpec {
  if (!isAuditErrorCode(code)) {
    throw new Error(`Unknown audit error code: ${code}`)
  }
  return auditErrorCodeRegistry[code]
}
