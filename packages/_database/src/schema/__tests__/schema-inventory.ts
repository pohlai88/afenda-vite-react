/**
 * Canonical inventory for `src/schema` — architecture and required `@afenda/database/schema` barrel exports.
 * Update when domains or critical re-exports change.
 *
 * ## `schema/index.ts` (main barrel)
 *
 * Star-re-exports: **finance**, **governance** (includes `src/7w1h-audit`), **iam**, **mdm**, **ref**, **shared**, **views**.
 *
 * ## Separate entrypoints (not re-exported from `schema/index.ts`)
 *
 * - `src/schema/identity/index.ts` — IAM table convenience + Better Auth link service
 * - `src/schema/pkg-governance/index.ts` — migrations / identifier / module convention (tests under `pkg-governance`)
 * - `src/schema/tenancy/index.ts` — tenant context services + Zod (tests under `tenancy`)
 * - `src/schema/constants/runtime.ts` — pool env keys (tests under `constants`)
 *
 * ## Features (F1–F8)
 *
 * - **F1** PostgreSQL schema handles (`finance` … `ref`)
 * - **F2** Cross-domain shared primitives (`idColumn`, `statusEnum`, …)
 * - **F3** Governance + 7W1H audit DDL on the merged graph
 * - **F4** IAM + MDM operational tables
 * - **F5** Reference data (`ref.*`)
 * - **F6** Canonical read-model views (`mdm.v_*` via `src/views`)
 * - **F7** Domain Zod boundaries (`*-boundary.schema.ts`) — covered in per-domain boundary tests
 * - **F8** Package governance / tenancy / identity barrels — dedicated tests
 */
export const SCHEMA_BARREL_DOMAIN_COUNT = 7

/** Must exist on `import * as S from "../index"` — anchors every layer of the merged Drizzle graph. */
export const REQUIRED_SCHEMA_BARREL_EXPORTS = [
  "finance",
  "governance",
  "iam",
  "mdm",
  "ref",
  "accounts",
  "auditLogs",
  "auditActorTypeEnum",
  "dataSources",
  "tenants",
  "userAccounts",
  "countries",
  "parties",
  "items",
  "vCurrentTenantPolicies",
  "vGoldenItems",
  "vGoldenParties",
  "idColumn",
  "statusEnum",
] as const

export const EXPECTED_REQUIRED_SCHEMA_BARREL_EXPORT_COUNT =
  REQUIRED_SCHEMA_BARREL_EXPORTS.length
