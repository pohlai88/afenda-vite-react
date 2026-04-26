/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; 7W1H audit modules under `src/7w1h-audit/` (re-exported via `schema/governance` for Drizzle Kit). Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (@afenda/database, @afenda/database/7w1h-audit, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-25T00:00:00.000Z
 *
 * This module: `7w1h-audit/services/build-audit-change-evidence.ts` — compute masked field-level change evidence from before/after snapshots.
 */
import {
  defaultAuditIgnoredFields,
  defaultAuditSensitiveFields,
  type AuditChangeEvidence,
  type AuditFieldChange,
  type BuildAuditChangeEvidenceInput,
} from "../contracts/audit-change-contract"

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  )
}

function normalizeFieldSet(values: readonly string[]): Set<string> {
  return new Set(values.map((value) => value.toLowerCase()))
}

function getFieldSegments(fieldPath: string): string[] {
  return fieldPath
    .split(".")
    .map((segment) => segment.trim().toLowerCase())
    .filter((segment) => segment.length > 0)
}

function isIgnoredField(
  fieldPath: string,
  ignoredFields: Set<string>
): boolean {
  if (fieldPath === "*") {
    return false
  }

  if (ignoredFields.has(fieldPath.toLowerCase())) {
    return true
  }

  return getFieldSegments(fieldPath).some((segment) =>
    ignoredFields.has(segment)
  )
}

function isSensitiveField(
  fieldPath: string,
  sensitiveFields: Set<string>
): boolean {
  if (fieldPath === "*") {
    return false
  }

  if (sensitiveFields.has(fieldPath.toLowerCase())) {
    return true
  }

  const segments = getFieldSegments(fieldPath)
  const leaf = segments.at(-1)
  return leaf !== undefined && sensitiveFields.has(leaf)
}

function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime()
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((value, index) => deepEqual(value, right[index]))
    )
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left)
    const rightKeys = Object.keys(right)

    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key) => deepEqual(left[key], right[key]))
    )
  }

  return false
}

function maskSensitiveValue(value: unknown, masked: boolean): unknown {
  if (!masked || value === null || value === undefined) {
    return value
  }

  return typeof value === "string" && value.length > 0 ? "***" : value
}

export function maskAuditSnapshot(
  value: unknown,
  sensitiveFields: readonly string[] = defaultAuditSensitiveFields
): unknown {
  const normalizedSensitiveFields = normalizeFieldSet(sensitiveFields)

  function visit(current: unknown, parentPath = ""): unknown {
    if (Array.isArray(current)) {
      return current.map((item, index) =>
        visit(item, `${parentPath}[${index}]`)
      )
    }

    if (!isPlainObject(current)) {
      return current
    }

    const masked: Record<string, unknown> = {}

    for (const [key, child] of Object.entries(current)) {
      const fieldPath = parentPath.length > 0 ? `${parentPath}.${key}` : key
      masked[key] = isSensitiveField(fieldPath, normalizedSensitiveFields)
        ? maskSensitiveValue(child, true)
        : visit(child, fieldPath)
    }

    return masked
  }

  return visit(value)
}

export function computeAuditFieldChanges(
  previousValue: unknown,
  nextValue: unknown,
  options?: Pick<
    BuildAuditChangeEvidenceInput,
    "ignoredFields" | "sensitiveFields"
  >
): AuditFieldChange[] {
  const ignoredFields = normalizeFieldSet(
    options?.ignoredFields ?? defaultAuditIgnoredFields
  )
  const sensitiveFields = normalizeFieldSet(
    options?.sensitiveFields ?? defaultAuditSensitiveFields
  )
  const changes: AuditFieldChange[] = []

  function visit(previous: unknown, next: unknown, fieldPath = ""): void {
    if (deepEqual(previous, next)) {
      return
    }

    const resolvedField = fieldPath.length > 0 ? fieldPath : "*"
    if (isIgnoredField(resolvedField, ignoredFields)) {
      return
    }

    if (isPlainObject(previous) && isPlainObject(next)) {
      const keys = new Set([...Object.keys(previous), ...Object.keys(next)])

      for (const key of keys) {
        const childFieldPath =
          fieldPath.length > 0 ? `${fieldPath}.${key}` : key
        visit(previous[key], next[key], childFieldPath)
      }

      return
    }

    const masked = isSensitiveField(resolvedField, sensitiveFields)

    changes.push({
      field: resolvedField,
      oldValue: maskSensitiveValue(previous, masked),
      newValue: maskSensitiveValue(next, masked),
      masked,
    })
  }

  visit(previousValue, nextValue)
  return changes
}

export function buildAuditChangeEvidence(
  input: BuildAuditChangeEvidenceInput
): AuditChangeEvidence {
  const includeSnapshots = input.includeSnapshots ?? true
  const sensitiveFields = input.sensitiveFields ?? defaultAuditSensitiveFields
  const changes = computeAuditFieldChanges(
    input.previousValue,
    input.nextValue,
    {
      ignoredFields: input.ignoredFields,
      sensitiveFields,
    }
  )

  return {
    changes,
    ...(includeSnapshots
      ? {
          previousValue: maskAuditSnapshot(
            input.previousValue,
            sensitiveFields
          ),
          nextValue: maskAuditSnapshot(input.nextValue, sensitiveFields),
        }
      : {}),
  }
}
