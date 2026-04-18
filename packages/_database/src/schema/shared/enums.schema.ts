/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; **shared** — cross-domain `pgEnum` catalog for domain tables; must match migration `CREATE TYPE`. Migrations emit to `packages/_database/drizzle/` (gitignored).
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/shared/enums.schema.ts` — shared `pgEnum` catalog (001); wire columns only after matching `CREATE TYPE` in migrations.
 * Zod: `shared-boundary.schema.ts` derives validators from `enumValues` (stay aligned with DDL).
 */
import { pgEnum } from "drizzle-orm/pg-core"

export const statusEnum = pgEnum("generic_status", [
  "draft",
  "active",
  "inactive",
  "blocked",
  "suspended",
  "archived",
])

export const tenantTypeEnum = pgEnum("tenant_type", [
  "enterprise",
  "group",
  "franchise",
  "nonprofit",
  "holding",
])

export const governanceLevelEnum = pgEnum("mdm_governance_level", [
  "centralized",
  "federated",
  "decentralized",
])

export const ownershipLevelEnum = pgEnum("ownership_level", [
  "tenant",
  "legal_entity",
  "business_unit",
  "location",
])

export const partyTypeEnum = pgEnum("party_type", ["person", "organization"])

export const mdmStatusEnum = pgEnum("mdm_status", [
  "golden",
  "candidate",
  "duplicate",
  "merged",
])

export const legalEntityTypeEnum = pgEnum("legal_entity_type", [
  "company",
  "subsidiary",
  "branch",
  "foundation",
  "partnership",
])

export const taxRegistrationTypeEnum = pgEnum("tax_registration_type", [
  "gst",
  "vat",
  "sst",
  "sales_tax",
  "withholding_tax",
  "corporate_tax",
  "service_tax",
  "other",
])

export const businessUnitTypeEnum = pgEnum("business_unit_type", [
  "division",
  "segment",
  "line_of_business",
  "function",
])

export const locationTypeEnum = pgEnum("location_type", [
  "branch",
  "office",
  "warehouse",
  "store",
  "plant",
  "site",
])

export const addressTypeEnum = pgEnum("address_type", [
  "registered",
  "billing",
  "shipping",
  "warehouse",
  "branch",
  "office",
  "primary",
  "other",
])

export const orgUnitTypeEnum = pgEnum("org_unit_type", [
  "department",
  "cost_center",
  "profit_center",
  "team",
  "region",
  "function",
  "project_unit",
])

export const membershipStatusEnum = pgEnum("membership_status", [
  "invited",
  "active",
  "suspended",
  "revoked",
])

export const membershipTypeEnum = pgEnum("membership_type", [
  "employee",
  "partner",
  "auditor",
  "consultant",
  "system",
])

export const roleCategoryEnum = pgEnum("role_category", [
  "finance",
  "procurement",
  "sales",
  "inventory",
  "hr",
  "admin",
  "audit",
  "it",
  "executive",
])

export const roleScopeTypeEnum = pgEnum("role_scope_type", [
  "tenant",
  "legal_entity",
  "business_unit",
  "location",
])

export const policyEffectEnum = pgEnum("policy_effect", ["allow", "deny"])

export const fiscalCalendarTypeEnum = pgEnum("fiscal_calendar_type", [
  "monthly",
  "4-4-5",
  "custom",
])

export const fiscalPeriodStatusEnum = pgEnum("fiscal_period_status", [
  "open",
  "soft_closed",
  "hard_closed",
])

export const sequenceResetRuleEnum = pgEnum("sequence_reset_rule", [
  "never",
  "yearly",
  "monthly",
])

export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
])

export const postingTypeEnum = pgEnum("posting_type", ["posting", "heading"])

export const normalBalanceEnum = pgEnum("normal_balance", ["debit", "credit"])

export const itemTypeEnum = pgEnum("item_type", [
  "inventory",
  "service",
  "asset",
  "expense",
])

export const valuationMethodEnum = pgEnum("valuation_method", [
  "fifo",
  "moving_average",
  "standard",
])

export const aliasTypeEnum = pgEnum("alias_type", [
  "short_name",
  "external_code",
  "legacy_code",
  "search_synonym",
  "barcode",
  "sku",
  "other",
])

export const masterDomainEnum = pgEnum("master_domain", [
  "party",
  "item",
  "legal_entity",
  "business_unit",
  "location",
  "account",
])

export const sourceTypeEnum = pgEnum("source_type", [
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

export const dataTypeEnum = pgEnum("custom_data_type", [
  "boolean",
  "integer",
  "numeric",
  "text",
  "json",
  "enum",
])

export const customFieldDataTypeEnum = pgEnum("custom_field_data_type", [
  "text",
  "number",
  "boolean",
  "date",
  "json",
  "select",
])
