import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import {
  DRIZZLE_UNIQUE_TENANT_ID_RE,
  auditCompositeFkUniqueConstraints,
  findCompositeFkForeignColumnRefs,
  hasDrizzleUniqueTenantIdPair,
  resolveTargetFileForCompositeFk,
} from "../composite-fk-unique-guard.js"

const pkgRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  ".."
)

describe("composite-fk-unique-guard", () => {
  it("detects Drizzle unique(.on(tenantId, id))", () => {
    const ok = `
    uqTenantIdId: unique("uq_x_tenant_id_id").on(
      table.tenantId,
      table.id
    ),
`
    expect(hasDrizzleUniqueTenantIdPair(ok)).toBe(true)
    expect(DRIZZLE_UNIQUE_TENANT_ID_RE.test(ok)).toBe(true)
  })

  it("rejects uniqueIndex-only tenant+id (would not satisfy PostgreSQL FK)", () => {
    const bad = `
    uqTenantIdId: uniqueIndex("uq_x_tenant_id_id").on(table.tenantId, table.id),
`
    expect(hasDrizzleUniqueTenantIdPair(bad)).toBe(false)
  })

  it("parses foreignColumns: [ref.tenantId, ref.id]", () => {
    const src = `
    foreignKey({
      columns: [x.tenantId, x.y],
      foreignColumns: [items.tenantId, items.id],
    }),
`
    const refs = findCompositeFkForeignColumnRefs(src)
    expect(refs.map((r) => r.targetSymbol)).toEqual(["items"])
  })

  it("resolves self-ref table to current file", () => {
    const m = new Map([["accounts", "/a.ts"]])
    expect(resolveTargetFileForCompositeFk("table", "/b.ts", m)).toBe("/b.ts")
    expect(resolveTargetFileForCompositeFk("t", "/b.ts", m)).toBe("/b.ts")
    expect(resolveTargetFileForCompositeFk("accounts", "/b.ts", m)).toBe("/a.ts")
  })

  it("audit passes on current repo schema tree", () => {
    const violations = auditCompositeFkUniqueConstraints({
      schemaRoot: path.join(pkgRoot, "src", "schema"),
      extraRoots: [path.join(pkgRoot, "src", "7w1h-audit")],
    })
    expect(violations).toEqual([])
  })
})
