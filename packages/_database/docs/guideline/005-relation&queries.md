Below is the **relations + query resolver pack**.

This is the layer that makes the schema usable in application code without letting query logic drift everywhere.

I will structure it as:

- `relations/iam-relations.ts`
- `relations/finance-relations.ts`
- `relations/mdm-relations.ts`
- `queries/resolve-current-tenant-policy.ts`
- `queries/resolve-item-settings.ts`
- `queries/resolve-membership-scope.ts`

The doctrine stays the same:

- **schema is the truth**
- **query resolvers are canonical**
- **services should call resolvers, not invent ad hoc joins**
- **fallback rules must be explicit and centralized**

---

# 1. `relations/iam-relations.ts`

```ts
import { relations } from "drizzle-orm"

import { tenantMemberships } from "../schema/iam/tenant-memberships"
import { tenantRoleAssignments } from "../schema/iam/tenant-role-assignments"
import { tenantRoles } from "../schema/iam/tenant-roles"
import { userAccounts } from "../schema/iam/tenant-memberships"
import { persons } from "../schema/iam/tenant-memberships"

import { tenants } from "../schema/mdm/tenants"
import { legalEntities } from "../schema/mdm/legal-entities"
import { businessUnits } from "../schema/mdm/business-units"
import { locations } from "../schema/mdm/locations"

export const tenantMembershipsRelations = relations(
  tenantMemberships,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [tenantMemberships.tenantId],
      references: [tenants.id],
    }),
    userAccount: one(userAccounts, {
      fields: [tenantMemberships.userAccountId],
      references: [userAccounts.id],
    }),
    person: one(persons, {
      fields: [tenantMemberships.personId],
      references: [persons.id],
    }),
    defaultLegalEntity: one(legalEntities, {
      fields: [tenantMemberships.defaultLegalEntityId],
      references: [legalEntities.id],
    }),
    defaultBusinessUnit: one(businessUnits, {
      fields: [tenantMemberships.defaultBusinessUnitId],
      references: [businessUnits.id],
    }),
    defaultLocation: one(locations, {
      fields: [tenantMemberships.defaultLocationId],
      references: [locations.id],
    }),
    roleAssignments: many(tenantRoleAssignments),
  })
)

export const tenantRolesRelations = relations(tenantRoles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [tenantRoles.tenantId],
    references: [tenants.id],
  }),
  assignments: many(tenantRoleAssignments),
}))

export const tenantRoleAssignmentsRelations = relations(
  tenantRoleAssignments,
  ({ one }) => ({
    membership: one(tenantMemberships, {
      fields: [tenantRoleAssignments.tenantMembershipId],
      references: [tenantMemberships.id],
    }),
    role: one(tenantRoles, {
      fields: [tenantRoleAssignments.tenantRoleId],
      references: [tenantRoles.id],
    }),
  })
)
```

---

# 2. `relations/finance-relations.ts`

```ts
import { relations } from "drizzle-orm"

import { fiscalCalendars } from "../schema/finance/fiscal-calendars"
import { fiscalPeriods } from "../schema/finance/fiscal-periods"
import { chartOfAccountSets } from "../schema/finance/chart-of-account-sets"
import { accounts } from "../schema/finance/accounts"

import { tenants } from "../schema/mdm/tenants"
import { legalEntities } from "../schema/mdm/legal-entities"
import { itemEntitySettings } from "../schema/mdm/item-entity-settings"

export const fiscalCalendarsRelations = relations(
  fiscalCalendars,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [fiscalCalendars.tenantId],
      references: [tenants.id],
    }),
    periods: many(fiscalPeriods),
    legalEntities: many(legalEntities),
  })
)

export const fiscalPeriodsRelations = relations(fiscalPeriods, ({ one }) => ({
  fiscalCalendar: one(fiscalCalendars, {
    fields: [fiscalPeriods.fiscalCalendarId],
    references: [fiscalCalendars.id],
  }),
}))

export const chartOfAccountSetsRelations = relations(
  chartOfAccountSets,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [chartOfAccountSets.tenantId],
      references: [tenants.id],
    }),
    accounts: many(accounts),
  })
)

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  chartOfAccountSet: one(chartOfAccountSets, {
    fields: [accounts.coaSetId],
    references: [chartOfAccountSets.id],
  }),
  parent: one(accounts, {
    fields: [accounts.parentAccountId],
    references: [accounts.id],
    relationName: "account_parent",
  }),
  children: many(accounts, {
    relationName: "account_parent",
  }),
  salesItemSettings: many(itemEntitySettings, {
    relationName: "sales_account_item_settings",
  }),
  inventoryItemSettings: many(itemEntitySettings, {
    relationName: "inventory_account_item_settings",
  }),
  cogsItemSettings: many(itemEntitySettings, {
    relationName: "cogs_account_item_settings",
  }),
}))
```

