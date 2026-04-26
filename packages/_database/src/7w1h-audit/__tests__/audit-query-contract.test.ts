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
 * This module: `7w1h-audit/__tests__/audit-query-contract.test.ts` — Vitest for `auditQueryInputSchema`.
 */
import { describe, expect, it } from "vitest"

import {
  auditQueryInputSchema,
  parseAuditQueryInput,
} from "../contracts/audit-query-contract"

describe("auditQueryInputSchema", () => {
  it("parses tenant + optional w1h filters", () => {
    const tenantId = "018f1234-5678-7abc-8def-123456789abc"
    const parsed = parseAuditQueryInput({
      tenantId,
      w1hHowMechanism: "shell.command",
      w1hWherePathname: "/settings",
      w1hHowInteractionPhase: "succeeded",
    })
    expect(parsed.tenantId).toBe(tenantId)
    expect(parsed.w1hHowMechanism).toBe("shell.command")
    expect(parsed.w1hWherePathname).toBe("/settings")
    expect(parsed.w1hHowInteractionPhase).toBe("succeeded")
    expect(parsed.offset).toBe(0)
    expect(parsed.limit).toBe(100)
  })

  it("rejects unknown keys", () => {
    expect(() =>
      auditQueryInputSchema.parse({
        tenantId: "018f1234-5678-7abc-8def-123456789abc",
        extra: true,
      })
    ).toThrow()
  })
})
