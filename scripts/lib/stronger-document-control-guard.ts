import fs from "node:fs/promises"
import path from "node:path"

import type { RepoGuardFinding } from "./repo-guard.js"

export interface DocumentControlScope {
  readonly id: string
  readonly fileGlobs: readonly string[]
  readonly requiredFrontmatterKeys: readonly string[]
  readonly requiredContentPatterns: readonly string[]
  readonly forbiddenContentPatterns?: readonly string[]
  readonly forbiddenContentSeverity?: "warn" | "error"
}

export interface DocumentControlPolicy {
  readonly ignoredPathPatterns: readonly string[]
  readonly scopes: readonly DocumentControlScope[]
}

export interface ParsedFrontmatter {
  readonly present: boolean
  readonly fields: Readonly<Record<string, string>>
}

export async function evaluateStrongerDocumentControlFindings(options: {
  readonly repoRoot: string
  readonly filePaths: readonly string[]
  readonly policy: DocumentControlPolicy
}): Promise<readonly RepoGuardFinding[]> {
  const findings: RepoGuardFinding[] = []

  for (const filePath of options.filePaths) {
    if (matchesAnyPathPattern(filePath, options.policy.ignoredPathPatterns)) {
      continue
    }

    const scope = options.policy.scopes.find((candidate) =>
      matchesAnyPathPattern(filePath, candidate.fileGlobs)
    )
    if (!scope) {
      continue
    }

    const absolutePath = path.join(options.repoRoot, filePath)
    const content = await fs.readFile(absolutePath, "utf8")
    const frontmatter = parseFrontmatter(content)

    if (!frontmatter.present && scope.requiredFrontmatterKeys.length > 0) {
      findings.push({
        severity: "warn",
        ruleId: "RG-ADVISORY-006",
        filePath,
        message:
          "Governed document is missing frontmatter, which weakens document classification and control-plane traceability.",
        evidence: `scope=${scope.id}`,
        suggestedFix:
          "Add canonical frontmatter with the required governance metadata fields for this document class.",
      })
      continue
    }

    const missingKeys = scope.requiredFrontmatterKeys.filter(
      (key) => !(key in frontmatter.fields)
    )
    if (missingKeys.length > 0) {
      findings.push({
        severity: "warn",
        ruleId: "RG-ADVISORY-006",
        filePath,
        message:
          "Governed document frontmatter is missing required governance metadata fields.",
        evidence: `scope=${scope.id}; missing-frontmatter=${missingKeys.join(",")}`,
        suggestedFix:
          "Add the missing frontmatter keys so the document remains classifiable and governable.",
      })
    }

    const missingPatterns = scope.requiredContentPatterns.filter(
      (pattern) => !content.includes(pattern)
    )
    if (missingPatterns.length > 0) {
      findings.push({
        severity: "warn",
        ruleId: "RG-ADVISORY-006",
        filePath,
        message:
          "Governed document is missing expected contract/linkage markers for its document class.",
        evidence: `scope=${scope.id}; missing-patterns=${missingPatterns.join(",")}`,
        suggestedFix:
          "Restore the expected architecture or governance linkage markers for this document class.",
      })
    }

    const forbiddenPatterns = scope.forbiddenContentPatterns ?? []
    const matchedForbiddenPatterns = forbiddenPatterns.filter((pattern) =>
      content.includes(pattern)
    )

    if (matchedForbiddenPatterns.length > 0) {
      findings.push({
        severity: scope.forbiddenContentSeverity ?? "error",
        ruleId: "RG-TRUTH-005",
        filePath,
        message:
          "Governed document contains retired or forbidden contract language for its active surface.",
        evidence: `scope=${scope.id}; forbidden-patterns=${matchedForbiddenPatterns.join(",")}`,
        suggestedFix:
          "Replace the retired wording with the current live contract or generated surface guidance.",
      })
    }
  }

  return findings
}

export function parseFrontmatter(content: string): ParsedFrontmatter {
  const normalized = content.replace(/\r\n/gu, "\n")
  if (!normalized.startsWith("---\n")) {
    return {
      present: false,
      fields: {},
    }
  }

  const closingIndex = normalized.indexOf("\n---\n", 4)
  if (closingIndex === -1) {
    return {
      present: false,
      fields: {},
    }
  }

  const block = normalized.slice(4, closingIndex)
  const fields: Record<string, string> = {}

  for (const line of block.split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/u)
    if (!match) {
      continue
    }
    fields[match[1]] = match[2]
  }

  return {
    present: true,
    fields,
  }
}

function matchesAnyPathPattern(
  filePath: string,
  patterns: readonly string[]
): boolean {
  return patterns.some((pattern) => path.matchesGlob(filePath, pattern))
}