---

# 3. `relations/mdm-relations.ts`

```ts
import { relations } from "drizzle-orm"

import { tenants } from "../schema/mdm/tenants"
import { tenantPolicies } from "../schema/mdm/tenant-policies"
import { legalEntities } from "../schema/mdm/legal-entities"
import { businessUnits } from "../schema/mdm/business-units"
import { locations } from "../schema/mdm/locations"
import { parties } from "../schema/mdm/parties"
import { items } from "../schema/mdm/items"
import { itemEntitySettings } from "../schema/mdm/item-entity-settings"
import { masterAliases } from "../schema/mdm/master-aliases"
import { externalIdentities } from "../schema/mdm/external-identities"

import { fiscalCalendars } from "../schema/finance/fiscal-calendars"
import { accounts } from "../schema/finance/accounts"

export const tenantsRelations = relations(tenants, ({ many }) => ({
  policies: many(tenantPolicies),
  legalEntities: many(legalEntities),
  businessUnits: many(businessUnits),
  locations: many(locations),
  parties: many(parties),
  items: many(items),
  aliases: many(masterAliases),
  externalIdentities: many(externalIdentities),
}))

export const tenantPoliciesRelations = relations(tenantPolicies, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantPolicies.tenantId],
    references: [tenants.id],
  }),
}))

export const legalEntitiesRelations = relations(
  legalEntities,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [legalEntities.tenantId],
      references: [tenants.id],
    }),
    fiscalCalendar: one(fiscalCalendars, {
      fields: [legalEntities.fiscalCalendarId],
      references: [fiscalCalendars.id],
    }),
    businessUnits: many(businessUnits),
    locations: many(locations),
  })
)

export const businessUnitsRelations = relations(
  businessUnits,
  ({ one, many }) => ({
    legalEntity: one(legalEntities, {
      fields: [businessUnits.legalEntityId],
      references: [legalEntities.id],
    }),
    locations: many(locations),
  })
)

export const locationsRelations = relations(locations, ({ one }) => ({
  legalEntity: one(legalEntities, {
    fields: [locations.legalEntityId],
    references: [legalEntities.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [locations.businessUnitId],
    references: [businessUnits.id],
  }),
}))

export const partiesRelations = relations(parties, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [parties.tenantId],
    references: [tenants.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [parties.legalEntityId],
    references: [legalEntities.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [parties.businessUnitId],
    references: [businessUnits.id],
  }),
  location: one(locations, {
    fields: [parties.locationId],
    references: [locations.id],
  }),
  goldenRecord: one(parties, {
    fields: [parties.goldenRecordId],
    references: [parties.id],
    relationName: "party_golden_record",
  }),
  mergedChildren: many(parties, {
    relationName: "party_golden_record",
  }),
  aliases: many(masterAliases),
  externalIdentities: many(externalIdentities),
}))

export const itemsRelations = relations(items, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [items.tenantId],
    references: [tenants.id],
  }),
  legalEntity: one(legalEntities, {
    fields: [items.legalEntityId],
    references: [legalEntities.id],
  }),
  businessUnit: one(businessUnits, {
    fields: [items.businessUnitId],
    references: [businessUnits.id],
  }),
  location: one(locations, {
    fields: [items.locationId],
    references: [locations.id],
  }),
  entitySettings: many(itemEntitySettings),
  aliases: many(masterAliases),
  externalIdentities: many(externalIdentities),
}))

export const itemEntitySettingsRelations = relations(
  itemEntitySettings,
  ({ one }) => ({
    item: one(items, {
      fields: [itemEntitySettings.itemId],
      references: [items.id],
    }),
    legalEntity: one(legalEntities, {
      fields: [itemEntitySettings.legalEntityId],
      references: [legalEntities.id],
    }),
    businessUnit: one(businessUnits, {
      fields: [itemEntitySettings.businessUnitId],
      references: [businessUnits.id],
    }),
    location: one(locations, {
      fields: [itemEntitySettings.locationId],
      references: [locations.id],
    }),
    salesAccount: one(accounts, {
      fields: [itemEntitySettings.salesAccountId],
      references: [accounts.id],
      relationName: "sales_account_item_settings",
    }),
    inventoryAccount: one(accounts, {
      fields: [itemEntitySettings.inventoryAccountId],
      references: [accounts.id],
      relationName: "inventory_account_item_settings",
    }),
    cogsAccount: one(accounts, {
      fields: [itemEntitySettings.cogsAccountId],
      references: [accounts.id],
      relationName: "cogs_account_item_settings",
    }),
  })
)
```

