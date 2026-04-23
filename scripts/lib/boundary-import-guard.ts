import fs from "node:fs/promises"
import path from "node:path"

import type { RepoGuardFinding } from "./repo-guard.js"

export interface BoundaryImportRule {
  readonly id: string
  readonly scopeRoot: string
  readonly blockedTargetPrefixes: readonly string[]
  readonly allowedTargetPrefixes?: readonly string[]
  readonly severity: "error" | "warn"
  readonly message: string
}

export interface BoundaryImportPolicy {
  readonly sourceGlobs: readonly string[]
  readonly ignoredFileGlobs: readonly string[]
  readonly globalBlockedImportPatterns: readonly RegExp[]
  readonly globalIgnoredImportPatterns: readonly RegExp[]
  readonly rules: readonly BoundaryImportRule[]
}

export interface ParsedImportRecord {
  readonly importPath: string
  readonly line: number
}

export async function evaluateBoundaryImportFindings(options: {
  readonly repoRoot: string
  readonly filePaths: readonly string[]
  readonly policy: BoundaryImportPolicy
}): Promise<readonly RepoGuardFinding[]> {
  const findings: RepoGuardFinding[] = []

  for (const filePath of options.filePaths) {
    if (!matchesAnyGlob(filePath, options.policy.sourceGlobs)) {
      continue
    }
    if (matchesAnyGlob(filePath, options.policy.ignoredFileGlobs)) {
      continue
    }

    const absolutePath = path.join(options.repoRoot, filePath)
    const source = await fs.readFile(absolutePath, "utf8")
    const imports = parseImportsFromSource(source)

    for (const record of imports) {
      if (
        options.policy.globalIgnoredImportPatterns.some((pattern) =>
          pattern.test(record.importPath)
        )
      ) {
        continue
      }

      if (
        options.policy.globalBlockedImportPatterns.some((pattern) =>
          pattern.test(record.importPath)
        )
      ) {
        findings.push({
          severity: "error",
          ruleId: "RG-STRUCT-003",
          filePath,
          message:
            "Import path crosses a forbidden workspace-private or machine-noise boundary.",
          evidence: `line=${String(record.line)}; import=${record.importPath}`,
          suggestedFix:
            "Import through a public package/app surface instead of a private filesystem path.",
        })
        continue
      }

      const normalizedTarget = normalizeImportTarget(
        filePath,
        record.importPath
      )
      if (!normalizedTarget) {
        continue
      }

      const applicableRules = options.policy.rules.filter(
        (rule) =>
          filePath === rule.scopeRoot ||
          filePath.startsWith(`${rule.scopeRoot}/`)
      )

      for (const rule of applicableRules) {
        if (
          rule.allowedTargetPrefixes?.some(
            (prefix) =>
              normalizedTarget === prefix ||
              normalizedTarget.startsWith(`${prefix}/`)
          )
        ) {
          continue
        }

        if (
          rule.blockedTargetPrefixes.some(
            (prefix) =>
              normalizedTarget === prefix ||
              normalizedTarget.startsWith(`${prefix}/`)
          )
        ) {
          findings.push({
            severity: rule.severity,
            ruleId: rule.id,
            filePath,
            message: rule.message,
            evidence: `line=${String(record.line)}; import=${record.importPath}; target=${normalizedTarget}`,
            suggestedFix:
              "Depend on an allowed public surface or move the code into the owning domain.",
          })
        }
      }
    }
  }

  return findings
}

export function parseImportsFromSource(
  source: string
): readonly ParsedImportRecord[] {
  const imports: ParsedImportRecord[] = []
  const lines = source.split(/\r?\n/u)
  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[^"'`]+?\s+from\s+)?["']([^"']+)["']/gu,
    /\bexport\s+[^"'`]*?\sfrom\s+["']([^"']+)["']/gu,
    /\bimport\(\s*["']([^"']+)["']\s*\)/gu,
  ]

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? ""
    for (const pattern of patterns) {
      pattern.lastIndex = 0
      for (const match of line.matchAll(pattern)) {
        const importPath = match[1]?.trim()
        if (!importPath) {
          continue
        }
        imports.push({
          importPath,
          line: index + 1,
        })
      }
    }
  }

  return imports
}

export function normalizeImportTarget(
  importerPath: string,
  importPath: string
): string | null {
  if (importPath.startsWith("@/")) {
    return `apps/web/src/${importPath.slice(2)}`
  }

  if (importPath.startsWith("@afenda/")) {
    return importPath
  }

  if (!importPath.startsWith(".")) {
    return null
  }

  const importerDirectory = path.posix.dirname(
    importerPath.replace(/\\/gu, "/")
  )
  const resolved = path.posix.normalize(
    path.posix.join(importerDirectory, importPath)
  )
  return resolved.startsWith("../") ? null : resolved
}

function matchesAnyGlob(
  filePath: string,
  patterns: readonly string[]
): boolean {
  return patterns.some((pattern) => path.matchesGlob(filePath, pattern))
}
