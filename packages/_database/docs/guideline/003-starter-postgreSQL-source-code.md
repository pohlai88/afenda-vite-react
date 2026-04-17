Below is the **drop-in spine pack** for the most critical files.

I am keeping it **production-oriented**, not toy-level:

- modular
- tenant-safe
- Drizzle-native where appropriate
- raw PostgreSQL where Drizzle should not pretend to own everything

---

# 1. `shared/enums.ts`

```ts
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

export const accountTypeEnum = pgEnum("account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
])

export const postingTypeEnum = pgEnum("posting_type", ["posting", "heading"])

export const normalBalanceEnum = pgEnum("normal_balance", ["debit", "credit"])

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

export const masterDomainEnum = pgEnum("master_domain", [
  "party",
  "item",
  "legal_entity",
  "business_unit",
  "location",
  "account",
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
```

---

# 2. `shared/columns.ts`

```ts
import { sql } from "drizzle-orm"
import {
  boolean,
  char,
  date,
  integer,
  jsonb,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

/**
 * Canonical reusable column groups.
 *
 * Doctrine:
 * - surrogate PK + scoped business key
 * - audit columns on all mutable tenant-owned tables
 * - JSONB is controlled extensibility, not relational laziness
 * - soft delete is retained for audit-safe ERP semantics
 */

export const idColumn = {
  id: uuid("id").primaryKey().defaultRandom(),
}

export const tenantIdColumn = {
  tenantId: uuid("tenant_id").notNull(),
}

export const createdUpdatedVersionColumns = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  versionNo: integer("version_no").notNull().default(1),
}

export const createdUpdatedVersionActorColumns = {
  ...createdUpdatedVersionColumns,
  createdBy: uuid("created_by"),
  updatedBy: uuid("updated_by"),
}

export const softDeleteColumn = {
  isDeleted: boolean("is_deleted").notNull().default(false),
}

export const metadataColumn = {
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
}

export const aliasesColumn = {
  aliases: text("aliases")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
}

export const effectiveDateColumns = {
  effectiveFrom: date("effective_from")
    .notNull()
    .default(sql`current_date`),
  effectiveTo: date("effective_to"),
}

export function currencyCodeColumn(name: string) {
  return char(name, { length: 3 })
}

export function countryCodeColumn(name: string) {
  return char(name, { length: 2 })
}

export function codeVarchar(name: string, length = 50) {
  return varchar(name, { length }).notNull()
}

export function nameVarchar(name: string, length = 255) {
  return varchar(name, { length }).notNull()
}
```

---

# 3. `mdm/tenants.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  index,
  pgSchema,
  uniqueIndex,
  varchar,
  date,
} from "drizzle-orm/pg-core"

import {
  aliasesColumn,
  countryCodeColumn,
  createdUpdatedVersionActorColumns,
  currencyCodeColumn,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import {
  governanceLevelEnum,
  statusEnum,
  tenantTypeEnum,
} from "../shared/enums"

export const mdm = pgSchema("mdm")
export const ref = pgSchema("ref")

export const currencies = ref.table("currencies", {
  code: currencyCodeColumn("code").primaryKey(),
})

export const locales = ref.table("locales", {
  code: varchar("code", { length: 20 }).primaryKey(),
})

export const timezones = ref.table("timezones", {
  name: varchar("name", { length: 100 }).primaryKey(),
})

export const countries = ref.table("countries", {
  code: countryCodeColumn("code").primaryKey(),
})

/**
 * Tenant is the business governance root.
 *
 * It is not a DevOps workspace.
 * It is the enterprise truth boundary for:
 * - structure
 * - policies
 * - master ownership
 * - access scope
 * - audit responsibility
 */
export const tenants = mdm.table(
  "tenants",
  {
    ...idColumn,
    tenantCode: varchar("tenant_code", { length: 50 }).notNull(),
    tenantName: varchar("tenant_name", { length: 200 }).notNull(),
    tenantType: tenantTypeEnum("tenant_type").notNull(),
    status: statusEnum("status").notNull(),
    baseCurrencyCode: currencyCodeColumn("base_currency_code")
      .notNull()
      .references(() => currencies.code),
    reportingCurrencyCode: currencyCodeColumn(
      "reporting_currency_code"
    ).references(() => currencies.code),
    defaultLocaleCode: varchar("default_locale_code", { length: 20 })
      .notNull()
      .references(() => locales.code),
    defaultTimezoneName: varchar("default_timezone_name", { length: 100 })
      .notNull()
      .references(() => timezones.name),
    countryCode: countryCodeColumn("country_code")
      .notNull()
      .references(() => countries.code),
    activationDate: date("activation_date"),
    deactivationDate: date("deactivation_date"),
    mdmGovernanceLevel: governanceLevelEnum("mdm_governance_level").notNull(),
    ...aliasesColumn,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_tenants_tenant_code").on(table.tenantCode),
    idxStatus: index("idx_tenants_status").on(table.status),
    ckDeactivationDate: check(
      "ck_tenants_deactivation_date",
      sql`${table.deactivationDate} is null or ${table.activationDate} is null or ${table.deactivationDate} >= ${table.activationDate}`
    ),
  })
)
```

---

# 4. `mdm/legal-entities.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
  date,
} from "drizzle-orm/pg-core"

