import path from "node:path"

import type { RepoGuardFinding } from "../contracts/repo-guard.js"
import type {
  RepoGuardDirtyFilePolicy,
  RepoGuardWorkingTreePolicy,
  RepoGuardWorktreeEntry,
} from "../contracts/repo-guard-worktree.js"
import type { RepoGuardMode } from "../status/status.js"
import { matchesAnyPathPattern } from "../utils/path-patterns.js"

export function evaluateDirtyFileCandidates(
  filePaths: readonly string[],
  policy: RepoGuardDirtyFilePolicy
): readonly RepoGuardFinding[] {
  const findings: RepoGuardFinding[] = []

  for (const filePath of filePaths) {
    if (isIgnoredByPolicy(filePath, policy)) {
      continue
    }

    const lowerPath = filePath.toLowerCase()
    const fileName = path.basename(lowerPath)
    const stem = fileName.replace(/\.[^.]+$/u, "")
    const stemParts = stem.split(/[-_.\s]+/u).filter(Boolean)
    const edgeTokens = new Set(
      [stemParts.at(0), stemParts.at(-1)].filter((value): value is string =>
        Boolean(value)
      )
    )

    if (
      policy.highConfidenceBackupPatterns.some((pattern) =>
        pattern.test(lowerPath)
      )
    ) {
      findings.push({
        severity: "error",
        ruleId: "DIRTY-FILE-001",
        filePath,
        message: "High-confidence backup or temp artifact detected.",
        suggestedFix:
          "Delete or rename the file to its canonical tracked form.",
      })
      continue
    }

    if (policy.warnStemTokens.some((token) => edgeTokens.has(token))) {
      findings.push({
        severity: "warn",
        ruleId: "DIRTY-FILE-002",
        filePath,
        message:
          "Suspicious filename token detected; this looks like temporary or duplicate content.",
        suggestedFix:
          "Rename to a canonical subject or remove the stray artifact.",
      })
    }
  }

  return findings
}

export function evaluateWorkingTreeFindings(
  entries: readonly RepoGuardWorktreeEntry[],
  policy: RepoGuardWorkingTreePolicy & RepoGuardDirtyFilePolicy,
  mode: RepoGuardMode
): readonly RepoGuardFinding[] {
  const findings: RepoGuardFinding[] = []

  for (const entry of entries) {
    if (policy.ignoredWorkingTreePaths.includes(entry.path)) {
      continue
    }

    if (entry.untracked) {
      const suspicious = evaluateDirtyFileCandidates([entry.path], policy)
      if (suspicious.length > 0) {
        findings.push(
          ...suspicious.map((finding) => ({
            ...finding,
            ruleId: "WORKTREE-001",
            message: `Suspicious untracked file detected. ${finding.message}`,
          }))
        )
      }
      continue
    }

    if (
      entry.modifiedTracked &&
      matchesAnyPathPattern(entry.path, policy.protectedGeneratedPaths)
    ) {
      findings.push({
        severity: "error",
        ruleId: "WORKTREE-002",
        filePath: entry.path,
        message: "Protected generated surface is modified in the working tree.",
        suggestedFix:
          "Regenerate the surface from its canonical source or restore it.",
      })
      continue
    }

    if (mode === "human" && entry.modifiedTracked) {
      findings.push({
        severity: "warn",
        ruleId: "WORKTREE-003",
        filePath: entry.path,
        message: "Tracked file is modified in the working tree.",
      })
    }
  }

  return findings
}

function isIgnoredByPolicy(
  filePath: string,
  policy: RepoGuardDirtyFilePolicy
): boolean {
  return (
    matchesAnyPathPattern(filePath, policy.machineNoiseExcludePatterns) ||
    matchesAnyPathPattern(filePath, policy.protectedGeneratedPaths)
  )
}