---

# 4. `queries/resolve-current-tenant-policy.ts`

This is the canonical “give me the active policy now” resolver.

```ts
import { and, desc, eq, isNull, lte, gte, or } from "drizzle-orm"

import type { InferSelectModel } from "drizzle-orm"
import type { PgDatabase } from "drizzle-orm/pg-core"

import { tenantPolicies } from "../schema/mdm/tenant-policies"

export type TenantPolicyRecord = InferSelectModel<typeof tenantPolicies>

export type ResolveCurrentTenantPolicyParams = {
  tenantId: string
  policyDomain: string
  policyKey: string
  asOfDate?: string
}

/**
 * Resolve the currently effective tenant policy.
 *
 * Rules:
 * - tenant must match
 * - domain + key must match
 * - status must be active
 * - not deleted
 * - effective_from <= asOfDate
 * - effective_to is null or effective_to >= asOfDate
 * - latest effective_from wins
 */
export async function resolveCurrentTenantPolicy(
  db: PgDatabase<any, any, any>,
  params: ResolveCurrentTenantPolicyParams
): Promise<TenantPolicyRecord | null> {
  const {
    tenantId,
    policyDomain,
    policyKey,
    asOfDate = new Date().toISOString().slice(0, 10),
  } = params

  const rows = await db
    .select()
    .from(tenantPolicies)
    .where(
      and(
        eq(tenantPolicies.tenantId, tenantId),
        eq(tenantPolicies.policyDomain, policyDomain),
        eq(tenantPolicies.policyKey, policyKey),
        eq(tenantPolicies.status, "active"),
        eq(tenantPolicies.isDeleted, false),
        lte(tenantPolicies.effectiveFrom, asOfDate),
        or(
          isNull(tenantPolicies.effectiveTo),
          gte(tenantPolicies.effectiveTo, asOfDate)
        )
      )
    )
    .orderBy(desc(tenantPolicies.effectiveFrom), desc(tenantPolicies.createdAt))
    .limit(1)

  return rows[0] ?? null
}
```

---

# 5. `queries/resolve-item-settings.ts`

This one is critical because ERP fallback logic must not be reinvented everywhere.

Fallback order:

1. exact `location`
2. exact `business unit`
3. exact `legal entity`

If two valid rows exist at same level, the database hardening layer should already have prevented that.

```ts
import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm"

import type { InferSelectModel } from "drizzle-orm"
import type { PgDatabase } from "drizzle-orm/pg-core"

import { itemEntitySettings } from "../schema/mdm/item-entity-settings"

export type ItemEntitySettingsRecord = InferSelectModel<
  typeof itemEntitySettings
>

export type ResolveItemSettingsParams = {
  tenantId: string
  itemId: string
  legalEntityId: string
  businessUnitId?: string | null
  locationId?: string | null
  asOfDate?: string
}

export type ResolvedItemSettings = {
  record: ItemEntitySettingsRecord | null
  resolvedScope: "location" | "business_unit" | "legal_entity" | null
}

/**
 * Resolve effective item settings using canonical fallback:
 * 1. location
 * 2. business unit
 * 3. legal entity
 *
 * Query discipline:
 * - tenant-safe
 * - date-effective
 * - active only
 * - not deleted
 */
export async function resolveItemSettings(
  db: PgDatabase<any, any, any>,
  params: ResolveItemSettingsParams
): Promise<ResolvedItemSettings> {
  const {
    tenantId,
    itemId,
    legalEntityId,
    businessUnitId = null,
    locationId = null,
    asOfDate = new Date().toISOString().slice(0, 10),
  } = params

  if (locationId) {
    const rows = await db
      .select()
      .from(itemEntitySettings)
      .where(
        and(
          eq(itemEntitySettings.tenantId, tenantId),
          eq(itemEntitySettings.itemId, itemId),
          eq(itemEntitySettings.legalEntityId, legalEntityId),
          eq(itemEntitySettings.locationId, locationId),
          eq(itemEntitySettings.isDeleted, false),
          eq(itemEntitySettings.isActive, true),
          lte(itemEntitySettings.effectiveFrom, asOfDate),
          or(
            isNull(itemEntitySettings.effectiveTo),
            gte(itemEntitySettings.effectiveTo, asOfDate)
          )
        )
      )
      .orderBy(
        desc(itemEntitySettings.effectiveFrom),
        desc(itemEntitySettings.createdAt)
      )
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
          eq(itemEntitySettings.isDeleted, false),
          eq(itemEntitySettings.isActive, true),
          lte(itemEntitySettings.effectiveFrom, asOfDate),
          or(
            isNull(itemEntitySettings.effectiveTo),
            gte(itemEntitySettings.effectiveTo, asOfDate)
          )
        )
      )
      .orderBy(
        desc(itemEntitySettings.effectiveFrom),
        desc(itemEntitySettings.createdAt)
      )
      .limit(1)

    if (rows[0]) {
      return { record: rows[0], resolvedScope: "business_unit" }
    }
  }

  {
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
          eq(itemEntitySettings.isDeleted, false),
          eq(itemEntitySettings.isActive, true),
          lte(itemEntitySettings.effectiveFrom, asOfDate),
          or(
            isNull(itemEntitySettings.effectiveTo),
            gte(itemEntitySettings.effectiveTo, asOfDate)
          )
        )
      )
      .orderBy(
        desc(itemEntitySettings.effectiveFrom),
        desc(itemEntitySettings.createdAt)
      )
      .limit(1)

    if (rows[0]) {
      return { record: rows[0], resolvedScope: "legal_entity" }
    }
  }

  return { record: null, resolvedScope: null }
}
```

