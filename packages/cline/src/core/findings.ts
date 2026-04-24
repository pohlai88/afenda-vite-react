export type ClineFindingSeverity = "error" | "warning"

export interface ClineFindingRemediation {
  readonly action: string
  readonly command?: string
  readonly doc?: string
}

export interface ClineFinding {
  readonly severity: ClineFindingSeverity
  readonly code: string
  readonly message: string
  readonly filePath?: string
  readonly remediation?: ClineFindingRemediation
}

export interface ClineFindingResult<
  TFinding extends ClineFinding = ClineFinding,
> {
  readonly findings: readonly TFinding[]
  readonly errorCount: number
  readonly warningCount: number
}
