import {
  checkGeneratedPacks,
  type SyncPackCheckFinding,
} from "../check/pack-check.js"
import {
  createFindingRemediation,
  countFindings,
  type SyncPackFinding,
  type SyncPackFindingResult,
  type SyncPackFindingSeverity,
} from "../finding.js"
import {
  runSyncPackDoctor,
  type SyncPackDoctorFinding,
} from "../doctor/stack-doctor.js"
import {
  checkFeatureSdkPackageContract,
  type FeatureSdkPackageContractFinding,
} from "../package-contract.js"
import { runSyncPackValidate } from "../validate/index.js"

export type SyncPackVerifyStepName =
  | "release-check"
  | "check"
  | "doctor"
  | "validate"

export type SyncPackVerifySeverity = SyncPackFindingSeverity
export type SyncPackVerifyStatus = "pass" | "warn" | "fail"
export type SyncPackVerifyVerdict = SyncPackVerifyStatus

export interface SyncPackVerifyFinding extends SyncPackFinding {
  readonly step: SyncPackVerifyStepName
}

export interface SyncPackVerifyStepResult {
  readonly name: SyncPackVerifyStepName
  readonly status: SyncPackVerifyStatus
  readonly errorCount: number
  readonly warningCount: number
  readonly findings: readonly SyncPackVerifyFinding[]
}

export interface SyncPackVerifyResult extends SyncPackFindingResult<SyncPackVerifyFinding> {
  readonly steps: readonly SyncPackVerifyStepResult[]
  readonly verdict: SyncPackVerifyVerdict
}

export interface RunSyncPackVerifyOptions {
  readonly packageRoot?: string
  readonly workspaceRoot?: string
  readonly packsRoot?: string
  readonly seedPath?: string
}

interface StepFindingLike {
  readonly severity: SyncPackVerifySeverity
  readonly code: string
  readonly message: string
  readonly filePath?: string
  readonly remediation?: SyncPackFinding["remediation"]
}

const verifyStepOrder = [
  "release-check",
  "check",
  "doctor",
  "validate",
] as const satisfies readonly SyncPackVerifyStepName[]

function toVerifyFindings(
  step: SyncPackVerifyStepName,
  findings: readonly StepFindingLike[]
): SyncPackVerifyFinding[] {
  return findings.map((finding) => ({
    step,
    severity: finding.severity,
    code: finding.code,
    message: finding.message,
    filePath: finding.filePath,
    remediation: finding.remediation,
  }))
}

function createStepFailureFinding(
  step: SyncPackVerifyStepName,
  error: unknown
): SyncPackVerifyFinding {
  const code =
    error instanceof Error && "code" in error && typeof error.code === "string"
      ? error.code
      : "sync-pack-verify-step-failed"
  const message = error instanceof Error ? error.message : String(error)

  return {
    step,
    severity: "error",
    code,
    message: `Step ${step} failed: ${message}`,
    remediation: createFindingRemediation(
      `Fix the ${step} step error and rerun the workflow.`,
      {
        command: `pnpm run feature-sync:${step}`,
        doc: "docs/sync-pack/FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md",
      }
    ),
  }
}

export function summarizeSyncPackVerifyStep(
  name: SyncPackVerifyStepName,
  findings: readonly SyncPackVerifyFinding[]
): SyncPackVerifyStepResult {
  const { errorCount, warningCount } = countFindings(findings)

  return {
    name,
    status: errorCount > 0 ? "fail" : warningCount > 0 ? "warn" : "pass",
    errorCount,
    warningCount,
    findings,
  }
}

export function summarizeSyncPackVerifyResult(
  steps: readonly SyncPackVerifyStepResult[]
): SyncPackVerifyResult {
  const findings = steps.flatMap((step) => step.findings)
  const errorCount = steps.reduce((total, step) => total + step.errorCount, 0)
  const warningCount = steps.reduce(
    (total, step) => total + step.warningCount,
    0
  )

  return {
    findings,
    errorCount,
    warningCount,
    steps,
    verdict: errorCount > 0 ? "fail" : warningCount > 0 ? "warn" : "pass",
  }
}

async function runReleaseCheckStep(
  options: RunSyncPackVerifyOptions
): Promise<SyncPackVerifyStepResult> {
  const result = await checkFeatureSdkPackageContract({
    packageRoot: options.packageRoot,
    workspaceRoot: options.workspaceRoot,
  })

  return summarizeSyncPackVerifyStep(
    "release-check",
    toVerifyFindings(
      "release-check",
      result.findings as readonly FeatureSdkPackageContractFinding[]
    )
  )
}

async function runCheckStep(
  options: RunSyncPackVerifyOptions
): Promise<SyncPackVerifyStepResult> {
  const result = await checkGeneratedPacks({
    packsRoot: options.packsRoot,
  })

  return summarizeSyncPackVerifyStep(
    "check",
    toVerifyFindings(
      "check",
      result.findings as readonly SyncPackCheckFinding[]
    )
  )
}

async function runDoctorStep(
  options: RunSyncPackVerifyOptions
): Promise<SyncPackVerifyStepResult> {
  const result = await runSyncPackDoctor({
    workspaceRoot: options.workspaceRoot,
  })

  return summarizeSyncPackVerifyStep(
    "doctor",
    toVerifyFindings(
      "doctor",
      result.findings as readonly SyncPackDoctorFinding[]
    )
  )
}

async function runValidateStep(
  options: RunSyncPackVerifyOptions
): Promise<SyncPackVerifyStepResult> {
  const result = await runSyncPackValidate({
    packageRoot: options.packageRoot,
    seedPath: options.seedPath,
  })

  return summarizeSyncPackVerifyStep(
    "validate",
    toVerifyFindings("validate", result.findings)
  )
}

type VerifyStepRunner = (
  options: RunSyncPackVerifyOptions
) => Promise<SyncPackVerifyStepResult>

const verifyStepRunners: Record<SyncPackVerifyStepName, VerifyStepRunner> = {
  "release-check": runReleaseCheckStep,
  check: runCheckStep,
  doctor: runDoctorStep,
  validate: runValidateStep,
}

export async function runSyncPackVerify(
  options: RunSyncPackVerifyOptions = {}
): Promise<SyncPackVerifyResult> {
  const steps: SyncPackVerifyStepResult[] = []

  for (const stepName of verifyStepOrder) {
    try {
      steps.push(await verifyStepRunners[stepName](options))
    } catch (error) {
      steps.push(
        summarizeSyncPackVerifyStep(stepName, [
          createStepFailureFinding(stepName, error),
        ])
      )
    }
  }

  return summarizeSyncPackVerifyResult(steps)
}
