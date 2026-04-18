/**
 * Canonical inventory for `src/7w1h-audit` — keep in sync with `index.ts` and tests.
 *
 * ## Runtime functions (8)
 * Exported from `7w1h-audit/index.ts` as callable functions (not Zod/Drizzle builders).
 */
export const AUDIT_RUNTIME_FUNCTION_NAMES = [
  "isAuditActionKey",
  "parseAuditQueryInput",
  "auditSevenW1hPgPathLiteral",
  "validateAuditLog",
  "buildAuditLog",
  "insertAuditLog",
  "insertGovernedAuditLog",
  "queryAuditLogs",
] as const

export type AuditRuntimeFunctionName =
  (typeof AUDIT_RUNTIME_FUNCTION_NAMES)[number]

export const EXPECTED_RUNTIME_FUNCTION_COUNT =
  AUDIT_RUNTIME_FUNCTION_NAMES.length

/**
 * ## Product features (9) — behaviors covered by tests
 *
 * | Id | Feature |
 * | -- | ------- |
 * | F1 | Governed **action catalog** (`auditActionKeys`, `isAuditActionKey`) |
 * | F2 | **Query input** Zod (`auditQueryInputSchema`, `parseAuditQueryInput`, `.strict()`) |
 * | F3 | **7W1H query manifest** (`AUDIT_QUERY_W1H_TEXT_FILTERS`, `AUDIT_QUERY_W1H_PHASE_FILTER`, `auditSevenW1hPgPathLiteral`) |
 * | F4 | **validateAuditLog** — tenant, subjectType, catalog action, UI vs actorType |
 * | F5 | **buildAuditLog** — defaults for metadata, sevenW1h, timestamps |
 * | F6 | **insertAuditLog** / **insertGovernedAuditLog** — validate + Drizzle insert |
 * | F7 | **queryAuditLogs** — filtered select + order + limit |
 * | F8 | **Zod boundary** — `governanceAuditLogInsertSchema`, `auditSevenW1HSchema` (governance narrative) |
 * | F9 | **Drizzle DDL** — `auditLogs` table + `audit-*` pgEnums (shape present; migrations apply SQL) |
 */
export const AUDIT_FEATURE_COUNT = 9
