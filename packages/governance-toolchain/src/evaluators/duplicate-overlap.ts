import path from "node:path"

import type { RepoGuardFinding } from "../contracts/repo-guard.js"
import type { DuplicateOverlapPolicy } from "../contracts/duplicate-overlap.js"
import { matchesAnyPathPattern } from "../utils/path-patterns.js"

export function evaluateDuplicateOverlapFindings(options: {
  readonly filePaths: readonly string[]
  readonly policy: DuplicateOverlapPolicy
}): readonly RepoGuardFinding[] {
  const findings: RepoGuardFinding[] = []
  const trackedFiles = options.filePaths.filter(
    (filePath) =>
      !matchesAnyPathPattern(filePath, options.policy.ignoredPathPatterns)
  )

  for (const filePath of trackedFiles) {
    const basename = path.basename(filePath)
    const stem = path.basename(filePath, path.extname(filePath))

    if (
      options.policy.suspiciousVariantPatterns.some((pattern) =>
        pattern.test(stem)
      )
    ) {
      findings.push({
        severity: "warn",
        ruleId: "RG-HYGIENE-005",
        filePath,
        message:
          "Tracked file name looks like a duplicate or temporary variant rather than a canonical artifact.",
        evidence: `basename=${basename}`,
        suggestedFix:
          "Rename to the canonical subject or remove the overlapping variant if it no longer serves a distinct purpose.",
      })
    }
  }

  for (const scope of options.policy.scopes) {
    const scopeFiles = trackedFiles.filter((filePath) =>
      matchesAnyPathPattern(filePath, scope.fileGlobs)
    )
    const grouped = new Map<string, string[]>()

    for (const filePath of scopeFiles) {
      const base = path.basename(filePath, path.extname(filePath)).toLowerCase()
      if (scope.ignoredBasenames.includes(base)) {
        continue
      }

      const existing = grouped.get(base)
      if (existing) {
        existing.push(filePath)
      } else {
        grouped.set(base, [filePath])
      }
    }

    for (const [base, paths] of grouped) {
      if (paths.length < 2) {
        continue
      }

      findings.push({
        severity: "warn",
        ruleId: "RG-HYGIENE-005",
        filePath: paths[0],
        message:
          "Multiple governed files share the same basename inside a duplicate-sensitive surface.",
        evidence: `scope=${scope.id}; basename=${base}; related=${paths.join(",")}`,
        suggestedFix:
          "Give each governed file a distinct subject name, or consolidate overlapping artifacts if they serve the same purpose.",
      })
    }
  }

  return findings
}