---

# 6. `queries/resolve-membership-scope.ts`

This resolver answers:

- who is the member?
- what are their defaults?
- what roles do they have?
- what scopes do those roles apply to?

This becomes the canonical authorization input for commands and UI route guards.

```ts
import { and, eq, gte, isNull, lte, or } from "drizzle-orm"

import type { PgDatabase } from "drizzle-orm/pg-core"
import type { InferSelectModel } from "drizzle-orm"

import { tenantMemberships } from "../schema/iam/tenant-memberships"
import { tenantRoleAssignments } from "../schema/iam/tenant-role-assignments"
import { tenantRoles } from "../schema/iam/tenant-roles"

export type TenantMembershipRecord = InferSelectModel<typeof tenantMemberships>
export type TenantRoleAssignmentRecord = InferSelectModel<
  typeof tenantRoleAssignments
>
export type TenantRoleRecord = InferSelectModel<typeof tenantRoles>

export type ResolvedMembershipRoleScope = {
  assignment: TenantRoleAssignmentRecord
  role: TenantRoleRecord
}

export type ResolvedMembershipScope = {
  membership: TenantMembershipRecord | null
  roleScopes: ResolvedMembershipRoleScope[]
}

export type ResolveMembershipScopeParams = {
  tenantId: string
  userAccountId: string
  asOfDate?: string
}

/**
 * Resolve active tenant membership and effective role scopes.
 *
 * This is the canonical source for:
 * - route authorization
 * - command authorization
 * - default working scope bootstrapping
 */
export async function resolveMembershipScope(
  db: PgDatabase<any, any, any>,
  params: ResolveMembershipScopeParams
): Promise<ResolvedMembershipScope> {
  const {
    tenantId,
    userAccountId,
    asOfDate = new Date().toISOString().slice(0, 10),
  } = params

  const membershipRows = await db
    .select()
    .from(tenantMemberships)
    .where(
      and(
        eq(tenantMemberships.tenantId, tenantId),
        eq(tenantMemberships.userAccountId, userAccountId),
        eq(tenantMemberships.membershipStatus, "active"),
        eq(tenantMemberships.isDeleted, false)
      )
    )
    .limit(1)

  const membership = membershipRows[0] ?? null

  if (!membership) {
    return {
      membership: null,
      roleScopes: [],
    }
  }

  const roleRows = await db
    .select({
      assignment: tenantRoleAssignments,
      role: tenantRoles,
    })
    .from(tenantRoleAssignments)
    .innerJoin(
      tenantRoles,
      eq(tenantRoleAssignments.tenantRoleId, tenantRoles.id)
    )
    .where(
      and(
        eq(tenantRoleAssignments.tenantId, tenantId),
        eq(tenantRoleAssignments.tenantMembershipId, membership.id),
        eq(tenantRoleAssignments.isDeleted, false),
        eq(tenantRoles.isDeleted, false),
        lte(tenantRoleAssignments.effectiveFrom, asOfDate),
        or(
          isNull(tenantRoleAssignments.effectiveTo),
          gte(tenantRoleAssignments.effectiveTo, asOfDate)
        )
      )
    )

  return {
    membership,
    roleScopes: roleRows.map((row) => ({
      assignment: row.assignment,
      role: row.role,
    })),
  }
}
```

