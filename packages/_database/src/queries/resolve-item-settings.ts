/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; read-model resolvers under `src/queries/` (see `queries/README.md`).
 * Import via `@afenda/database` or `@afenda/database/queries`; do not deep-import `src/` from apps.
 * Nullable-scope uniqueness: `sql/hardening/patch_e_nullable_scope_uniqueness.sql` (partial uniques). Fallback order: location → BU → legal entity.
 * Location tier requires **both** `locationId` and `businessUnitId` (location rows are scoped under a BU in this resolver).
 * Not for browser bundles: uses Node pg Pool; DATABASE_URL and pool env are server-side secrets, never VITE_*.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `queries/resolve-item-settings.ts` — `mdm.item_entity_settings` with effective dating on `asOfDate`.
 */
import { and, desc, eq, isNull } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"

import type { DatabaseClient } from "../client"
import { itemEntitySettings } from "../schema/mdm/item-entity-settings.schema"
import { effectiveOnAsOfDatePredicate } from "./query-primitives/effective-date-predicate"
import { assertIsoDateOnly } from "./query-primitives/iso-date-assertions"

export type ItemEntitySettingsRecord = InferSelectModel<
  typeof itemEntitySettings
>

export type ResolveItemSettingsParams = {
  tenantId: string
  itemId: string
  legalEntityId: string
  businessUnitId?: string | null
  locationId?: string | null
  /** Business-effective ISO date `YYYY-MM-DD`; required (callers must be explicit). */
  asOfDate: string
}

export type ResolvedItemSettings = {
  record: ItemEntitySettingsRecord | null
  resolvedScope: "location" | "business_unit" | "legal_entity" | null
}

const orderEffectiveRow = [
  desc(itemEntitySettings.effectiveFrom),
  desc(itemEntitySettings.createdAt),
  desc(itemEntitySettings.id),
] as const

function activeEffectiveRow(asOfDate: string) {
  return and(
    eq(itemEntitySettings.isDeleted, false),
    eq(itemEntitySettings.isActive, true),
    effectiveOnAsOfDatePredicate(
      itemEntitySettings.effectiveFrom,
      itemEntitySettings.effectiveTo,
      asOfDate
    )
  )
}

export async function resolveItemSettings(
  db: DatabaseClient,
  params: ResolveItemSettingsParams
): Promise<ResolvedItemSettings> {
  const {
    tenantId,
    itemId,
    legalEntityId,
    businessUnitId = null,
    locationId = null,
    asOfDate,
  } = params

  assertIsoDateOnly(asOfDate, "asOfDate")

  if (locationId && businessUnitId) {
    const rows = await db
      .select()
      .from(itemEntitySettings)
      .where(
        and(
          eq(itemEntitySettings.tenantId, tenantId),
          eq(itemEntitySettings.itemId, itemId),
          eq(itemEntitySettings.legalEntityId, legalEntityId),
          eq(itemEntitySettings.businessUnitId, businessUnitId),
          eq(itemEntitySettings.locationId, locationId),
          activeEffectiveRow(asOfDate)
        )
      )
      .orderBy(...orderEffectiveRow)
      .limit(1)

    if (rows[0]) {
      return { record: rows[0], resolvedScope: "location" }
    }
  }

  if (businessUnitId) {
    const rows = await db
      .select()
      .from(itemEntitySettings)
      .where(
        and(
          eq(itemEntitySettings.tenantId, tenantId),
          eq(itemEntitySettings.itemId, itemId),
          eq(itemEntitySettings.legalEntityId, legalEntityId),
          eq(itemEntitySettings.businessUnitId, businessUnitId),
          isNull(itemEntitySettings.locationId),
          activeEffectiveRow(asOfDate)
        )
      )
      .orderBy(...orderEffectiveRow)
      .limit(1)

    if (rows[0]) {
      return { record: rows[0], resolvedScope: "business_unit" }
    }
  }

  const rows = await db
    .select()
    .from(itemEntitySettings)
    .where(
      and(
        eq(itemEntitySettings.tenantId, tenantId),
        eq(itemEntitySettings.itemId, itemId),
        eq(itemEntitySettings.legalEntityId, legalEntityId),
        isNull(itemEntitySettings.businessUnitId),
        isNull(itemEntitySettings.locationId),
        activeEffectiveRow(asOfDate)
      )
    )
    .orderBy(...orderEffectiveRow)
    .limit(1)

  if (rows[0]) {
    return { record: rows[0], resolvedScope: "legal_entity" }
  }

  return { record: null, resolvedScope: null }
}
