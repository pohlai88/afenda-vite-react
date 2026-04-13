/**
 * DEFAULT AUDIT DOCTRINE REGISTRY
 *
 * Platform-wide baseline doctrine and invariant references for governed audit behavior.
 * Scope: defines the minimum audit, identity, scope, and administrative rules that
 * all governed runtime actions must respect.
 * Intent: provide a verbose, explicit, and verdict-oriented baseline that is stronger
 * than conventional ERP activity logging and easier to enforce consistently.
 * Constraints: keep this registry platform-default only; do not move feature-specific,
 * truth-engine, or advanced domain invariants into this module.
 * Evolution: this registry may later be replaced by generated sources, but while
 * manual it must remain deterministic, reviewable, and runtime-safe.
 */

export const auditDoctrineCategoryValues = [
  "audit",
  "identity",
  "scope",
  "administration",
] as const

export type AuditDoctrineCategory = (typeof auditDoctrineCategoryValues)[number]

export const auditInvariantSeverityValues = [
  "low",
  "medium",
  "high",
  "critical",
] as const

export type AuditInvariantSeverity =
  (typeof auditInvariantSeverityValues)[number]

export interface AuditDoctrineDefinition<TKey extends string = string> {
  key: TKey
  category: AuditDoctrineCategory
  description: string
}

export interface AuditInvariantDefinition<
  TKey extends string = string,
  TDoctrineRef extends string = string,
> {
  key: TKey
  doctrineRef: TDoctrineRef
  description: string
  severity: AuditInvariantSeverity
}

export const auditDoctrineRegistry = {
  "doctrine.audit.append-only": {
    key: "doctrine.audit.append-only",
    category: "audit",
    description:
      "Audit evidence is append-only. Existing audit records must not be corrected through in-place overwrite; correction must occur through additive, traceable follow-up evidence so that prior recorded state remains inspectable.",
  },
  "doctrine.identity.attributable-action": {
    key: "doctrine.identity.attributable-action",
    category: "identity",
    description:
      "Governed actions must remain attributable to a resolvable actor identity so that the system can explain who initiated, approved, executed, or caused the action under review.",
  },
  "doctrine.identity.delegation-transparent": {
    key: "doctrine.identity.delegation-transparent",
    category: "identity",
    description:
      "Delegated, acting-as, or impersonated execution must remain visible in audit evidence. The system must distinguish the direct actor from the represented or delegated identity where applicable.",
  },
  "doctrine.scope.operation-bounded": {
    key: "doctrine.scope.operation-bounded",
    category: "scope",
    description:
      "Governed actions must preserve required operational scope such as tenant and legal-entity context so that audit evidence remains reviewable within the correct business boundary.",
  },
  "doctrine.administration.privileged-actions-auditable": {
    key: "doctrine.administration.privileged-actions-auditable",
    category: "administration",
    description:
      "Privileged and administrative operations must produce explicit, reviewable audit evidence and must not be allowed to operate with weaker audit discipline than ordinary user actions.",
  },
} as const satisfies Record<string, AuditDoctrineDefinition>

export type AuditDoctrineKey = keyof typeof auditDoctrineRegistry

