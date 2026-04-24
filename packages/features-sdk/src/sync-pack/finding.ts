export const syncPackFindingContractId = "FSDK-FINDING-001" as const

export type SyncPackFindingSeverity = "error" | "warning"

export interface SyncPackFindingRemediation {
  readonly action: string
  readonly command?: string
  readonly doc?: string
}

export interface SyncPackFinding {
  readonly severity: SyncPackFindingSeverity
  readonly code: string
  readonly message: string
  readonly filePath?: string
  readonly remediation?: SyncPackFindingRemediation
}

export interface SyncPackFindingResult<
  TFinding extends SyncPackFinding = SyncPackFinding,
> {
  readonly findings: readonly TFinding[]
  readonly errorCount: number
  readonly warningCount: number
}

export function createFindingRemediation(
  action: string,
  options: {
    readonly command?: string
    readonly doc?: string
  } = {}
): SyncPackFindingRemediation {
  return {
    action,
    command: options.command,
    doc: options.doc,
  }
}

export function countFindings(
  findings: readonly Pick<SyncPackFinding, "severity">[]
): Pick<SyncPackFindingResult, "errorCount" | "warningCount"> {
  return {
    errorCount: findings.filter((finding) => finding.severity === "error")
      .length,
    warningCount: findings.filter((finding) => finding.severity === "warning")
      .length,
  }
}
