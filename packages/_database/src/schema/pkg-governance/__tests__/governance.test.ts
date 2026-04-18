/**
 * Vitest: `pkg-governance` — migration names, identifier helpers, Zod boundaries (see module annotation envelopes).
 */
import { describe, expect, it } from "vitest"

import {
  DRIZZLE_MANAGED_PG_SCHEMAS,
  DRIZZLE_MIGRATIONS_SCHEMA,
  assertPgIdentifierLength,
  databaseConceptValueSchema,
  drizzleManagedPgSchemaSchema,
  fkName,
  indexName,
  isDrizzleSchemaModuleFile,
  isMigrationSqlFilename,
  parseMigrationSqlFilename,
  parsedMigrationSqlFilenameSchema,
  pgIdentifierUtf8ByteLength,
  pkName,
  uniqueName,
} from "../index.js"

describe("migration SQL filenames", () => {
  it("parses governed drizzle-kit style names", () => {
    const parsed = parseMigrationSqlFilename("0000_tenancy_tenants_initial.sql")
    expect(parsed).toEqual({
      index: "0000",
      slug: "tenancy_tenants_initial",
    })
    expect(parsedMigrationSqlFilenameSchema.safeParse(parsed).success).toBe(
      true
    )
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
    expect(uniqueName("users", "email_lower")).toBe("users_email_lower_uq")
  })

  it("measures UTF-8 bytes like PostgreSQL (not JS string length)", () => {
    const ascii = "a".repeat(64)
    expect(pgIdentifierUtf8ByteLength(ascii)).toBe(64)
    expect(() => assertPgIdentifierLength(ascii)).toThrow(/UTF-8 bytes/)

    const twoByteChars = "\u00e4".repeat(32)
    expect(twoByteChars.length).toBe(32)
    expect(pgIdentifierUtf8ByteLength(twoByteChars)).toBe(64)
    expect(() => assertPgIdentifierLength(twoByteChars)).toThrow(/UTF-8 bytes/)
  })
})

describe("migrations schema constant", () => {
  it("matches drizzle-kit journal table schema", () => {
    expect(DRIZZLE_MIGRATIONS_SCHEMA).toBe("drizzle")
  })
})

describe("drizzle managed schema filter", () => {
  it("lists DDL namespaces plus migrations journal schema", () => {
    expect(new Set(DRIZZLE_MANAGED_PG_SCHEMAS)).toEqual(
      new Set([
        "iam",
        "mdm",
        "ref",
        "finance",
        "governance",
        DRIZZLE_MIGRATIONS_SCHEMA,
      ])
    )
    for (const s of DRIZZLE_MANAGED_PG_SCHEMAS) {
      expect(drizzleManagedPgSchemaSchema.safeParse(s).success).toBe(true)
    }
  })
})

describe("database concept vocabulary", () => {
  it("parses every catalogued concept string", () => {
    expect(databaseConceptValueSchema.safeParse("table").success).toBe(true)
    expect(databaseConceptValueSchema.safeParse("not_a_concept").success).toBe(
      false
    )
  })
})

describe("schema module filenames", () => {
  it("detects *.schema.ts for search/glob parity with *.test.ts", () => {
    expect(isDrizzleSchemaModuleFile("tenants.schema.ts")).toBe(true)
    expect(
      isDrizzleSchemaModuleFile("authorization/schema/roles.schema.ts")
    ).toBe(true)
    expect(isDrizzleSchemaModuleFile("roles.ts")).toBe(false)
    expect(isDrizzleSchemaModuleFile("tenant.schema.test.ts")).toBe(false)
  })
})