import {
  aliasesColumn,
  countryCodeColumn,
  createdUpdatedVersionActorColumns,
  currencyCodeColumn,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { legalEntityTypeEnum, statusEnum } from "../shared/enums"
import { tenants } from "./tenants"

const mdm = pgSchema("mdm")
const ref = pgSchema("ref")

const currencies = ref.table("currencies", {
  code: currencyCodeColumn("code").primaryKey(),
})

const countries = ref.table("countries", {
  code: countryCodeColumn("code").primaryKey(),
})

/**
 * Legal entity is the accounting / statutory boundary beneath tenant.
 *
 * Every finance-sensitive ERP runtime should resolve through this layer.
 */
export const legalEntities = mdm.table(
  "legal_entities",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    entityCode: varchar("entity_code", { length: 50 }).notNull(),
    legalName: varchar("legal_name", { length: 255 }).notNull(),
    tradingName: varchar("trading_name", { length: 255 }),
    entityType: legalEntityTypeEnum("entity_type").notNull(),
    registrationNumber: varchar("registration_number", { length: 100 }),
    taxRegistrationNumber: varchar("tax_registration_number", { length: 100 }),
    countryCode: countryCodeColumn("country_code")
      .notNull()
      .references(() => countries.code),
    baseCurrencyCode: currencyCodeColumn("base_currency_code")
      .notNull()
      .references(() => currencies.code),
    fiscalCalendarId: uuid("fiscal_calendar_id"),
    status: statusEnum("status").notNull(),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_legal_entities_tenant_code").on(
      table.tenantId,
      table.entityCode
    ),
    uqTenantIdId: uniqueIndex("uq_legal_entities_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_legal_entities_tenant_status").on(
      table.tenantId,
      table.status
    ),
    ckEffectiveDates: check(
      "ck_legal_entities_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)
```

---

# 5. `mdm/business-units.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  aliasesColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { businessUnitTypeEnum, statusEnum } from "../shared/enums"
import { legalEntities } from "./legal-entities"

const mdm = pgSchema("mdm")
const iam = pgSchema("iam")

const persons = iam.table("persons", {
  id: uuid("id").primaryKey(),
})

/**
 * Business unit is an operational / managerial structure beneath legal entity.
 *
 * Composite tenant-safe FK is intentional.
 */
export const businessUnits = mdm.table(
  "business_units",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    legalEntityId: uuid("legal_entity_id").notNull(),
    buCode: varchar("bu_code", { length: 50 }).notNull(),
    buName: varchar("bu_name", { length: 255 }).notNull(),
    buType: businessUnitTypeEnum("bu_type").notNull(),
    managerPersonId: uuid("manager_person_id").references(() => persons.id),
    status: statusEnum("status").notNull(),
    ...aliasesColumn,
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantLegalEntityCode: uniqueIndex(
      "uq_business_units_tenant_legal_entity_code"
    ).on(table.tenantId, table.legalEntityId, table.buCode),
    uqTenantIdId: uniqueIndex("uq_business_units_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_business_units_tenant_status").on(
      table.tenantId,
      table.status
    ),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_business_units_tenant_legal_entity",
    }),
    ckEffectiveDates: check(
      "ck_business_units_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)
```

---

# 6. `mdm/locations.ts`

```ts
import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  foreignKey,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  aliasesColumn,
  countryCodeColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import { locationTypeEnum, statusEnum } from "../shared/enums"
import { businessUnits } from "./business-units"
import { legalEntities } from "./legal-entities"

const mdm = pgSchema("mdm")
const ref = pgSchema("ref")

const addresses = mdm.table("addresses", {
  id: uuid("id").primaryKey(),
})

const countries = ref.table("countries", {
  code: countryCodeColumn("code").primaryKey(),
})

const timezones = ref.table("timezones", {
  name: varchar("name", { length: 100 }).primaryKey(),
})

/**
 * Location is the operational site boundary: branch / warehouse / store / plant.
 */
export const locations = mdm.table(
  "locations",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    legalEntityId: uuid("legal_entity_id").notNull(),
    businessUnitId: uuid("business_unit_id"),
    locationCode: varchar("location_code", { length: 50 }).notNull(),
    locationName: varchar("location_name", { length: 255 }).notNull(),
    locationType: locationTypeEnum("location_type").notNull(),
    addressId: uuid("address_id").references(() => addresses.id),
    timezoneName: varchar("timezone_name", { length: 100 })
      .notNull()
      .references(() => timezones.name),
    countryCode: countryCodeColumn("country_code")
      .notNull()
      .references(() => countries.code),
    isOperatingSite: boolean("is_operating_site").notNull().default(true),
    status: statusEnum("status").notNull(),
    ...aliasesColumn,
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantLegalEntityCode: uniqueIndex(
      "uq_locations_tenant_legal_entity_code"
    ).on(table.tenantId, table.legalEntityId, table.locationCode),
    uqTenantIdId: uniqueIndex("uq_locations_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_locations_tenant_status").on(
      table.tenantId,
      table.status
    ),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_locations_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_locations_tenant_business_unit",
    }),
    ckEffectiveDates: check(
      "ck_locations_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
  })
)
```

---

# 7. `mdm/parties.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  pgSchema,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  aliasesColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import {
  mdmStatusEnum,
  ownershipLevelEnum,
  partyTypeEnum,
  statusEnum,
} from "../shared/enums"
import { businessUnits } from "./business-units"
import { legalEntities } from "./legal-entities"
import { locations } from "./locations"
import { tenants } from "./tenants"