---

# 7. Optional stronger scope helpers

Now that you have canonical resolvers, the next good step is small pure helpers.

---

## `queries/helpers/scope-utils.ts`

```ts
export type RoleScopeType =
  | "tenant"
  | "legal_entity"
  | "business_unit"
  | "location"

export type ScopeMatchInput = {
  scopeType: RoleScopeType
  scopeId: string | null
  tenantId: string
  legalEntityId?: string | null
  businessUnitId?: string | null
  locationId?: string | null
}

/**
 * Returns true if an assignment scope covers the target runtime scope.
 */
export function matchesScope(input: ScopeMatchInput): boolean {
  const { scopeType, scopeId, legalEntityId, businessUnitId, locationId } =
    input

  if (scopeType === "tenant") {
    return true
  }

  if (scopeType === "legal_entity") {
    return scopeId != null && scopeId === legalEntityId
  }

  if (scopeType === "business_unit") {
    return scopeId != null && scopeId === businessUnitId
  }

  if (scopeType === "location") {
    return scopeId != null && scopeId === locationId
  }

  return false
}
```

This helper is intentionally simple and deterministic.

---

# 8. Example service usage

This shows how application code should consume the canonical resolvers.

---

## `application/example.ts`

```ts
import { resolveCurrentTenantPolicy } from "../queries/resolve-current-tenant-policy"
import { resolveItemSettings } from "../queries/resolve-item-settings"
import { resolveMembershipScope } from "../queries/resolve-membership-scope"
import { matchesScope } from "../queries/helpers/scope-utils"

export async function exampleUsage(db: any) {
  const membership = await resolveMembershipScope(db, {
    tenantId: "tenant-uuid",
    userAccountId: "user-uuid",
  })

  if (!membership.membership) {
    throw new Error("No active membership")
  }

  const poPolicy = await resolveCurrentTenantPolicy(db, {
    tenantId: "tenant-uuid",
    policyDomain: "procurement",
    policyKey: "po.approval.threshold",
  })

  const itemSettings = await resolveItemSettings(db, {
    tenantId: "tenant-uuid",
    itemId: "item-uuid",
    legalEntityId: "le-uuid",
    businessUnitId: "bu-uuid",
    locationId: "loc-uuid",
  })

  const canOperateInLocation = membership.roleScopes.some(
    ({ assignment, role }) => {
      if (role.roleCode !== "inventory_manager") {
        return false
      }

      return matchesScope({
        scopeType: assignment.scopeType,
        scopeId: assignment.scopeId,
        tenantId: "tenant-uuid",
        legalEntityId: "le-uuid",
        businessUnitId: "bu-uuid",
        locationId: "loc-uuid",
      })
    }
  )

  return {
    membership,
    poPolicy,
    itemSettings,
    canOperateInLocation,
  }
}
```

---

# 9. Why this query layer matters

Without this layer, teams start doing:

- one-off policy joins in random services
- inconsistent date filtering
- inconsistent fallback order
- accidental inclusion of deleted rows
- mismatched authorization behavior between UI and API

These resolvers stop that drift.

## Resolver doctrine

### `resolveCurrentTenantPolicy`

Use whenever behavior is driven by tenant-configurable rules.

### `resolveItemSettings`

Use whenever an item must resolve operational/accounting behavior by scope.

### `resolveMembershipScope`

Use whenever the system needs tenant-aware authorization context.

---

# 10. Important hardening recommendations for these resolvers

These are not code changes yet, but they matter.

## A. Add canonical database views

You may later create:

- `mdm.v_current_tenant_policies`
- `mdm.v_effective_item_entity_settings`
- `iam.v_effective_role_assignments`

Then resolvers can query views instead of repeating some date conditions.

## B. Add query result schemas

Use Zod on top of resolver output if you want service boundaries hardened.

## C. Add memoization only at service layer

Do not hide caching in the resolver itself unless your architecture centrally manages tenant/date scope.

## D. Add role precedence rules only when needed

Do not overengineer role aggregation too early. First resolve role scopes faithfully.

---

# 11. Best next wave from here

Now the natural next pack is:

- `queries/authorize-command-scope.ts`
- `queries/resolve-document-sequence.ts`
- `queries/resolve-current-fiscal-period.ts`
- `queries/search-party-master.ts`
- `queries/search-item-master.ts`

That would convert the database spine into a real ERP execution substrate.

The highest-value next file is probably:

**`authorize-command-scope.ts`**

because it turns:

- membership
- roles
- scope matching
  into a reusable command guard for API/runtime.
