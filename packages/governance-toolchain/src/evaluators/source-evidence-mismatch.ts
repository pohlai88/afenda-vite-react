import type { RepoGuardFinding } from "../contracts/repo-guard.js"
import type {
  SourceEvidenceMismatchGitEntry,
  SourceEvidenceMismatchPolicy,
} from "../contracts/source-evidence-mismatch.js"
import { matchesAnyPathPattern } from "../utils/path-patterns.js"

export function evaluateSourceEvidenceMismatchFindings(options: {
  readonly entries: readonly SourceEvidenceMismatchGitEntry[]
  readonly policy: SourceEvidenceMismatchPolicy
}): readonly RepoGuardFinding[] {
  const findings: RepoGuardFinding[] = []
  const activeEntries = options.entries.filter(
    (entry) =>
      !matchesAnyPathPattern(entry.path, options.policy.ignoredStatusPatterns)
  )

  for (const binding of options.policy.bindings) {
    const sourceEntries = activeEntries.filter((entry) =>
      matchesAnyPathPattern(entry.path, binding.sourcePathPatterns)
    )
    const evidenceEntries = activeEntries.filter((entry) =>
      matchesAnyPathPattern(entry.path, binding.evidencePathPatterns)
    )

    const sourceChanged = sourceEntries.length > 0
    const evidenceChanged = evidenceEntries.length > 0

    if (!sourceChanged && !evidenceChanged) {
      continue
    }

    if (sourceChanged && !evidenceChanged) {
      findings.push({
        severity: "error",
        ruleId: "RG-TRUTH-004",
        message:
          "Bound source changed without refreshing its declared evidence surface.",
        evidence: `binding=${binding.id}; changed-sources=${sourceEntries.map((entry) => entry.path).join(",")}`,
        suggestedFix:
          "Regenerate or refresh the declared evidence surfaces before treating the worktree as truthful.",
      })
      continue
    }

    if (!sourceChanged && evidenceChanged) {
      findings.push({
        severity: "error",
        ruleId: "RG-TRUTH-004",
        message:
          "Evidence surface changed without a matching source-side change in its declared binding.",
        evidence: `binding=${binding.id}; changed-evidence=${evidenceEntries.map((entry) => entry.path).join(",")}`,
        suggestedFix:
          "Restore the evidence file or update the bound sources in the same change set.",
      })
      continue
    }

    const requiredEvidencePaths =
      binding.requiredEvidencePaths ?? binding.evidencePathPatterns
    const changedEvidencePathSet = new Set(
      evidenceEntries.map((entry) => entry.path)
    )
    const missingEvidencePaths = requiredEvidencePaths.filter(
      (evidencePath) => !changedEvidencePathSet.has(evidencePath)
    )

    if (missingEvidencePaths.length > 0) {
      findings.push({
        severity: "error",
        ruleId: "RG-TRUTH-004",
        message:
          "Only part of the declared evidence set was refreshed for a changed source binding.",
        evidence: `binding=${binding.id}; missing-evidence=${missingEvidencePaths.join(",")}`,
        suggestedFix:
          "Refresh the full declared evidence set for the binding so the repo does not enter a partial proof state.",
      })
    }
  }

  return findings
}