const mdm = pgSchema("mdm")
const governance = pgSchema("governance")

const dataSources = governance.table("data_sources", {
  id: uuid("id").primaryKey(),
})

/**
 * Party is the canonical business counterparty / person / organization master.
 *
 * This is golden-record territory.
 * Ownership scope check is intentional and should stay hard in DB.
 */
export const parties = mdm.table(
  "parties",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    partyCode: varchar("party_code", { length: 50 }).notNull(),
    partyType: partyTypeEnum("party_type").notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    canonicalName: varchar("canonical_name", { length: 255 }).notNull(),
    canonicalNameNormalized: text("canonical_name_normalized"),
    ownershipLevel: ownershipLevelEnum("ownership_level")
      .notNull()
      .default("tenant"),
    legalEntityId: uuid("legal_entity_id"),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    status: statusEnum("status").notNull(),
    mdmStatus: mdmStatusEnum("mdm_status").notNull(),
    sourceSystemId: uuid("source_system_id").references(() => dataSources.id),
    goldenRecordId: uuid("golden_record_id"),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_parties_tenant_code").on(
      table.tenantId,
      table.partyCode
    ),
    uqTenantIdId: uniqueIndex("uq_parties_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_parties_tenant_status").on(
      table.tenantId,
      table.status
    ),
    idxTenantMdmStatus: index("idx_parties_tenant_mdm_status").on(
      table.tenantId,
      table.mdmStatus
    ),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_parties_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_parties_tenant_business_unit",
    }),
    fkTenantLocation: foreignKey({
      columns: [table.tenantId, table.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_parties_tenant_location",
    }),
    ckEffectiveDates: check(
      "ck_parties_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    ckOwnershipScope: check(
      "ck_parties_ownership_scope",
      sql`(
        (${table.ownershipLevel} = 'tenant' and ${table.legalEntityId} is null and ${table.businessUnitId} is null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'legal_entity' and ${table.legalEntityId} is not null and ${table.businessUnitId} is null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'business_unit' and ${table.legalEntityId} is not null and ${table.businessUnitId} is not null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'location' and ${table.legalEntityId} is not null and ${table.locationId} is not null)
      )`
    ),
  })
)
```

---

# 8. `mdm/items.ts`

```ts
import { sql } from "drizzle-orm"
import {
  check,
  foreignKey,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  aliasesColumn,
  createdUpdatedVersionActorColumns,
  effectiveDateColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import {
  itemTypeEnum,
  mdmStatusEnum,
  ownershipLevelEnum,
  statusEnum,
  valuationMethodEnum,
} from "../shared/enums"
import { businessUnits } from "./business-units"
import { legalEntities } from "./legal-entities"
import { locations } from "./locations"
import { tenants } from "./tenants"

const mdm = pgSchema("mdm")
const ref = pgSchema("ref")
const governance = pgSchema("governance")

const uoms = ref.table("uoms", {
  code: varchar("code", { length: 20 }).primaryKey(),
})

const itemCategories = mdm.table("item_categories", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
})

