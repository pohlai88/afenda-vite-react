/**
 * PostgreSQL requires composite FK targets to use PRIMARY KEY or UNIQUE constraints —
 * not merely CREATE UNIQUE INDEX. Baseline DDL must declare these before ALTER … ADD FK.
 */
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const migrationPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../drizzle/0000_dear_rockslide.sql"
)

const uqTenantId = (name: string) =>
  `CONSTRAINT "${name}" UNIQUE ("tenant_id","id")`

describe("baseline migration: UNIQUE(tenant_id,id) for composite FK parents", () => {
  const sql = readFileSync(migrationPath, "utf8")

  it("declares uq_custom_field_definitions_tenant_id_id (fk_custom_field_values_definition)", () => {
    expect(sql).toContain(uqTenantId("uq_custom_field_definitions_tenant_id_id"))
  })

  it("declares uq_chart_of_account_sets_tenant_id_id (fk_accounts_coa_set)", () => {
    expect(sql).toContain(uqTenantId("uq_chart_of_account_sets_tenant_id_id"))
  })

  it("declares uq_addresses_tenant_id_id (fk_party_addresses_address)", () => {
    expect(sql).toContain(uqTenantId("uq_addresses_tenant_id_id"))
  })
})
