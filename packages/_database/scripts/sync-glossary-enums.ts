/**
 * One-shot: ensure business-glossary.snapshot.json has a postgres_enum entry per
 * STUDIO_PG_ENUM_ALLOWLIST name. From repo root:
 *   pnpm --filter @afenda/database run db:sync-glossary-enums
 * Or from packages/_database:
 *   pnpm run db:sync-glossary-enums
 */
import { createHash } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import type { BusinessGlossarySnapshot } from "../src/studio/business-glossary.schema"
import { STUDIO_PG_ENUM_ALLOWLIST } from "../src/studio/pg-enum-allowlist"

const __dirname = dirname(fileURLToPath(import.meta.url))
const snapshotPath = join(
  __dirname,
  "../src/studio/business-glossary.snapshot.json"
)

const ENUM_SHARED = "packages/_database/src/schema/shared/enums.schema.ts"
const ENUM_AUTH = "packages/_database/src/schema/iam/auth-challenges.schema.ts"
const ENUM_AUDIT = "packages/_database/src/7w1h-audit/audit-enums.schema.ts"

function drizzleFile(name: string): string {
  if (name.startsWith("auth_challenge_")) return ENUM_AUTH
  if (
    name === "audit_actor_type" ||
    name === "audit_outcome" ||
    name === "audit_source_channel" ||
    name === "deployment_environment"
  ) {
    return ENUM_AUDIT
  }
  return ENUM_SHARED
}

function domainFor(name: string): string {
  if (name === "generic_status" || name === "tenant_type") return "tenancy"
  if (
    [
      "mdm_governance_level",
      "legal_entity_type",
      "business_unit_type",
      "location_type",
      "address_type",
      "party_type",
      "mdm_status",
      "org_unit_type",
      "tax_registration_type",
      "master_domain",
      "alias_type",
      "source_type",
      "item_type",
      "valuation_method",
    ].includes(name)
  ) {
    return "organization"
  }
  if (
    [
      "ownership_level",
      "membership_status",
      "membership_type",
      "role_category",
      "role_scope_type",
      "policy_effect",
    ].includes(name)
  ) {
    return "authorization"
  }
  if (name.startsWith("auth_challenge_")) return "identity"
  if (
    [
      "audit_actor_type",
      "audit_outcome",
      "audit_source_channel",
      "deployment_environment",
    ].includes(name)
  ) {
    return "audit"
  }
  return "finance"
}

function label(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

function canon(
  b: Pick<
    BusinessGlossarySnapshot,
    | "schema_version"
    | "document"
    | "description"
    | "package"
    | "domain_modules"
    | "entries"
  >
) {
  return {
    schema_version: b.schema_version,
    document: b.document,
    description: b.description,
    package: b.package,
    domain_modules: [...b.domain_modules].sort((a, b) =>
      a.id.localeCompare(b.id)
    ),
    entries: [...b.entries].sort((a, b) => a.id.localeCompare(b.id)),
  }
}

export function synchronizeBusinessGlossarySnapshot(
  input: BusinessGlossarySnapshot,
  options?: { readonly generatedAt?: string }
): BusinessGlossarySnapshot {
  const raw = structuredClone(input) as BusinessGlossarySnapshot

  const existingEnumNames = new Set(
    raw.entries.flatMap((e) =>
      e.technical.artifact_kind === "postgres_enum"
        ? [e.technical.enum_name]
        : []
    )
  )

  const financeMod = {
    id: "finance",
    label: "Finance and inventory",
    summary:
      "Chart of accounts, fiscal periods, posting semantics, valuation, and typed custom fields.",
  }

  if (!raw.domain_modules.some((m) => m.id === "finance")) {
    raw.domain_modules = [...raw.domain_modules, financeMod]
  }

  const newEntries: typeof raw.entries = []
  for (const enumName of STUDIO_PG_ENUM_ALLOWLIST) {
    if (existingEnumNames.has(enumName)) continue
    newEntries.push({
      id: enumName,
      business_primary_term: label(enumName),
      domain_module: domainFor(enumName),
      technical: {
        artifact_kind: "postgres_enum",
        enum_name: enumName,
        drizzle_schema_file: drizzleFile(enumName),
      },
    })
  }

  raw.entries = [...raw.entries, ...newEntries]

  raw.source_content_sha256 = createHash("sha256")
    .update(JSON.stringify(canon(raw)), "utf8")
    .digest("hex")
  raw.generated_at = options?.generatedAt ?? new Date().toISOString()

  return raw
}

export function renderBusinessGlossarySnapshot(
  snapshot: BusinessGlossarySnapshot
): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`
}

function run(): void {
  const raw = JSON.parse(
    readFileSync(snapshotPath, "utf8")
  ) as BusinessGlossarySnapshot
  const next = synchronizeBusinessGlossarySnapshot(raw)

  writeFileSync(snapshotPath, renderBusinessGlossarySnapshot(next))
  console.log(
    `sync-glossary-enums: ${next.entries.length} entries, sha256=${next.source_content_sha256}`
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run()
}
