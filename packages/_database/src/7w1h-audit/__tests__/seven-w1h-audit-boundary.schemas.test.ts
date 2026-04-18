/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; 7W1H audit modules under `src/7w1h-audit/` (re-exported via `schema/governance` for Drizzle Kit). Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (@afenda/database, @afenda/database/7w1h-audit, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `7w1h-audit/__tests__/seven-w1h-audit-boundary.schemas.test.ts` — Vitest for `governanceAuditLogInsertSchema`.
 */
import { describe, expect, it } from "vitest"

import {
  auditSevenW1HSchema,
  governanceAuditLogInsertSchema,
} from "../seven-w1h-audit-boundary.schema"

describe("seven-w1h-audit-boundary.schemas", () => {
  it("accepts a minimal audit log insert", () => {
    const row = {
      tenantId: "018f1234-5678-7abc-8def-123456789abc",
      action: "mdm.party.view",
      subjectType: "party",
      subjectId: "028f1234-5678-7abc-8def-123456789abc",
      actorType: "person" as const,
      sourceChannel: "api" as const,
    }
    expect(governanceAuditLogInsertSchema.safeParse(row).success).toBe(true)
  })

  it("auditSevenW1HSchema rejects unknown keys (strict)", () => {
    const bad = { extraDimension: true }
    expect(auditSevenW1HSchema.safeParse(bad).success).toBe(false)
  })

  it("accepts optional sevenW1h payload", () => {
    const row = {
      tenantId: "018f1234-5678-7abc-8def-123456789abc",
      action: "shell.interaction.recorded",
      subjectType: "shell_interaction",
      subjectId: "cmd-1",
      sevenW1h: {
        where: { pathname: "/app/settings" },
        how: {
          mechanism: "shell.command",
          interactionPhase: "succeeded" as const,
        },
      },
    }
    expect(governanceAuditLogInsertSchema.safeParse(row).success).toBe(true)
  })
})
