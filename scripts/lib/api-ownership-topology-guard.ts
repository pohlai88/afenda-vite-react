import type { RepoGuardFinding } from "@afenda/governance-toolchain"

export interface ApiOwnershipTopologyPolicy {
  readonly governedRoot: string
  readonly forbiddenTopLevelBuckets: readonly string[]
  readonly ruleId: string
  readonly severity: "warn" | "error"
  readonly message: string
  readonly suggestedFix?: string
}

export function evaluateApiOwnershipTopologyFindings(options: {
  readonly filePaths: readonly string[]
  readonly policy: ApiOwnershipTopologyPolicy
}): readonly RepoGuardFinding[] {
  const findings: RepoGuardFinding[] = []
  const governedRootPrefix = `${options.policy.governedRoot}/`
  const forbiddenBuckets = new Set(options.policy.forbiddenTopLevelBuckets)

  for (const filePath of options.filePaths) {
    if (!filePath.startsWith(governedRootPrefix)) {
      continue
    }

    const relativePath = filePath.slice(governedRootPrefix.length)
    const topLevelBucket = relativePath.split("/")[0]

    if (!topLevelBucket || !forbiddenBuckets.has(topLevelBucket)) {
      continue
    }

    findings.push({
      severity: options.policy.severity,
      ruleId: options.policy.ruleId,
      filePath,
      message: `${filePath} is placed under forbidden API function bucket "${topLevelBucket}/". ${options.policy.message}`,
      suggestedFix: options.policy.suggestedFix,
    })
  }

  return findings
}
