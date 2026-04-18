/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Ref **Zod boundary** (not Drizzle DDL): validators for `ref.countries`, `ref.currencies`, `ref.locales`, `ref.timezones`, `ref.uoms`; `.schema.ts` satisfies `scripts/guard-schema-modules.ts`. Keep in sync when sibling DDL changes. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/ref/ref-boundary.schema.ts` — Zod v4 code schemas and insert DTOs for reference seeding.
 */
import { z } from "zod"

/** ISO 3166-1 alpha-2 (uppercase), matching `ref.countries.code`. */
export const refCountryCodeSchema = z
  .string()
  .length(2)
  .regex(/^[A-Z]{2}$/u, { error: "Expected uppercase ISO 3166-1 alpha-2" })

/** ISO 4217 alphabetic code (uppercase), matching `ref.currencies.code`. */
export const refCurrencyCodeSchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/u, { error: "Expected uppercase ISO 4217 currency code" })

/** BCP 47 language tag, matching `ref.locales.code` (varchar 20). */
export const refLocaleCodeSchema = z.string().trim().min(2).max(20)

/** IANA timezone name, matching `ref.timezones.name`. */
export const refTimezoneNameSchema = z.string().trim().min(1).max(100)

/** Unit-of-measure code, matching `ref.uoms.code`. */
export const refUomCodeSchema = z.string().trim().min(1).max(20)

/** Insert-style row for seeding `ref.countries`. */
export const refCountryInsertSchema = z.object({
  code: refCountryCodeSchema,
})

/** Insert-style row for seeding `ref.currencies`. */
export const refCurrencyInsertSchema = z.object({
  code: refCurrencyCodeSchema,
  numericCode: z
    .string()
    .length(3)
    .regex(/^\d{3}$/u, { error: "Expected three-digit ISO 4217 numeric code" })
    .optional()
    .nullable(),
  name: z.string().trim().min(1).max(100),
  symbol: z.string().trim().max(10).optional().nullable(),
  minorUnit: z.number().int().min(0).max(6).optional(),
  isActive: z.boolean().optional(),
})

/** Insert-style row for seeding `ref.locales`. */
export const refLocaleInsertSchema = z.object({
  code: refLocaleCodeSchema,
  name: z.string().trim().min(1).max(100),
  isActive: z.boolean().optional(),
})

/** Insert-style row for seeding `ref.timezones`. */
export const refTimezoneInsertSchema = z.object({
  name: refTimezoneNameSchema,
  isActive: z.boolean().optional(),
})

/** Insert-style row for seeding `ref.uoms`. */
export const refUomInsertSchema = z.object({
  code: refUomCodeSchema,
})
