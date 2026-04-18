/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * MDM **Zod boundary** (not Drizzle DDL): insert DTOs aligned with common `mdm.*` shapes; `.schema.ts` satisfies `scripts/guard-schema-modules.ts`. Keep in sync when sibling DDL changes. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/mdm/mdm-boundary.schema.ts` — Zod v4 payloads for shared MDM insert shapes; validate at API boundaries.
 */

import { z } from "zod"

const uuid = (message = "Invalid id") => z.uuid({ error: message })

export const mdmOwnershipLevelSchema = z.enum([
  "tenant",
  "legal_entity",
  "business_unit",
  "location",
])

export const mdmGenericStatusSchema = z.enum([
  "draft",
  "active",
  "inactive",
  "blocked",
  "suspended",
  "archived",
])

export const mdmMdmStatusSchema = z.enum([
  "golden",
  "candidate",
  "duplicate",
  "merged",
])

/** Insert-style payload for `mdm.legal_entities` (omit DB defaults where optional). */
export const mdmLegalEntityInsertSchema = z.object({
  tenantId: uuid(),
  entityCode: z.string().trim().min(1).max(50),
  legalName: z.string().trim().min(1).max(255),
  tradingName: z.string().trim().min(1).max(255).optional().nullable(),
  entityType: z.enum(["company", "subsidiary", "branch", "foundation", "partnership"]),
  registrationNumber: z.string().max(100).optional().nullable(),
  taxRegistrationNumber: z.string().max(100).optional().nullable(),
  countryCode: z.string().length(2),
  baseCurrencyCode: z.string().length(3),
  fiscalCalendarId: uuid().optional().nullable(),
  status: mdmGenericStatusSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/** Insert-style payload for `mdm.parties` (scope columns optional at boundary; CHECK enforces shape). */
export const mdmPartyInsertSchema = z.object({
  tenantId: uuid(),
  partyCode: z.string().trim().min(1).max(50),
  partyType: z.enum(["person", "organization"]),
  displayName: z.string().trim().min(1).max(255),
  canonicalName: z.string().trim().min(1).max(255),
  ownershipLevel: mdmOwnershipLevelSchema.optional(),
  legalEntityId: uuid().optional().nullable(),
  businessUnitId: uuid().optional().nullable(),
  locationId: uuid().optional().nullable(),
  status: mdmGenericStatusSchema,
  mdmStatus: mdmMdmStatusSchema,
  sourceSystemId: uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/** Insert-style payload for `mdm.items`. */
export const mdmItemInsertSchema = z.object({
  tenantId: uuid(),
  itemCode: z.string().trim().min(1).max(50),
  itemName: z.string().trim().min(1).max(255),
  itemType: z.enum(["inventory", "service", "asset", "expense"]),
  baseUomCode: z.string().trim().min(1).max(20),
  categoryId: uuid().optional().nullable(),
  ownershipLevel: mdmOwnershipLevelSchema.optional(),
  legalEntityId: uuid().optional().nullable(),
  businessUnitId: uuid().optional().nullable(),
  locationId: uuid().optional().nullable(),
  status: mdmGenericStatusSchema,
  mdmStatus: mdmMdmStatusSchema.optional(),
  sourceSystemId: uuid().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})