const dataSources = governance.table("data_sources", {
  id: uuid("id").primaryKey(),
})

/**
 * Item is the canonical product / service / asset / expense master.
 */
export const items = mdm.table(
  "items",
  {
    ...idColumn,
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    itemCode: varchar("item_code", { length: 50 }).notNull(),
    itemName: varchar("item_name", { length: 255 }).notNull(),
    itemType: itemTypeEnum("item_type").notNull(),
    baseUomCode: varchar("base_uom_code", { length: 20 })
      .notNull()
      .references(() => uoms.code),
    categoryId: uuid("category_id"),
    ownershipLevel: ownershipLevelEnum("ownership_level")
      .notNull()
      .default("tenant"),
    legalEntityId: uuid("legal_entity_id"),
    businessUnitId: uuid("business_unit_id"),
    locationId: uuid("location_id"),
    valuationMethod: valuationMethodEnum("valuation_method"),
    status: statusEnum("status").notNull(),
    mdmStatus: mdmStatusEnum("mdm_status").notNull().default("golden"),
    sourceSystemId: uuid("source_system_id").references(() => dataSources.id),
    ...aliasesColumn,
    externalRef: varchar("external_ref", { length: 100 }),
    ...effectiveDateColumns,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionActorColumns,
  },
  (table) => ({
    uqTenantCode: uniqueIndex("uq_items_tenant_code").on(
      table.tenantId,
      table.itemCode
    ),
    uqTenantIdId: uniqueIndex("uq_items_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_items_tenant_status").on(
      table.tenantId,
      table.status
    ),
    idxTenantMdmStatus: index("idx_items_tenant_mdm_status").on(
      table.tenantId,
      table.mdmStatus
    ),
    fkCategory: foreignKey({
      columns: [table.tenantId, table.categoryId],
      foreignColumns: [itemCategories.tenantId, itemCategories.id],
      name: "fk_items_category",
    }),
    fkTenantLegalEntity: foreignKey({
      columns: [table.tenantId, table.legalEntityId],
      foreignColumns: [legalEntities.tenantId, legalEntities.id],
      name: "fk_items_tenant_legal_entity",
    }),
    fkTenantBusinessUnit: foreignKey({
      columns: [table.tenantId, table.businessUnitId],
      foreignColumns: [businessUnits.tenantId, businessUnits.id],
      name: "fk_items_tenant_business_unit",
    }),
    fkTenantLocation: foreignKey({
      columns: [table.tenantId, table.locationId],
      foreignColumns: [locations.tenantId, locations.id],
      name: "fk_items_tenant_location",
    }),
    ckEffectiveDates: check(
      "ck_items_effective_date",
      sql`${table.effectiveTo} is null or ${table.effectiveTo} >= ${table.effectiveFrom}`
    ),
    ckOwnershipScope: check(
      "ck_items_ownership_scope",
      sql`(
        (${table.ownershipLevel} = 'tenant' and ${table.legalEntityId} is null and ${table.businessUnitId} is null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'legal_entity' and ${table.legalEntityId} is not null and ${table.businessUnitId} is null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'business_unit' and ${table.legalEntityId} is not null and ${table.businessUnitId} is not null and ${table.locationId} is null)
        or
        (${table.ownershipLevel} = 'location' and ${table.legalEntityId} is not null and ${table.locationId} is not null)
      )`
    ),
  })
)
```

---

# 9. `finance/accounts.ts`

```ts
import {
  boolean,
  foreignKey,
  index,
  pgSchema,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import {
  aliasesColumn,
  createdUpdatedVersionColumns,
  idColumn,
  metadataColumn,
  softDeleteColumn,
} from "../shared/columns"
import {
  accountTypeEnum,
  normalBalanceEnum,
  postingTypeEnum,
  statusEnum,
} from "../shared/enums"

const finance = pgSchema("finance")

const chartOfAccountSets = finance.table("chart_of_account_sets", {
  id: uuid("id").primaryKey(),
  tenantId: uuid("tenant_id").notNull(),
})

/**
 * Account remains tenant-scoped even when keyed by COA set.
 *
 * Parent-child hierarchy is retained but should be cycle-checked separately if needed.
 */
export const accounts = finance.table(
  "accounts",
  {
    ...idColumn,
    tenantId: uuid("tenant_id").notNull(),
    coaSetId: uuid("coa_set_id").notNull(),
    parentAccountId: uuid("parent_account_id"),
    accountCode: varchar("account_code", { length: 50 }).notNull(),
    accountName: varchar("account_name", { length: 200 }).notNull(),
    accountType: accountTypeEnum("account_type").notNull(),
    postingType: postingTypeEnum("posting_type").notNull(),
    normalBalance: normalBalanceEnum("normal_balance").notNull(),
    isControlAccount: boolean("is_control_account").notNull().default(false),
    status: statusEnum("status").notNull().default("active"),
    ...aliasesColumn,
    ...metadataColumn,
    ...softDeleteColumn,
    ...createdUpdatedVersionColumns,
  },
  (table) => ({
    uqCoaCode: uniqueIndex("uq_accounts_coa_code").on(
      table.coaSetId,
      table.accountCode
    ),
    uqTenantIdId: uniqueIndex("uq_accounts_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
    idxTenantStatus: index("idx_accounts_tenant_status").on(
      table.tenantId,
      table.status
    ),
    fkCoaSet: foreignKey({
      columns: [table.tenantId, table.coaSetId],
      foreignColumns: [chartOfAccountSets.tenantId, chartOfAccountSets.id],
      name: "fk_accounts_coa_set",
    }),
    fkParent: foreignKey({
      columns: [table.parentAccountId],
      foreignColumns: [table.id],
      name: "fk_accounts_parent",
    }),
  })
)
```

---

# 10. `0002_hardening.sql`

This is where the real database power lives.

```sql
-- ============================================================
-- HARDENING PATCH SET
-- ============================================================

create extension if not exists pg_trgm;
create extension if not exists btree_gist;

-- ------------------------------------------------------------
-- Trigger functions
-- ------------------------------------------------------------

create or replace function governance.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function governance.bump_version_no()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    new.version_no = old.version_no + 1;
  end if;
  return new;
end;
$$;

-- ------------------------------------------------------------
-- Trigger wiring
-- ------------------------------------------------------------

create trigger trg_tenants_set_updated_at
before update on mdm.tenants
for each row execute function governance.set_updated_at();

create trigger trg_tenants_bump_version
before update on mdm.tenants
for each row execute function governance.bump_version_no();

create trigger trg_legal_entities_set_updated_at
before update on mdm.legal_entities
for each row execute function governance.set_updated_at();

create trigger trg_legal_entities_bump_version
before update on mdm.legal_entities
for each row execute function governance.bump_version_no();

create trigger trg_business_units_set_updated_at
before update on mdm.business_units
for each row execute function governance.set_updated_at();

create trigger trg_business_units_bump_version
before update on mdm.business_units
for each row execute function governance.bump_version_no();

create trigger trg_locations_set_updated_at
before update on mdm.locations
for each row execute function governance.set_updated_at();

create trigger trg_locations_bump_version
before update on mdm.locations
for each row execute function governance.bump_version_no();

create trigger trg_parties_set_updated_at
before update on mdm.parties
for each row execute function governance.set_updated_at();

create trigger trg_parties_bump_version
before update on mdm.parties
for each row execute function governance.bump_version_no();

create trigger trg_items_set_updated_at
before update on mdm.items
for each row execute function governance.set_updated_at();

create trigger trg_items_bump_version
before update on mdm.items
for each row execute function governance.bump_version_no();

create trigger trg_accounts_set_updated_at
before update on finance.accounts
for each row execute function governance.set_updated_at();

create trigger trg_accounts_bump_version
before update on finance.accounts
for each row execute function governance.bump_version_no();

-- ------------------------------------------------------------
-- Generated column for normalized MDM party search
-- ------------------------------------------------------------

alter table mdm.parties
  add column if not exists canonical_name_normalized_generated text
  generated always as (
    lower(regexp_replace(canonical_name, '\s+', ' ', 'g'))
  ) stored;

create index if not exists idx_parties_canonical_name_normalized_generated
  on mdm.parties (tenant_id, canonical_name_normalized_generated);

-- ------------------------------------------------------------
-- Search indexes
-- ------------------------------------------------------------

create index if not exists idx_parties_display_name_trgm
  on mdm.parties using gin (display_name gin_trgm_ops);

create index if not exists idx_parties_canonical_name_trgm
  on mdm.parties using gin (canonical_name gin_trgm_ops);

create index if not exists idx_items_name_trgm
  on mdm.items using gin (item_name gin_trgm_ops);

create index if not exists idx_legal_entities_name_trgm
  on mdm.legal_entities using gin (legal_name gin_trgm_ops);

create index if not exists idx_parties_aliases_gin
  on mdm.parties using gin (aliases);

create index if not exists idx_items_aliases_gin
  on mdm.items using gin (aliases);

create index if not exists idx_legal_entities_aliases_gin
  on mdm.legal_entities using gin (aliases);

create index if not exists idx_tenants_aliases_gin
  on mdm.tenants using gin (aliases);

create index if not exists idx_tenants_metadata_gin
  on mdm.tenants using gin (metadata);

create index if not exists idx_parties_metadata_gin
  on mdm.parties using gin (metadata);

create index if not exists idx_items_metadata_gin
  on mdm.items using gin (metadata);

-- ------------------------------------------------------------
-- Soft-delete-aware alternate uniqueness
-- ------------------------------------------------------------

create unique index if not exists uq_legal_entities_registration_active
  on mdm.legal_entities (tenant_id, registration_number)
  where registration_number is not null and is_deleted = false;

create unique index if not exists uq_legal_entities_tax_registration_active
  on mdm.legal_entities (tenant_id, tax_registration_number)
  where tax_registration_number is not null and is_deleted = false;

create unique index if not exists uq_tenants_name_active
  on mdm.tenants (tenant_name)
  where is_deleted = false;

-- ------------------------------------------------------------
-- Nullable-scope uniqueness hardening for item_entity_settings
-- ------------------------------------------------------------

create unique index if not exists uq_item_entity_settings_le_only
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, effective_from)
  where business_unit_id is null
    and location_id is null
    and is_deleted = false;

create unique index if not exists uq_item_entity_settings_bu
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, business_unit_id, effective_from)
  where business_unit_id is not null
    and location_id is null
    and is_deleted = false;

