/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; read-model resolvers and pure helpers under `src/queries/` (see `queries/README.md`).
 * Import via `@afenda/database` or `@afenda/database/queries`; do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Effective-dating semantics align with canonical views in `src/views/mdm-canonical-views.ts` where applicable.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `queries/helpers/effective-row.ts` — shared `effective_from` / `effective_to` predicates vs calendar `asOfDate` (validate date with `assertIsoDateOnly` first).
 */
import { and, gte, isNull, lte, or, type SQL } from "drizzle-orm"
import type { PgColumn } from "drizzle-orm/pg-core"

/** Row is active on `asOfDate` when `effective_from <= asOfDate` and (`effective_to` is null or `effective_to >= asOfDate`). */
export function effectiveOnAsOfDatePredicate(
  effectiveFrom: PgColumn,
  effectiveTo: PgColumn,
  asOfDate: string
): SQL {
  return and(
    lte(effectiveFrom, asOfDate),
    or(isNull(effectiveTo), gte(effectiveTo, asOfDate))
  )!
}
