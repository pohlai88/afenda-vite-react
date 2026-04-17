/**
 * Audit module — append-only evidence, catalogs, read models, retention, and queries.
 *
 * Layers:
 * - **contracts** — action/doctrine/invariant/resolution catalogs, payloads, queries, retention
 * - **schema** — Drizzle tables and enums
 * - **services** — build/validate/insert rows, queries, investigation, retention, baseline asserts
 * - **utils** — `AuditError` / `AuditValidationError`, JSON serialization, audit context builders
 *
 * Normative doctrine: repo-root `docs/AUDIT_ARCHITECTURE.md`.
 */

export * from "./contracts"
export * from "./read-model"
export * from "./relations/audit-relations"
export * from "./schema/audit-enums.schema"
export * from "./schema/audit-logs.schema"

export * from "./services/assert-audit-invariants"
export * from "./services/audit-invariant-error-map"
export * from "./services/audit-investigation-service"
export * from "./services/audit-investigation-summary-service"
export * from "./services/audit-query-service"
export * from "./services/audit-read-model-service"
export * from "./services/audit-retention-query-service"
export * from "./services/audit-retention-service"
export * from "./services/build-audit-log"
export * from "./services/insert-audit-log"
export * from "./services/validate-audit-log"

export * from "./utils/audit-error-factory"
export * from "./utils/audit-errors"
export * from "./utils/audit-json"
export * from "./utils/build-audit-context"
export * from "./utils/create-audit-invariant-violation-from-spec-code"
export * from "./utils/serialize-audit-log"