create unique index if not exists uq_item_entity_settings_location
  on mdm.item_entity_settings (tenant_id, item_id, legal_entity_id, location_id, effective_from)
  where location_id is not null
    and is_deleted = false;

-- ------------------------------------------------------------
-- One preferred alias per alias type
-- ------------------------------------------------------------

create unique index if not exists uq_master_aliases_preferred
  on mdm.master_aliases (tenant_id, master_domain, master_id, alias_type)
  where is_preferred = true and is_deleted = false;

-- ------------------------------------------------------------
-- One default sequence per scope
-- ------------------------------------------------------------

create unique index if not exists uq_document_sequences_default
  on mdm.document_sequences (tenant_id, legal_entity_id, document_type)
  where is_default = true and is_deleted = false;

-- ------------------------------------------------------------
-- Temporal no-overlap on tenant policies
-- ------------------------------------------------------------

alter table mdm.tenant_policies
  add column if not exists effective_range daterange
  generated always as (
    daterange(effective_from, coalesce(effective_to + 1, 'infinity'::date), '[)')
  ) stored;

alter table mdm.tenant_policies
  drop constraint if exists ex_tenant_policies_no_overlap;

alter table mdm.tenant_policies
  add constraint ex_tenant_policies_no_overlap
  exclude using gist (
    tenant_id with =,
    policy_domain with =,
    policy_key with =,
    effective_range with &&
  )
  where (is_deleted = false);

