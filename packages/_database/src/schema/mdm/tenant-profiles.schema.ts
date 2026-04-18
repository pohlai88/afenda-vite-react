/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **mdm** schema (`pgSchema("mdm")`) — tenant master data, parties, items, org graph, policies, sequences. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/mdm/tenant-profiles.schema.ts` — 1:1 branding / contact surface keyed by `tenant_id` (FK to `mdm.tenants`).
 */

import { index, uuid, varchar } from "drizzle-orm/pg-core"

import {
  createdUpdatedVersionActorColumns,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns.schema"
import { mdm } from "./_schema"
import { tenants } from "./tenants.schema"

export const tenantProfiles = mdm.table(
  "tenant_profiles",
  {
    tenantId: uuid("tenant_id")
      .primaryKey()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    displayName: varchar("display_name", { length: 200 }),
    legalDisplayName: varchar("legal_display_name", { length: 255 }),
    industryCode: varchar("industry_code", { length: 50 }),
    websiteUrl: varchar("website_url", { length: 255 }),
    logoUrl: varchar("logo_url", { length: 255 }),
    supportEmail: varchar("support_email", { length: 320 }),
    supportPhone: varchar("support_phone", { length: 50 }),
    defaultInvoiceEmail: varchar("default_invoice_email", { length: 320 }),
    registrationLabel: varchar("registration_label", { length: 100 }),
    taxRegistrationLabel: varchar("tax_registration_label", { length: 100 }),
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    idxDisplayName: index("idx_tenant_profiles_display_name").on(
      table.displayName
    ),
  })
)

export type TenantProfile = typeof tenantProfiles.$inferSelect
export type NewTenantProfile = typeof tenantProfiles.$inferInsert
