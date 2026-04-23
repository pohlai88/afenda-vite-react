import { createHash } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

import { loadAfendaConfig } from "../afenda-config.js"
import type { RepoGuardFinding } from "./repo-guard.js"
import type { GovernanceAggregateReport } from "./governance-spine.js"
import type { BusinessGlossarySnapshot } from "../../packages/_database/src/studio/business-glossary.schema.js"
import { generateGovernanceArtifacts } from "../../packages/design-system/scripts/component-governance/core.js"
import {
  buildSchemaInventoryPayload,
  renderSchemaInventoryPayload,
} from "../../packages/_database/scripts/sync-schema-inventory.js"
import {
  renderBusinessGlossarySnapshot,
  synchronizeBusinessGlossarySnapshot,
} from "../../packages/_database/scripts/sync-glossary-enums.js"
import {
  buildGovernanceRegisterSnapshot,
  renderGovernanceRegisterMarkdown,
} from "./governance-spine.js"

export interface GeneratedAuthenticityOrphanRoot {
  readonly root: string
  readonly allowedGeneratedPaths: readonly string[]
}

export interface GeneratedAuthenticityHashManifestBinding {
  readonly id: string
  readonly kind: "hash-manifest"
  readonly targetPath: string
  readonly requiredSources: readonly string[]
  readonly expectedGeneratedHash: string
  readonly expectedSourceHash: string
}

export interface GeneratedAuthenticityGovernanceRegisterMarkdownBinding {
  readonly id: string
  readonly kind: "governance-register-markdown"
  readonly targetPath: string
  readonly requiredSources: readonly string[]
}

export interface GeneratedAuthenticityGovernanceRegisterSnapshotBinding {
  readonly id: string
  readonly kind: "governance-register-snapshot"
  readonly targetPath: string
  readonly requiredSources: readonly string[]
}

export interface GeneratedAuthenticityDesignSystemComponentGovernanceBinding {
  readonly id: string
  readonly kind: "design-system-component-governance"
  readonly targetPath: string
  readonly requiredSources: readonly string[]
  readonly artifact: "manifests" | "variants" | "coverage"
}

export interface GeneratedAuthenticityDatabaseSchemaInventoryBinding {
  readonly id: string
  readonly kind: "database-schema-inventory"
  readonly targetPath: string
  readonly requiredSources: readonly string[]
}

export interface GeneratedAuthenticityDatabaseGlossarySnapshotBinding {
  readonly id: string
  readonly kind: "database-glossary-snapshot"
  readonly targetPath: string
  readonly requiredSources: readonly string[]
}

export type GeneratedAuthenticityBinding =
  | GeneratedAuthenticityHashManifestBinding
  | GeneratedAuthenticityGovernanceRegisterMarkdownBinding
  | GeneratedAuthenticityGovernanceRegisterSnapshotBinding
  | GeneratedAuthenticityDesignSystemComponentGovernanceBinding
  | GeneratedAuthenticityDatabaseSchemaInventoryBinding
  | GeneratedAuthenticityDatabaseGlossarySnapshotBinding

export interface GeneratedAuthenticityPolicy {
  readonly bindings: readonly GeneratedAuthenticityBinding[]
  readonly orphanRoots: readonly GeneratedAuthenticityOrphanRoot[]
}

export async function evaluateGeneratedArtifactAuthenticityFindings(options: {
  readonly repoRoot: string
  readonly trackedFiles: readonly string[]
  readonly policy: GeneratedAuthenticityPolicy
}): Promise<readonly RepoGuardFinding[]> {
  const findings: RepoGuardFinding[] = []
  const bindingTargetSet = new Set(
    options.policy.bindings.map((binding) => binding.targetPath)
  )

  for (const binding of options.policy.bindings) {
    findings.push(
      ...(await evaluateGeneratedAuthenticityBinding({
        repoRoot: options.repoRoot,
        binding,
      }))
    )
  }

  for (const orphanRoot of options.policy.orphanRoots) {
    const rootFiles = options.trackedFiles.filter(
      (filePath) =>
        filePath === orphanRoot.root ||
        filePath.startsWith(`${orphanRoot.root}/`)
    )

    for (const filePath of rootFiles) {
      if (
        orphanRoot.allowedGeneratedPaths.includes(filePath) ||
        bindingTargetSet.has(filePath)
      ) {
        continue
      }

      findings.push({
        severity: "error",
        ruleId: "RG-TRUTH-002",
        filePath,
        message:
          "Generated artifact exists under a guarded generated root without an authenticity binding or allowlist entry.",
        evidence: `orphan-root=${orphanRoot.root}`,
        suggestedFix:
          "Add an authenticity binding, allowlist the file explicitly, or remove the orphan generated artifact.",
      })
    }
  }

  return findings
}

