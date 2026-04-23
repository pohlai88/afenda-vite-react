# 7W1H audit (`@afenda/database/7w1h-audit`)

Governed **append-only** audit events for **`governance.audit_logs`**: typed columns for core dimensions (Who / What / When / outcome / channel) plus optional **`seven_w1h`** JSON for extended narrative (where, why, which feature, whom, how, phase). Server-only; use from API/workers with a `DatabaseClient`.

This folder is the **platform/activity audit** surface. It is not the business truth spine. Business-domain command outcomes live in **`governance.truth_records`** under [`../schema/governance/truth-records.schema.ts`](../schema/governance/truth-records.schema.ts).

**Imports:** `@afenda/database`, `@afenda/database/7w1h-audit`, or `@afenda/database/audit` (alias). Prefer package exports; do not deep-import `src/` from apps.

Charter and tree rules: [`001-postgreSQL-DDL.md`](../../docs/guideline/001-postgreSQL-DDL.md), [`008-db-tree.md`](../../docs/guideline/008-db-tree.md).

---

## Why this folder exists

Audit DDL and logic live under **`src/7w1h-audit/`** so the **7W1H** story stays in one place. Drizzle Kit still sees the table because **`src/schema/governance/index.ts`** re-exports `audit-enums.schema`, `audit-logs.schema`, and `seven-w1h-audit-boundary.schema` from here. Other governance-only tables (e.g. `data-sources`) remain under `src/schema/governance/`.

---

## Layout

| Path                                          | Role                                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `audit-enums.schema.ts`                       | Postgres enums used by `audit_logs`                                                             |
| `audit-logs.schema.ts`                        | `governance.audit_logs` Drizzle table — **no** `updated_at`, **no** soft delete                 |
| `seven-w1h-audit-boundary.schema.ts`          | Zod v4 shapes for inserts and `seven_w1h` JSON                                                  |
| `contracts/audit-action-catalog.ts`           | Allowed **`action`** keys for **governed** writers (`buildAuditLog` / `insertGovernedAuditLog`) |
| `contracts/audit-query-contract.ts`           | Zod input for **`queryAuditLogs`** (tenant + filters + `seven_w1h` text paths)                  |
| `contracts/audit-seven-w1h-query-manifest.ts` | Which JSON paths are queryable + phase filter key                                               |
| `services/build-audit-log.ts`                 | Build `NewAuditLog` with catalog **`action`** + defaults                                        |
| `services/validate-audit-log.ts`              | Validate row shape before insert                                                                |
| `services/insert-audit-log.ts`                | **`insertAuditLog`**, **`insertGovernedAuditLog`**                                              |
| `services/audit-query-service.ts`             | **`queryAuditLogs`** — list with optional `seven_w1h` `#>>` filters                             |
| `index.ts`                                    | Barrel (also re-exported from `@afenda/database` where applicable)                              |
| `__tests__/`                                  | Vitest for boundary schemas and query contract                                                  |

---

## Write path

1. Prefer **`insertGovernedAuditLog`**, which uses **`buildAuditLog`** → **`validateAuditLog`** → insert. **`action`** must be an **`AuditActionKey`** from the catalog.
2. Use **`insertAuditLog`** when you must pass a row that already satisfies validation (e.g. migrations or tightly controlled call sites). Do not bypass **`tenant_id`** or append-only rules.
3. Put stable dimensions in **top-level columns**; use **`seven_w1h`** and **`metadata`** for richer context without exploding the table for every product idea.

---

## Read path

- **`queryAuditLogs(db, input)`** — parse input with **`auditQueryInputSchema`** / **`parseAuditQueryInput`**; filters include tenant, subject, actor, action, outcome, correlation fields, time range, and optional **`seven_w1h`** path filters defined in the query manifest.

---

## Invariants (do not break)

- **Append-only:** no updates/deletes on `audit_logs` for normal product flows.
- **Tenant scope:** rows are tenant-scoped; list queries must always constrain **`tenant_id`** (the query service does this).
- **Boundary:** do not repurpose `audit_logs` as the business truth record. Business mutation evidence belongs in `truth_records`; 7W1H audit captures platform/user/request context.
- **Schema changes:** run **`pnpm run db:guard`** (or **`db:ci`**) in `packages/_database` after DDL or contract changes.

---

## Optional follow-ons

- Extend **`auditActionKeys`** when adding new first-class actions; keep keys namespaced and stable.
- If **`seven_w1h`** query needs grow, extend **`audit-seven-w1h-query-manifest.ts`** and the query service together so SQL path literals stay centralized.
