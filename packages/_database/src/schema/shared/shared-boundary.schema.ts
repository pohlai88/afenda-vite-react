/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * **Shared Zod boundary** (not standalone DDL): `zodFromPgEnum` + primitives aligned with `enums.schema.ts` and `columns.schema.ts`; `.schema.ts` satisfies `scripts/guard-schema-modules.ts`. Migrations N/A for this file.
 * Import via package exports only (`@afenda/database/schema`, …); do not deep-import `src/` from apps.
 * Not for browser bundles: uses Node pg Pool; `DATABASE_URL` and pool env are server-side secrets, never `VITE_*`.
 * Tenancy, audit append-only semantics, and FK patterns follow `docs/guideline/` (001-postgreSQL-DDL.md, 008-db-tree.md).
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Studio snapshots & glossary JSON describe intent; runtime truth is PostgreSQL plus migration history.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `src/schema/shared/shared-boundary.schema.ts` — Zod mirrors for shared `pgEnum`s (`enumValues`); use `z.infer<typeof sharedXxxSchema>` for types.
 */
import { z } from "zod"

/** UUID v4/v7 strings matching `uuid` columns (`idColumn`, FKs). */
export const sharedUuidSchema = z.uuid({ error: "Invalid UUID" })

/** `tenant_id` on tenant-scoped rows (`tenantFkColumn`). */
export const sharedTenantIdSchema = sharedUuidSchema

/** `metadata` jsonb object (`metadataColumn`, `jsonbDefault`). */
export const sharedMetadataRecordSchema = z.record(z.string(), z.unknown())

import {
  accountTypeEnum,
  addressTypeEnum,
  aliasTypeEnum,
  businessUnitTypeEnum,
  customFieldDataTypeEnum,
  dataTypeEnum,
  fiscalCalendarTypeEnum,
  fiscalPeriodStatusEnum,
  governanceLevelEnum,
  itemTypeEnum,
  legalEntityTypeEnum,
  locationTypeEnum,
  masterDomainEnum,
  mdmStatusEnum,
  membershipStatusEnum,
  membershipTypeEnum,
  normalBalanceEnum,
  orgUnitTypeEnum,
  ownershipLevelEnum,
  partyTypeEnum,
  policyEffectEnum,
  postingTypeEnum,
  roleCategoryEnum,
  roleScopeTypeEnum,
  sequenceResetRuleEnum,
  sourceTypeEnum,
  statusEnum,
  taxRegistrationTypeEnum,
  tenantTypeEnum,
  valuationMethodEnum,
} from "./enums.schema"

/** Build a Zod enum from a Drizzle `pgEnum` (same value set as PostgreSQL `ENUM` / column). */
export function zodFromPgEnum(pgEnum: {
  enumName?: string
  enumValues: readonly string[]
}) {
  const vals = pgEnum.enumValues
  if (vals.length === 0) {
    throw new Error(
      `zodFromPgEnum: empty enum${pgEnum.enumName ? ` (${pgEnum.enumName})` : ""}`
    )
  }
  return z.enum(vals as [string, ...string[]])
}

/** `generic_status` */
export const sharedGenericStatusSchema = zodFromPgEnum(statusEnum)

export const sharedTenantTypeSchema = zodFromPgEnum(tenantTypeEnum)

/** `mdm_governance_level` */
export const sharedGovernanceLevelSchema = zodFromPgEnum(governanceLevelEnum)

export const sharedOwnershipLevelSchema = zodFromPgEnum(ownershipLevelEnum)

export const sharedPartyTypeSchema = zodFromPgEnum(partyTypeEnum)

export const sharedMdmStatusSchema = zodFromPgEnum(mdmStatusEnum)

export const sharedLegalEntityTypeSchema = zodFromPgEnum(legalEntityTypeEnum)

export const sharedTaxRegistrationTypeSchema = zodFromPgEnum(
  taxRegistrationTypeEnum
)

export const sharedBusinessUnitTypeSchema = zodFromPgEnum(businessUnitTypeEnum)

export const sharedLocationTypeSchema = zodFromPgEnum(locationTypeEnum)

export const sharedAddressTypeSchema = zodFromPgEnum(addressTypeEnum)

export const sharedOrgUnitTypeSchema = zodFromPgEnum(orgUnitTypeEnum)

export const sharedMembershipStatusSchema = zodFromPgEnum(membershipStatusEnum)

export const sharedMembershipTypeSchema = zodFromPgEnum(membershipTypeEnum)

export const sharedRoleCategorySchema = zodFromPgEnum(roleCategoryEnum)

export const sharedRoleScopeTypeSchema = zodFromPgEnum(roleScopeTypeEnum)

export const sharedPolicyEffectSchema = zodFromPgEnum(policyEffectEnum)

export const sharedFiscalCalendarTypeSchema = zodFromPgEnum(
  fiscalCalendarTypeEnum
)

export const sharedFiscalPeriodStatusSchema = zodFromPgEnum(
  fiscalPeriodStatusEnum
)

export const sharedSequenceResetRuleSchema = zodFromPgEnum(
  sequenceResetRuleEnum
)

export const sharedAccountTypeSchema = zodFromPgEnum(accountTypeEnum)

export const sharedPostingTypeSchema = zodFromPgEnum(postingTypeEnum)

export const sharedNormalBalanceSchema = zodFromPgEnum(normalBalanceEnum)

export const sharedItemTypeSchema = zodFromPgEnum(itemTypeEnum)

export const sharedValuationMethodSchema = zodFromPgEnum(valuationMethodEnum)

export const sharedAliasTypeSchema = zodFromPgEnum(aliasTypeEnum)

export const sharedMasterDomainSchema = zodFromPgEnum(masterDomainEnum)

export const sharedSourceTypeSchema = zodFromPgEnum(sourceTypeEnum)

/** `custom_data_type` (MDM / generic typing) */
export const sharedDataTypeSchema = zodFromPgEnum(dataTypeEnum)

export const sharedCustomFieldDataTypeSchema = zodFromPgEnum(
  customFieldDataTypeEnum
)

/** Example inferred types — same pattern applies to every `shared*Schema` export. */
export type SharedGenericStatus = z.infer<typeof sharedGenericStatusSchema>
export type SharedTenantType = z.infer<typeof sharedTenantTypeSchema>
export type SharedAccountType = z.infer<typeof sharedAccountTypeSchema>
