/**
 * Vitest: `mdm-canonical-views.ts` — pgView names, `mdm` schema, and effective-date predicate helper.
 */
import { and, gte, isNull, lte, or, sql } from "drizzle-orm"
import { getViewName } from "drizzle-orm"
import { describe, expect, it } from "vitest"

import { items } from "../../schema/mdm/items.schema"
import { parties } from "../../schema/mdm/parties.schema"
import { tenantPolicies } from "../../schema/mdm/tenant-policies.schema"
import {
  vCurrentTenantPolicies,
  vGoldenItems,
  vGoldenParties,
  whereEffectiveRangeIncludesToday,
} from "../mdm-canonical-views"
import {
  pgTableDataColumnKeys,
  readDrizzlePgViewMeta,
  readDrizzlePgViewSelectedFieldKeys,
} from "./drizzle-view-test-utils"
import {
  MDM_PG_SCHEMA,
  PG_VIEW_NAME_BY_EXPORT,
  VIEW_EXPORT_NAMES,
  VIEWS_FEATURE_COUNT,
} from "./views-inventory"

describe("whereEffectiveRangeIncludesToday", () => {
  const currentDate = sql`current_date`

  it.each([
    ["tenant_policies", tenantPolicies.effectiveFrom, tenantPolicies.effectiveTo],
    ["parties", parties.effectiveFrom, parties.effectiveTo],
    ["items", items.effectiveFrom, items.effectiveTo],
  ] as const)(
    "matches explicit and(lte, or(isNull, gte)) vs current_date (%s)",
    (_label, effectiveFrom, effectiveTo) => {
      const expected = and(
        lte(effectiveFrom, currentDate),
        or(isNull(effectiveTo), gte(effectiveTo, currentDate))
      )
      expect(String(whereEffectiveRangeIncludesToday(effectiveFrom, effectiveTo))).toBe(
        String(expected)
      )
    }
  )
})

describe("pgView read models (F1–F3)", () => {
  it("documents three feature areas", () => {
    expect(VIEWS_FEATURE_COUNT).toBe(3)
  })

  const viewsByExport = {
    vCurrentTenantPolicies,
    vGoldenItems,
    vGoldenParties,
  } as const

  it.each(VIEW_EXPORT_NAMES)("%s maps to the expected PostgreSQL name and mdm schema", (exportName) => {
    const view = viewsByExport[exportName]

    expect(getViewName(view)).toBe(PG_VIEW_NAME_BY_EXPORT[exportName])

    const meta = readDrizzlePgViewMeta(view)
    expect(meta.name).toBe(PG_VIEW_NAME_BY_EXPORT[exportName])
    expect(meta.originalName).toBe(PG_VIEW_NAME_BY_EXPORT[exportName])
    expect(meta.schema).toBe(MDM_PG_SCHEMA)
  })
})

describe("v_current_tenant_policies (F1)", () => {
  it("selects from tenant_policies with stable column projection", () => {
    expect(readDrizzlePgViewMeta(vCurrentTenantPolicies).name).toBe(
      "v_current_tenant_policies"
    )
    expect(readDrizzlePgViewSelectedFieldKeys(vCurrentTenantPolicies)).toEqual(
      pgTableDataColumnKeys(tenantPolicies as unknown as Record<string, unknown>)
    )
  })
})

describe("v_golden_parties (F2)", () => {
  it("selects from parties with stable column projection", () => {
    expect(readDrizzlePgViewSelectedFieldKeys(vGoldenParties)).toEqual(
      pgTableDataColumnKeys(parties as unknown as Record<string, unknown>)
    )
  })
})

describe("v_golden_items (F3)", () => {
  it("selects from items with stable column projection", () => {
    expect(readDrizzlePgViewSelectedFieldKeys(vGoldenItems)).toEqual(
      pgTableDataColumnKeys(items as unknown as Record<string, unknown>)
    )
  })
})