export const auditInvariantRegistry = {
  "invariant.audit.no-in-place-correction": {
    key: "invariant.audit.no-in-place-correction",
    doctrineRef: "doctrine.audit.append-only",
    description:
      "A governed audit record must not be corrected by in-place mutation, because overwriting prior evidence destroys the ability to inspect what the system recorded before remediation.",
    severity: "critical",
  },
  "invariant.identity.actor-required-for-user-action": {
    key: "invariant.identity.actor-required-for-user-action",
    doctrineRef: "doctrine.identity.attributable-action",
    description:
      "A user-initiated governed action must not be accepted without a resolvable actor identity, because unattributable actions undermine accountability, reviewability, and dispute analysis.",
    severity: "high",
  },
  "invariant.identity.delegation-must-be-explicit": {
    key: "invariant.identity.delegation-must-be-explicit",
    doctrineRef: "doctrine.identity.delegation-transparent",
    description:
      "When an action is performed through delegated, acting-as, or impersonated execution, the audit evidence must explicitly preserve that delegated relationship rather than collapsing it into a single ambiguous actor.",
    severity: "high",
  },
  "invariant.scope.tenant-required-for-governed-write": {
    key: "invariant.scope.tenant-required-for-governed-write",
    doctrineRef: "doctrine.scope.operation-bounded",
    description:
      "A governed write operation must not proceed without tenant scope, because evidence without tenant boundary cannot be reviewed or trusted in a multi-tenant ERP runtime.",
    severity: "critical",
  },
  "invariant.scope.legal-entity-required-when-applicable": {
    key: "invariant.scope.legal-entity-required-when-applicable",
    doctrineRef: "doctrine.scope.operation-bounded",
    description:
      "Where an operation class requires legal-entity context, the action must not proceed without preserving that legal-entity boundary in audit evidence.",
    severity: "critical",
  },
  "invariant.administration.privileged-action-must-be-audited": {
    key: "invariant.administration.privileged-action-must-be-audited",
    doctrineRef: "doctrine.administration.privileged-actions-auditable",
    description:
      "A privileged or administrative action must not bypass governed audit creation, because elevated power increases audit obligation rather than reducing it.",
    severity: "critical",
  },
} as const satisfies Record<
  string,
  AuditInvariantDefinition<string, AuditDoctrineKey>
>

export type AuditInvariantKey = keyof typeof auditInvariantRegistry

export function isAuditDoctrineKey(value: string): value is AuditDoctrineKey {
  return value in auditDoctrineRegistry
}

export function isAuditInvariantKey(value: string): value is AuditInvariantKey {
  return value in auditInvariantRegistry
}

export function getAuditDoctrineDefinition(
  key: AuditDoctrineKey
): (typeof auditDoctrineRegistry)[AuditDoctrineKey] {
  return auditDoctrineRegistry[key]
}

export function getAuditInvariantDefinition(
  key: AuditInvariantKey
): (typeof auditInvariantRegistry)[AuditInvariantKey] {
  return auditInvariantRegistry[key]
}

export function listAuditDoctrineDefinitions(): readonly AuditDoctrineDefinition<AuditDoctrineKey>[] {
  return Object.values(auditDoctrineRegistry)
}

export function listAuditInvariantDefinitions(): readonly AuditInvariantDefinition<
  AuditInvariantKey,
  AuditDoctrineKey
>[] {
  return Object.values(auditInvariantRegistry)
}

function assertNonEmptyTrimmedText(
  label: string,
  value: string,
  ownerKey: string
): void {
  if (!value.trim()) {
    throw new Error(`${label} for "${ownerKey}" must not be empty.`)
  }
}

function assertAuditDoctrineRegistry(): void {
  for (const [recordKey, definition] of Object.entries(auditDoctrineRegistry)) {
    if (recordKey !== definition.key) {
      throw new Error(
        `Audit doctrine registry key mismatch: record key "${recordKey}" does not match definition key "${definition.key}".`
      )
    }

    assertNonEmptyTrimmedText(
      "Audit doctrine description",
      definition.description,
      recordKey
    )
  }
}

function assertAuditInvariantRegistry(): void {
  for (const [recordKey, definition] of Object.entries(
    auditInvariantRegistry
  )) {
    if (recordKey !== definition.key) {
      throw new Error(
        `Audit invariant registry key mismatch: record key "${recordKey}" does not match definition key "${definition.key}".`
      )
    }

    if (!(definition.doctrineRef in auditDoctrineRegistry)) {
      throw new Error(
        `Audit invariant "${recordKey}" references unknown doctrine "${definition.doctrineRef}".`
      )
    }

    assertNonEmptyTrimmedText(
      "Audit invariant description",
      definition.description,
      recordKey
    )
  }
}

assertAuditDoctrineRegistry()
assertAuditInvariantRegistry()