export async function evaluateGeneratedAuthenticityBinding(options: {
  readonly repoRoot: string
  readonly binding: GeneratedAuthenticityBinding
}): Promise<readonly RepoGuardFinding[]> {
  const findings: RepoGuardFinding[] = []
  const targetAbsolutePath = path.join(
    options.repoRoot,
    options.binding.targetPath
  )

  const targetExists = await fileExists(targetAbsolutePath)
  if (!targetExists) {
    findings.push({
      severity: "error",
      ruleId: "RG-TRUTH-002",
      filePath: options.binding.targetPath,
      message: "Bound generated artifact is missing.",
      evidence: `binding=${options.binding.id}`,
      suggestedFix:
        "Regenerate the artifact from its canonical source and keep the binding current.",
    })
    return findings
  }

  for (const sourcePath of options.binding.requiredSources) {
    const sourceAbsolutePath = path.join(options.repoRoot, sourcePath)
    if (!(await fileExists(sourceAbsolutePath))) {
      findings.push({
        severity: "error",
        ruleId: "RG-TRUTH-002",
        filePath: options.binding.targetPath,
        message:
          "Generated artifact authenticity binding points to a missing provenance source.",
        evidence: `binding=${options.binding.id}; missing-source=${sourcePath}`,
        suggestedFix:
          "Restore the declared source path or correct the authenticity binding.",
      })
    }
  }

  if (findings.length > 0) {
    return findings
  }

  if (options.binding.kind === "hash-manifest") {
    const sourceHash = await computeCombinedContentHash(
      options.repoRoot,
      options.binding.requiredSources
    )
    const generatedHash = await computeFileHash(
      path.join(options.repoRoot, options.binding.targetPath)
    )

    if (sourceHash !== options.binding.expectedSourceHash) {
      findings.push({
        severity: "error",
        ruleId: "RG-TRUTH-002",
        filePath: options.binding.targetPath,
        message:
          "Generated artifact sources have changed since the authenticity manifest was last refreshed.",
        evidence: `binding=${options.binding.id}; expected-source-hash=${options.binding.expectedSourceHash}; actual-source-hash=${sourceHash}`,
        suggestedFix:
          "Refresh the authenticity manifest after regenerating the bound artifact.",
      })
    }

    if (generatedHash !== options.binding.expectedGeneratedHash) {
      findings.push({
        severity: "error",
        ruleId: "RG-TRUTH-002",
        filePath: options.binding.targetPath,
        message:
          "Generated artifact content does not match the bound authenticity manifest.",
        evidence: `binding=${options.binding.id}; expected-generated-hash=${options.binding.expectedGeneratedHash}; actual-generated-hash=${generatedHash}`,
        suggestedFix:
          "Regenerate the artifact or refresh the authenticity manifest if the canonical output changed intentionally.",
      })
    }

    return findings
  }

  if (options.binding.kind === "database-schema-inventory") {
    const actualContent = await fs.readFile(targetAbsolutePath, "utf8")
    const actualPayload = JSON.parse(actualContent) as { generatedAt?: string }
    const expectedContent = renderSchemaInventoryPayload(
      buildSchemaInventoryPayload(actualPayload.generatedAt)
    )

    if (
      normalizeGeneratedContent(actualContent) !==
      normalizeGeneratedContent(expectedContent)
    ) {
      findings.push({
        severity: "error",
        ruleId: "RG-TRUTH-002",
        filePath: options.binding.targetPath,
        message:
          "Database schema inventory does not match the canonical inventory builder for its declared provenance.",
        evidence: `binding=${options.binding.id}`,
        suggestedFix:
          "Regenerate the schema inventory from its canonical source set or correct the provenance declaration.",
      })
    }

    return findings
  }

  if (options.binding.kind === "database-glossary-snapshot") {
    const actualContent = await fs.readFile(targetAbsolutePath, "utf8")
    const actualSnapshot = JSON.parse(actualContent) as BusinessGlossarySnapshot
    const expectedContent = renderBusinessGlossarySnapshot(
      synchronizeBusinessGlossarySnapshot(actualSnapshot, {
        generatedAt: actualSnapshot.generated_at,
      })
    )

    if (
      normalizeGeneratedContent(actualContent) !==
      normalizeGeneratedContent(expectedContent)
    ) {
      findings.push({
        severity: "error",
        ruleId: "RG-TRUTH-002",
        filePath: options.binding.targetPath,
        message:
          "Database business glossary snapshot does not match the canonical enum-synchronization result for its declared provenance.",
        evidence: `binding=${options.binding.id}`,
        suggestedFix:
          "Run the glossary enum synchronizer or correct the provenance declaration for this snapshot.",
      })
    }

    return findings
  }

  const expectedContent = await renderBoundGeneratedArtifact({
    repoRoot: options.repoRoot,
    binding: options.binding,
  })
  const actualContent = await fs.readFile(targetAbsolutePath, "utf8")

  if (
    normalizeGeneratedContent(actualContent) !==
    normalizeGeneratedContent(expectedContent)
  ) {
    findings.push({
      severity: "error",
      ruleId: "RG-TRUTH-002",
      filePath: options.binding.targetPath,
      message:
        "Generated artifact content does not match the canonical renderer for its declared provenance.",
      evidence: `binding=${options.binding.id}`,
      suggestedFix:
        "Regenerate the artifact from its bound renderer or correct the provenance declaration.",
    })
  }

  return findings
}

