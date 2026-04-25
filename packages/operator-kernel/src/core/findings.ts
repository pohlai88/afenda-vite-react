export type OperatorFindingSeverity = "error" | "warning"

export interface OperatorFindingRemediation {
  readonly action: string
  readonly command?: string
  readonly doc?: string
}

export interface OperatorFinding {
  readonly severity: OperatorFindingSeverity
  readonly code: string
  readonly message: string
  readonly filePath?: string
  readonly remediation?: OperatorFindingRemediation
}

export interface OperatorFindingResult<
  TFinding extends OperatorFinding = OperatorFinding,
> {
  readonly findings: readonly TFinding[]
  readonly errorCount: number
  readonly warningCount: number
}