-- ------------------------------------------------------------
-- Polymorphic master reference validator
-- ------------------------------------------------------------

create or replace function governance.validate_master_domain_reference()
returns trigger
language plpgsql
as $$
declare
  v_exists boolean;
begin
  if new.master_domain = 'party' then
    select exists (
      select 1 from mdm.parties
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'item' then
    select exists (
      select 1 from mdm.items
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'legal_entity' then
    select exists (
      select 1 from mdm.legal_entities
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'business_unit' then
    select exists (
      select 1 from mdm.business_units
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'location' then
    select exists (
      select 1 from mdm.locations
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  elsif new.master_domain = 'account' then
    select exists (
      select 1 from finance.accounts
      where id = new.master_id
        and tenant_id = new.tenant_id
    ) into v_exists;

  else
    raise exception 'Unsupported master_domain: %', new.master_domain;
  end if;

  if not v_exists then
    raise exception 'Invalid master reference for domain %, tenant %, id %',
      new.master_domain, new.tenant_id, new.master_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_master_aliases_validate_domain_ref on mdm.master_aliases;
create trigger trg_master_aliases_validate_domain_ref
before insert or update on mdm.master_aliases
for each row execute function governance.validate_master_domain_reference();

drop trigger if exists trg_external_identities_validate_domain_ref on mdm.external_identities;
create trigger trg_external_identities_validate_domain_ref
before insert or update on mdm.external_identities
for each row execute function governance.validate_master_domain_reference();

-- ------------------------------------------------------------
-- Canonical sequence allocation
-- ------------------------------------------------------------

create or replace function mdm.allocate_document_number(
  p_tenant_id uuid,
  p_legal_entity_id uuid,
  p_document_type varchar,
  p_sequence_code varchar
)
returns table (
  sequence_id uuid,
  allocated_number bigint,
  formatted_number text
)
language plpgsql
as $$
declare
  v_seq record;
begin
  select *
  into v_seq
  from mdm.document_sequences
  where tenant_id = p_tenant_id
    and document_type = p_document_type
    and (
      (legal_entity_id is null and p_legal_entity_id is null)
      or legal_entity_id = p_legal_entity_id
    )
    and sequence_code = p_sequence_code
    and is_deleted = false
    and status = 'active'
  for update;

  if not found then
    raise exception 'No active document sequence found';
  end if;

  update mdm.document_sequences
  set next_number = next_number + 1
  where id = v_seq.id;

  sequence_id := v_seq.id;
  allocated_number := v_seq.next_number;
  formatted_number := coalesce(v_seq.prefix_pattern, '')
    || lpad(v_seq.next_number::text, v_seq.padding_length, '0')
    || coalesce(v_seq.suffix_pattern, '');

  return next;
end;
$$;
```

---

# 11. Implementation notes that matter

## A. Why I did not fake everything in Drizzle

Some things should stay raw SQL:

- trigger functions
- generated columns
- partial unique indexes
- GIN/trigram indexes
- exclusion constraints
- polymorphic validation
- sequence allocation functions

That is the correct enterprise split.

## B. Why composite FK is everywhere important

This stops cross-tenant reference leakage.

Bad:

```ts
legalEntityId -> legal_entities.id
```

Good:

```ts
(tenantId, legalEntityId) -> legal_entities(tenant_id, id)
```

## C. Why hardening patch matters

Without the patch, your schema is only **structurally decent**.
With the patch, it becomes **operationally trustworthy**.

---

# 12. Strong next wave

The next file pack should be:

- `mdm/item-entity-settings.ts`
- `mdm/master-aliases.ts`
- `mdm/external-identities.ts`
- `mdm/tenant-policies.ts`
- `finance/fiscal-calendars.ts`
- `finance/fiscal-periods.ts`
- `finance/chart-of-account-sets.ts`
- `iam/tenant-memberships.ts`
- `iam/tenant-roles.ts`
- `iam/tenant-role-assignments.ts`

That would complete the spine instead of only the core root.
