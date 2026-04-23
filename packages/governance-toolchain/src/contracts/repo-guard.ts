import type { RepoGuardMode, RepoGuardStatus } from "../status/status.js"
import type { RepoGuardWaiverReport } from "./repo-guard-waivers.js"

export interface RepoGuardFinding {
  readonly severity: "info" | "warn" | "error"
  readonly ruleId: string
  readonly message: string
  readonly filePath?: string
  readonly evidence?: string
  readonly suggestedFix?: string
  readonly waived?: boolean
}

export interface RepoGuardCheckResult {
  readonly key: string
  readonly title: string
  readonly status: RepoGuardStatus
  readonly source: "adapter" | "native"
  readonly findings: readonly RepoGuardFinding[]
}

export type RepoGuardCoverageStatus = "implemented" | "partial" | "missing"

export interface RepoGuardCoverageEntry {
  readonly id: string
  readonly title: string
  readonly area: "foundation" | "guardrail"
  readonly status: RepoGuardCoverageStatus
  readonly owner: string
  readonly enforcement: "blocking" | "warned" | "advisory"
  readonly checkKeys: readonly string[]
  readonly evidence: readonly string[]
  readonly notes: string
}

export interface RepoGuardCoverageSummary {
  readonly implementedCount: number
  readonly partialCount: number
  readonly missingCount: number
  readonly entries: readonly RepoGuardCoverageEntry[]
}

export interface RepoGuardContractBinding {
  readonly adr: "ADR-0008"
  readonly atc: "ATC-0005"
  readonly status: "bound"
}

export interface RepoGuardReport {
  readonly status: RepoGuardStatus
  readonly mode: RepoGuardMode
  readonly generatedAt: string
  readonly contractBinding: RepoGuardContractBinding
  readonly waivers: RepoGuardWaiverReport
  readonly checks: readonly RepoGuardCheckResult[]
  readonly coverage: RepoGuardCoverageSummary
  readonly summary: {
    readonly passCount: number
    readonly warnCount: number
    readonly failCount: number
    readonly findingCount: number
  }
}

export interface RepoGuardCliResult {
  readonly report: RepoGuardReport
  readonly exitCode: number
  readonly humanOutput: string
}
