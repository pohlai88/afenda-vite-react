/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Governance **Zod boundary** (not Drizzle DDL): insert DTOs for `governance.data_sources`; `.schema.ts` satisfies `scripts/guard-schema-modules.ts`. 7W1H audit Zod lives in `src/7w1h-audit/seven-w1h-audit-boundary.schema.ts`. Keep in sync when sibling DDL changes. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/governance/governance-boundary.schema.ts` — Zod v4 `sourceType` + data-source insert schema; validate at API boundaries.
 */
import { z } from "zod"

export const governanceSourceTypeSchema = z.enum([
  "manual",
  "api",
  "import",
  "legacy_erp",
  "crm",
  "ecommerce",
  "bank",
  "tax",
  "other",
])

export const governanceDataSourceInsertSchema = z.object({
  sourceCode: z.string().trim().min(1).max(50),
  sourceName: z.string().trim().min(1).max(200),
  sourceType: governanceSourceTypeSchema,
  priorityRank: z.number().int().positive().optional(),
  isAuthoritative: z.boolean().optional(),
  status: z
    .enum([
      "draft",
      "active",
      "inactive",
      "blocked",
      "suspended",
      "archived",
    ])
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type GovernanceDataSourceInsert = z.infer<
  typeof governanceDataSourceInsertSchema
>