export async function renderBoundGeneratedArtifact(options: {
  readonly repoRoot: string
  readonly binding:
    | GeneratedAuthenticityGovernanceRegisterMarkdownBinding
    | GeneratedAuthenticityGovernanceRegisterSnapshotBinding
    | GeneratedAuthenticityDesignSystemComponentGovernanceBinding
}): Promise<string> {
  if (options.binding.kind === "design-system-component-governance") {
    const result = await generateGovernanceArtifacts({ write: false })
    return withTrailingNewline(result.texts[options.binding.artifact])
  }

  const config = await loadAfendaConfig()
  const aggregateReportPath = path.join(
    options.repoRoot,
    config.governance.evidence.aggregateReportPath
  )
  const aggregateReport = JSON.parse(
    await fs.readFile(aggregateReportPath, "utf8")
  ) as GovernanceAggregateReport

  if (options.binding.kind === "governance-register-markdown") {
    return withTrailingNewline(
      renderGovernanceRegisterMarkdown(config, aggregateReport)
    )
  }

  return withTrailingNewline(
    JSON.stringify(
      buildGovernanceRegisterSnapshot(config, aggregateReport),
      null,
      2
    )
  )
}

export async function computeFileHash(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath)
  return createHash("sha256").update(buffer).digest("hex")
}

export async function computeCombinedContentHash(
  repoRoot: string,
  relativePaths: readonly string[]
): Promise<string> {
  const hash = createHash("sha256")

  for (const relativePath of [...relativePaths].sort((left, right) =>
    left.localeCompare(right)
  )) {
    const filePath = path.join(repoRoot, relativePath)
    const content = await fs.readFile(filePath)
    hash.update(relativePath)
    hash.update("\n")
    hash.update(content)
    hash.update("\n")
  }

  return hash.digest("hex")
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath)
    return true
  } catch {
    return false
  }
}

function normalizeGeneratedContent(content: string): string {
  return content.endsWith("\n") ? content : `${content}\n`
}

function withTrailingNewline(content: string): string {
  return content.endsWith("\n") ? content : `${content}\n`
}
