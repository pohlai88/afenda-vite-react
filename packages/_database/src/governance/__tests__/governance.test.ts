import { describe, expect, it } from "vitest"

import {
  DRIZZLE_MIGRATIONS_SCHEMA,
  fkName,
  indexName,
  isDrizzleSchemaModuleFile,
  isMigrationSqlFilename,
  parseMigrationSqlFilename,
  pkName,
} from "../index.js"

describe("migration SQL filenames", () => {
  it("parses governed drizzle-kit style names", () => {
    expect(parseMigrationSqlFilename("0000_tenancy_tenants_initial.sql")).toEqual({
      index: "0000",
      slug: "tenancy_tenants_initial",
    })
    expect(isMigrationSqlFilename("0001_audit_logs_v1.sql")).toBe(true)
    expect(isMigrationSqlFilename("bad.sql")).toBe(false)
  })
})

describe("sql identifier helpers", () => {
  it("builds stable constraint names", () => {
    expect(pkName("role_permissions")).toBe("role_permissions_pk")
    expect(fkName("orders", "tenant_id")).toBe("orders_tenant_id_fk")
    expect(indexName("audit_logs", "tenant_occurred_at")).toBe(
      "audit_logs_tenant_occurred_at_idx"
    )
  })
})

describe("migrations schema constant", () => {
  it("matches drizzle-kit journal table schema", () => {
    expect(DRIZZLE_MIGRATIONS_SCHEMA).toBe("drizzle")
  })
})

describe("schema module filenames", () => {
  it("detects *.schema.ts for search/glob parity with *.test.ts", () => {
    expect(isDrizzleSchemaModuleFile("tenants.schema.ts")).toBe(true)
    expect(isDrizzleSchemaModuleFile("authorization/schema/roles.schema.ts")).toBe(true)
    expect(isDrizzleSchemaModuleFile("roles.ts")).toBe(false)
    expect(isDrizzleSchemaModuleFile("tenant.schema.test.ts")).toBe(false)
  })
})
