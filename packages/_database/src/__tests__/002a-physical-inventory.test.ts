/**
 * Physical directory & anchor inventory per `docs/guideline/002A-foundation-inventory-architecture.md`.
 * Database-testing skill: **Schema** layer — structure exists as specified (not live Postgres DDL).
 * Update this file when 002A §5–§7 inventories change.
 */
import { existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { HARDENING_PATCH_FILENAMES } from "../../scripts/verify-hardening-patch-order"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
)

function mustExist(relativePath: string): void {
  const full = path.join(packageRoot, relativePath)
  expect(existsSync(full), `${relativePath} missing (see 002A)`).toBe(true)
}

/** 002A §1 L1 — declarative schema graph roots */
const L1_ANCHORS = [
  "src/schema/index.ts",
  "src/7w1h-audit/index.ts",
  "src/views/index.ts",
  "src/views/mdm-canonical-views.ts",
] as const

/** 002A §1 L2 — relations + queries composition */
const L2_RELATIONS = [
  "src/relations/README.md",
  "src/relations/relation-names.ts",
  "src/relations/relations.schema.ts",
  "src/relations/ref-relations.ts",
  "src/relations/iam-relations.ts",
  "src/relations/mdm-relations.ts",
  "src/relations/finance-relations.ts",
  "src/relations/governance-relations.ts",
] as const

const L2_QUERIES = [
  "src/queries/index.ts",
  "src/queries/README.md",
  "src/queries/resolve-current-tenant-policy.ts",
  "src/queries/resolve-item-settings.ts",
  "src/queries/resolve-membership-scope.ts",
  "src/queries/query-primitives/effective-date-predicate.ts",
  "src/queries/query-primitives/iso-date-assertions.ts",
  "src/queries/query-primitives/scope-matching.ts",
] as const

/** 002A §1 L5 — studio / metadata */
const L5_STUDIO = [
  "src/studio/index.ts",
  "src/studio/build-studio-snapshots.ts",
  "src/studio/business-glossary.schema.ts",
  "src/studio/business-glossary.snapshot.json",
  "src/studio/business-glossary.ts",
  "src/studio/business-glossary.types.ts",
  "src/studio/database-truth-governance.snapshot.json",
  "src/studio/pg-enum-allowlist.ts",
  "src/studio/query-allowlisted-pg-enums.ts",
  "src/studio/studio-enums.schema.ts",
  "src/studio/studio-snapshot-metadata.schema.ts",
  "src/studio/studio-snapshots-public.ts",
  "src/studio/truth-governance.schema.ts",
  "src/studio/truth-governance.ts",
] as const

/** 002A §5.5 — package-root runtime anchors */
const PACKAGE_ANCHORS = [
  "drizzle.config.ts",
  "src/client.ts",
  "src/index.ts",
  "src/migrations/index.ts",
] as const

describe("002A physical inventory (directory & anchors)", () => {
  it("L1 declarative schema graph anchors exist", () => {
    expect(L1_ANCHORS.length).toBeGreaterThan(0)
    for (const p of L1_ANCHORS) mustExist(p)
  })

  it("L2 relations inventory exists", () => {
    expect(L2_RELATIONS.length).toBeGreaterThan(0)
    for (const p of L2_RELATIONS) mustExist(p)
  })

  it("L2 queries inventory exists", () => {
    expect(L2_QUERIES.length).toBeGreaterThan(0)
    for (const p of L2_QUERIES) mustExist(p)
  })

  it("L5 studio / metadata inventory exists", () => {
    expect(L5_STUDIO.length).toBeGreaterThan(0)
    for (const p of L5_STUDIO) mustExist(p)
  })

  it("L3 hardening SQL: every ordered patch file is on disk", () => {
    expect(HARDENING_PATCH_FILENAMES.length).toBeGreaterThan(0)
    for (const name of HARDENING_PATCH_FILENAMES) {
      mustExist(path.join("sql/hardening", name))
    }
    mustExist("sql/hardening/README.md")
  })

  it("L4 migration output directory exists with ignore rules (may be empty of SQL)", () => {
    expect(
      existsSync(path.join(packageRoot, "drizzle/.gitignore")),
      "drizzle/.gitignore missing (see 002A)"
    ).toBe(true)
  })

  it("package-root runtime anchors exist", () => {
    expect(PACKAGE_ANCHORS.length).toBeGreaterThan(0)
    for (const p of PACKAGE_ANCHORS) mustExist(p)
  })
})
