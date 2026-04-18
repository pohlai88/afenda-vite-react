/**
 * Shared YAML → validated snapshot payload (for tests and future YAML sources under docs/data/).
 * Node-only (crypto, child_process); not for browser bundles.
 */
import { execSync } from "node:child_process"
import { createHash } from "node:crypto"
import { parse } from "yaml"

import {
  businessGlossaryBodySchema,
  businessGlossarySnapshotSchema,
  type BusinessGlossaryBody,
  type BusinessGlossarySnapshot,
} from "./business-glossary.schema"
import {
  truthGovernanceBodySchema,
  truthGovernanceSnapshotSchema,
  type TruthGovernanceBody,
  type TruthGovernanceSnapshot,
} from "./truth-governance.schema"

export function sha256Hex(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex")
}

export function tryGitHead(repoRoot: string): string | null {
  try {
    const out = execSync("git rev-parse HEAD", {
      encoding: "utf8",
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
    return /^[a-f0-9]{7,40}$/i.test(out) ? out : null
  } catch {
    return null
  }
}

export function envelopeFields(
  yamlUtf8: string,
  repoRoot: string
): {
  readonly generated_at: string
  readonly source_commit: string | null
  readonly source_content_sha256: string
} {
  return {
    generated_at: new Date().toISOString(),
    source_commit: tryGitHead(repoRoot),
    source_content_sha256: sha256Hex(yamlUtf8),
  }
}

export function canonicalizeBusinessGlossaryBody(
  body: BusinessGlossaryBody
): BusinessGlossaryBody {
  return {
    ...body,
    domain_modules: [...body.domain_modules].sort((a, b) =>
      a.id.localeCompare(b.id)
    ),
    entries: [...body.entries].sort((a, b) => a.id.localeCompare(b.id)),
  }
}

export function canonicalizeTruthGovernanceBody(
  body: TruthGovernanceBody
): TruthGovernanceBody {
  return {
    ...body,
    truth_classes: [...body.truth_classes].sort((a, b) =>
      a.id.localeCompare(b.id)
    ),
    scope_models: [...body.scope_models].sort((a, b) =>
      a.id.localeCompare(b.id)
    ),
    time_models: [...body.time_models].sort((a, b) => a.id.localeCompare(b.id)),
    artifact_bindings: [...body.artifact_bindings].sort((a, b) =>
      a.id.localeCompare(b.id)
    ),
  }
}

export function buildBusinessGlossarySnapshotFromYaml(
  glossaryYamlUtf8: string,
  repoRoot: string
): BusinessGlossarySnapshot {
  const parsed = parse(glossaryYamlUtf8) as unknown
  const body = canonicalizeBusinessGlossaryBody(
    businessGlossaryBodySchema.parse(parsed)
  )
  return businessGlossarySnapshotSchema.parse({
    document_kind: "business_glossary_snapshot",
    ...envelopeFields(glossaryYamlUtf8, repoRoot),
    ...body,
  })
}

export function buildTruthGovernanceSnapshotFromYaml(
  governanceYamlUtf8: string,
  repoRoot: string
): TruthGovernanceSnapshot {
  const parsed = parse(governanceYamlUtf8) as unknown
  const body = canonicalizeTruthGovernanceBody(
    truthGovernanceBodySchema.parse(parsed)
  )
  return truthGovernanceSnapshotSchema.parse({
    document_kind: "database_truth_governance_snapshot",
    ...envelopeFields(governanceYamlUtf8, repoRoot),
    ...body,
  })
}

function glossaryBodyFromSnapshot(
  s: BusinessGlossarySnapshot
): BusinessGlossaryBody {
  return {
    schema_version: s.schema_version,
    document: s.document,
    description: s.description,
    package: s.package,
    domain_modules: s.domain_modules,
    entries: s.entries,
  }
}

function truthBodyFromSnapshot(
  s: TruthGovernanceSnapshot
): TruthGovernanceBody {
  return {
    schema_version: s.schema_version,
    document: s.document,
    description: s.description,
    package: s.package,
    truth_classes: s.truth_classes,
    scope_models: s.scope_models,
    time_models: s.time_models,
    artifact_bindings: s.artifact_bindings,
  }
}

/** Compare committed snapshot body + content hash to YAML (ignores envelope timestamps). */
export function assertGlossarySnapshotMatchesYaml(args: {
  readonly glossaryYamlUtf8: string
  readonly snapshotJsonUtf8: string
}): void {
  const expectedBody = canonicalizeBusinessGlossaryBody(
    businessGlossaryBodySchema.parse(parse(args.glossaryYamlUtf8) as unknown)
  )
  const snapshot = businessGlossarySnapshotSchema.parse(
    JSON.parse(args.snapshotJsonUtf8) as unknown
  )
  const expectedHash = sha256Hex(args.glossaryYamlUtf8)
  if (snapshot.source_content_sha256 !== expectedHash) {
    throw new Error(
      `business-glossary.snapshot.json source_content_sha256 does not match current business-technical-glossary.yaml (reconcile JSON with YAML or update the snapshot intentionally)`
    )
  }
  const a = JSON.stringify(
    canonicalizeBusinessGlossaryBody(glossaryBodyFromSnapshot(snapshot))
  )
  const b = JSON.stringify(expectedBody)
  if (a !== b) {
    throw new Error(
      `business-glossary.snapshot.json body out of sync with business-technical-glossary.yaml (reconcile JSON with YAML or update the snapshot intentionally)`
    )
  }
}

export function assertTruthGovernanceSnapshotMatchesYaml(args: {
  readonly governanceYamlUtf8: string
  readonly snapshotJsonUtf8: string
}): void {
  const expectedBody = canonicalizeTruthGovernanceBody(
    truthGovernanceBodySchema.parse(parse(args.governanceYamlUtf8) as unknown)
  )
  const snapshot = truthGovernanceSnapshotSchema.parse(
    JSON.parse(args.snapshotJsonUtf8) as unknown
  )
  const expectedHash = sha256Hex(args.governanceYamlUtf8)
  if (snapshot.source_content_sha256 !== expectedHash) {
    throw new Error(
      `database-truth-governance.snapshot.json source_content_sha256 does not match current database-truth-governance.yaml (reconcile JSON with YAML or update the snapshot intentionally)`
    )
  }
  const a = JSON.stringify(
    canonicalizeTruthGovernanceBody(truthBodyFromSnapshot(snapshot))
  )
  const b = JSON.stringify(expectedBody)
  if (a !== b) {
    throw new Error(
      `database-truth-governance.snapshot.json body out of sync with database-truth-governance.yaml (reconcile JSON with YAML or update the snapshot intentionally)`
    )
  }
}
