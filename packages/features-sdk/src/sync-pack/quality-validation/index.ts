import { readFile } from "node:fs/promises"
import path from "node:path"
import { spawn } from "node:child_process"

import {
  createFindingRemediation,
  type SyncPackFinding,
  type SyncPackFindingRemediation,
  type SyncPackFindingResult,
  type SyncPackFindingSeverity,
} from "../finding.js"
import {
  checkGoldenExampleFitness,
  type CheckGoldenExampleFitnessResult,
} from "../example-fitness/index.js"
import { type SyncPackIntentCheckResult } from "../intent/index.js"
import type { AppCandidate } from "../schema/candidate.schema.js"
import { findFeaturesSdkRoot, findWorkspaceRoot } from "../workspace.js"
import { readSeedCandidates } from "../workspace.js"

export type SyncPackQualityValidationPhase =
  | "preflight"
  | "integrity"
  | "quality"
  | "root-ux"
  | "maintainer"
  | "workflow"
  | "gate"
  | "operator"
  | "docs"

export type SyncPackQualityValidationStepName =
  | "install"
  | "typecheck"
  | "build"
  | "release-check"
  | "test:run"
  | "lint"
  | "root-quickstart"
  | "root-help"
  | "intent-check"
  | "verify"
  | "verify-json"
  | "check"
  | "doctor"
  | "validate"
  | "golden-example-fitness"
  | "rank-filter"
  | "report-filter"
  | "generate-filter"
  | "rank-zero-match"
  | "scaffold"
  | "docs-surface"

export type SyncPackQualityValidationStatus = "pass" | "warn" | "fail"
export type SyncPackQualityValidationVerdict = SyncPackQualityValidationStatus
export type SyncPackQualityValidationDisposition =
  | "fix-now"
  | "track-in-next"
  | "out-of-package-scope"

export interface SyncPackQualityValidationFinding extends SyncPackFinding {
  readonly step: SyncPackQualityValidationStepName
  readonly phase: SyncPackQualityValidationPhase
  readonly owner: string
  readonly disposition: SyncPackQualityValidationDisposition
  readonly blocking: boolean
  readonly command: string
}

export interface SyncPackQualityValidationStepResult {
  readonly name: SyncPackQualityValidationStepName
  readonly phase: SyncPackQualityValidationPhase
  readonly command: string
  readonly status: SyncPackQualityValidationStatus
  readonly errorCount: number
  readonly warningCount: number
  readonly findings: readonly SyncPackQualityValidationFinding[]
}

export interface SyncPackQualityValidationResult extends SyncPackFindingResult<SyncPackQualityValidationFinding> {
  readonly steps: readonly SyncPackQualityValidationStepResult[]
  readonly executedCommands: readonly string[]
  readonly blockingFindings: readonly SyncPackQualityValidationFinding[]
  readonly nonBlockingFindings: readonly SyncPackQualityValidationFinding[]
  readonly verdict: SyncPackQualityValidationVerdict
  readonly evidencePaths: readonly string[]
  readonly selectedCandidate: {
    readonly id: string
    readonly category: AppCandidate["internalCategory"]
    readonly lane: AppCandidate["lane"]
  } | null
}

export interface RunSyncPackQualityValidationOptions {
  readonly workspaceRoot?: string
  readonly packageRoot?: string
  readonly includePreflight?: boolean
  readonly commandRunner?: ExternalCommandRunner
}

export interface ExternalCommandSpec {
  readonly id: SyncPackQualityValidationStepName
  readonly phase: SyncPackQualityValidationPhase
  readonly displayCommand: string
  readonly cwd: string
  readonly kind: "pnpm" | "node"
  readonly args: readonly string[]
}

export interface ExternalCommandResult {
  readonly exitCode: number
  readonly stdout: string
  readonly stderr: string
}

export type ExternalCommandRunner = (
  spec: ExternalCommandSpec
) => Promise<ExternalCommandResult>

type TextExpectation = {
  readonly includes?: readonly string[]
  readonly excludes?: readonly string[]
}

type StructuredFindingLike = {
  readonly severity?: string
  readonly code?: string
  readonly message?: string
  readonly filePath?: string
  readonly remediation?: SyncPackFindingRemediation
}

type StructuredResultLike = {
  readonly findings?: readonly StructuredFindingLike[]
  readonly errorCount?: number
  readonly warningCount?: number
  readonly steps?: readonly { readonly name?: string }[]
  readonly verdict?: string
}

const qualityValidationEvidencePaths = [
  "tests/sync-pack/built-cli-smoke.test.ts",
  "tests/sync-pack/cli-transcript.test.ts",
  "tests/sync-pack/example-fitness.test.ts",
  "tests/sync-pack/intent.test.ts",
  "tests/sync-pack/verify.test.ts",
] as const

const qualityValidationDocPath =
  "docs/sync-pack/QUALITY_VALIDATION_EXECUTION_PLAN.md" as const

const docsSurfaceAssertions = [
  {
    filePath: "docs/README.md",
    includes: ["feature-sync", "finding-remediation-catalog.md"],
  },
  {
    filePath: "docs/getting-started.md",
    includes: [
      "feature-sync:verify",
      "feature-sync:intent-check",
      "feature-sync:quality-validate",
    ],
  },
  {
    filePath: "docs/junior-developer-usage-guide.md",
    includes: [
      "feature-sync:generate",
      "feature-sync:sync-examples",
      "feature-sync:quality-validate",
    ],
  },
  {
    filePath: "docs/junior-devops-quickstart.md",
    includes: [
      "feature-sync:verify",
      "feature-sync:intent-check",
      "feature-sync:quality-validate",
    ],
  },
  {
    filePath: "README.md",
    includes: [
      "feature-sync:intent",
      "feature-sync:quality-validate",
      "feature-sync:verify",
    ],
  },
  {
    filePath: "docs/sync-pack/README.md",
    includes: [
      "feature-sync:intent-check",
      "feature-sync:sync-examples",
      "feature-sync:quality-validate",
      "feature-sync:verify",
    ],
  },
  {
    filePath: "docs/sync-pack/command-handbook.md",
    includes: [
      "intent-check",
      "sync-examples",
      "quality-validate",
      "--category",
      "--lane",
      "--owner",
      "--pack",
    ],
  },
  {
    filePath: "docs/sync-pack/INTERNAL_OPERATING_CONTRACT.md",
    includes: [
      "feature-sync:intent-check",
      "feature-sync:quality-validate",
      "feature-sync:verify",
    ],
  },
  {
    filePath: "docs/sync-pack/finding-remediation-catalog.md",
    includes: [
      "invalid-seed-candidate",
      "missing-change-intent",
      "golden-example-pack-not-approved",
    ],
  },
  {
    filePath: "docs/sync-pack/INTERNAL_ROADMAP.md",
    includes: [
      "intent governance",
      "golden example fitness",
      "maintenance only",
    ],
  },
  {
    filePath: "docs/sync-pack/GOLDEN_EXAMPLES.md",
    includes: [
      "internal-support-crm",
      "bi-reporting-starter",
      "iam-sso-control-plane",
      "uptime-monitoring-workbench",
      "feature-sync:sync-examples",
    ],
  },
  {
    filePath: "docs/sync-pack/change-intents/README.md",
    includes: [".intent.json", "truthBinding", "accepted", "implemented"],
  },
  {
    filePath: "rules/sync-pack/FEATURE_SYNC_PACK_DOD.md",
    includes: ["feature-sync:intent-check", "feature-sync:quality-validate"],
  },
  {
    filePath: qualityValidationDocPath,
    includes: [
      "Features SDK Quality Validation Execution Plan",
      "Closure Rule",
    ],
  },
] as const

function resolvePnpmInvocation(): {
  readonly command: string
  readonly prefixArgs: readonly string[]
} {
  const npmExecPath = process.env.npm_execpath

  if (npmExecPath) {
    return {
      command: process.execPath,
      prefixArgs: [npmExecPath],
    }
  }

  return {
    command: process.platform === "win32" ? "pnpm.cmd" : "pnpm",
    prefixArgs: [],
  }
}

async function defaultCommandRunner(
  spec: ExternalCommandSpec
): Promise<ExternalCommandResult> {
  const launch =
    spec.kind === "pnpm"
      ? resolvePnpmInvocation()
      : {
          command: process.execPath,
          prefixArgs: [] as readonly string[],
        }
  const args = [...launch.prefixArgs, ...spec.args]

  return new Promise<ExternalCommandResult>((resolve, reject) => {
    const child = spawn(launch.command, args, {
      cwd: spec.cwd,
      env: {
        ...process.env,
        FORCE_COLOR: "0",
      },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    })
    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk)
    })
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk)
    })
    child.on("error", (error) => {
      reject(error)
    })
    child.on("close", (code) => {
      resolve({
        exitCode: code ?? 1,
        stdout,
        stderr,
      })
    })
  })
}

function isSeverity(value: string): value is SyncPackFindingSeverity {
  return value === "error" || value === "warning"
}

function normalizePath(filePath: string): string {
  return filePath.replaceAll("\\", "/")
}

function isFeaturesSdkPath(
  filePath: string | undefined,
  workspaceRoot: string,
  packageRoot: string
): boolean {
  if (!filePath) {
    return true
  }

  const normalized = normalizePath(path.resolve(filePath))
  const normalizedPackageRoot = normalizePath(path.resolve(packageRoot))
  const relativePath = normalizePath(
    path.relative(workspaceRoot, path.resolve(filePath))
  )

  return (
    normalized.startsWith(normalizedPackageRoot) ||
    relativePath === "packages/features-sdk" ||
    relativePath.startsWith("packages/features-sdk/")
  )
}

function deriveOwner(
  filePath: string | undefined,
  workspaceRoot: string
): string {
  if (!filePath) {
    return "features-sdk"
  }

  const relativePath = normalizePath(
    path.relative(workspaceRoot, path.resolve(filePath))
  )

  if (relativePath === "" || relativePath === "package.json") {
    return "workspace-root"
  }

  if (relativePath.startsWith("packages/features-sdk/")) {
    return "features-sdk"
  }

  if (relativePath.startsWith("apps/")) {
    const [, appName] = relativePath.split("/")
    return appName ? `apps/${appName}` : "workspace"
  }

  if (relativePath.startsWith("packages/")) {
    const [, packageName] = relativePath.split("/")
    return packageName ? `packages/${packageName}` : "workspace"
  }

  return "workspace"
}

function classifyBlockingWarning(
  step: SyncPackQualityValidationStepName,
  filePath: string | undefined,
  workspaceRoot: string,
  packageRoot: string
): boolean {
  if (
    step === "release-check" ||
    step === "check" ||
    step === "validate" ||
    step === "docs-surface"
  ) {
    return true
  }

  if (step === "doctor" || step === "verify-json") {
    return isFeaturesSdkPath(filePath, workspaceRoot, packageRoot)
  }

  return false
}

function createQualityFinding(input: {
  readonly step: SyncPackQualityValidationStepName
  readonly phase: SyncPackQualityValidationPhase
  readonly severity: SyncPackFindingSeverity
  readonly code: string
  readonly message: string
  readonly command: string
  readonly workspaceRoot: string
  readonly packageRoot: string
  readonly filePath?: string
  readonly remediation?: SyncPackFindingRemediation
}): SyncPackQualityValidationFinding {
  const blocking =
    input.severity === "error"
      ? true
      : classifyBlockingWarning(
          input.step,
          input.filePath,
          input.workspaceRoot,
          input.packageRoot
        )
  const owner = deriveOwner(input.filePath, input.workspaceRoot)

  return {
    step: input.step,
    phase: input.phase,
    severity: input.severity,
    code: input.code,
    message: input.message,
    filePath: input.filePath,
    remediation: input.remediation,
    owner,
    disposition: blocking
      ? "fix-now"
      : isFeaturesSdkPath(
            input.filePath,
            input.workspaceRoot,
            input.packageRoot
          )
        ? "track-in-next"
        : "out-of-package-scope",
    blocking,
    command: input.command,
  }
}

function summarizeQualityStep(
  name: SyncPackQualityValidationStepName,
  phase: SyncPackQualityValidationPhase,
  command: string,
  findings: readonly SyncPackQualityValidationFinding[]
): SyncPackQualityValidationStepResult {
  const blockingFindings = findings.filter((finding) => finding.blocking)
  const nonBlockingFindings = findings.filter(
    (finding) => !finding.blocking && finding.severity === "warning"
  )

  return {
    name,
    phase,
    command,
    status:
      blockingFindings.length > 0
        ? "fail"
        : nonBlockingFindings.length > 0
          ? "warn"
          : "pass",
    errorCount: blockingFindings.length,
    warningCount: nonBlockingFindings.length,
    findings,
  }
}

function dedupeQualityFindings(
  findings: readonly SyncPackQualityValidationFinding[]
): SyncPackQualityValidationFinding[] {
  const seen = new Set<string>()
  const deduped: SyncPackQualityValidationFinding[] = []

  for (const finding of findings) {
    const key = [
      finding.severity,
      finding.code,
      finding.message,
      finding.filePath ?? "",
      finding.owner,
      finding.disposition,
      finding.blocking ? "blocking" : "non-blocking",
    ].join("|")

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    deduped.push(finding)
  }

  return deduped
}

function summarizeQualityResult(
  steps: readonly SyncPackQualityValidationStepResult[],
  selectedCandidate: SyncPackQualityValidationResult["selectedCandidate"]
): SyncPackQualityValidationResult {
  const findings = dedupeQualityFindings(steps.flatMap((step) => step.findings))
  const blockingFindings = findings.filter((finding) => finding.blocking)
  const nonBlockingFindings = findings.filter(
    (finding) => !finding.blocking && finding.severity === "warning"
  )

  return {
    findings,
    errorCount: blockingFindings.length,
    warningCount: nonBlockingFindings.length,
    steps,
    executedCommands: steps.map((step) => step.command),
    blockingFindings,
    nonBlockingFindings,
    verdict:
      blockingFindings.length > 0
        ? "fail"
        : nonBlockingFindings.length > 0
          ? "warn"
          : "pass",
    evidencePaths: qualityValidationEvidencePaths,
    selectedCandidate,
  }
}

function createCommandFailureFinding(input: {
  readonly step: SyncPackQualityValidationStepName
  readonly phase: SyncPackQualityValidationPhase
  readonly command: string
  readonly workspaceRoot: string
  readonly packageRoot: string
  readonly result: ExternalCommandResult
}): SyncPackQualityValidationFinding {
  const detail = input.result.stderr.trim() || input.result.stdout.trim()

  return createQualityFinding({
    step: input.step,
    phase: input.phase,
    severity: "error",
    code: "command-failed",
    message: `${input.command} failed with exit code ${input.result.exitCode}.${detail ? ` ${detail}` : ""}`,
    command: input.command,
    workspaceRoot: input.workspaceRoot,
    packageRoot: input.packageRoot,
    remediation: createFindingRemediation(
      "Review the failing command output and fix the package validation issue before rerunning quality validation.",
      {
        command: input.command,
        doc: qualityValidationDocPath,
      }
    ),
  })
}

function createOutputFinding(input: {
  readonly step: SyncPackQualityValidationStepName
  readonly phase: SyncPackQualityValidationPhase
  readonly command: string
  readonly workspaceRoot: string
  readonly packageRoot: string
  readonly code: string
  readonly message: string
  readonly severity?: SyncPackFindingSeverity
}): SyncPackQualityValidationFinding {
  return createQualityFinding({
    step: input.step,
    phase: input.phase,
    severity: input.severity ?? "error",
    code: input.code,
    message: input.message,
    command: input.command,
    workspaceRoot: input.workspaceRoot,
    packageRoot: input.packageRoot,
    remediation: createFindingRemediation(
      "Restore the documented CLI or documentation contract and rerun quality validation.",
      {
        command: input.command,
        doc: qualityValidationDocPath,
      }
    ),
  })
}

function parseStructuredResult(
  step: SyncPackQualityValidationStepName,
  phase: SyncPackQualityValidationPhase,
  command: string,
  workspaceRoot: string,
  packageRoot: string,
  stdout: string
): {
  readonly findings: readonly SyncPackQualityValidationFinding[]
  readonly result: StructuredResultLike | null
} {
  try {
    const parsed = JSON.parse(stdout) as StructuredResultLike
    const findings = (parsed.findings ?? []).flatMap((finding) => {
      const severity = finding?.severity

      if (
        !finding ||
        typeof finding !== "object" ||
        !isSeverity(severity ?? "") ||
        typeof finding.code !== "string" ||
        typeof finding.message !== "string"
      ) {
        return [
          createOutputFinding({
            step,
            phase,
            command,
            workspaceRoot,
            packageRoot,
            code: "invalid-json-finding-shape",
            message:
              "Structured CLI output did not contain the expected finding shape.",
          }),
        ]
      }

      const validSeverity = severity as SyncPackFindingSeverity

      return [
        createQualityFinding({
          step,
          phase,
          severity: validSeverity,
          code: finding.code,
          message: finding.message,
          filePath: finding.filePath,
          remediation: finding.remediation,
          command,
          workspaceRoot,
          packageRoot,
        }),
      ]
    })

    return {
      findings,
      result: parsed,
    }
  } catch (error) {
    return {
      findings: [
        createOutputFinding({
          step,
          phase,
          command,
          workspaceRoot,
          packageRoot,
          code: "invalid-json-output",
          message: `Structured CLI output could not be parsed as JSON: ${error instanceof Error ? error.message : String(error)}`,
        }),
      ],
      result: null,
    }
  }
}

function assertTextOutput(
  output: string,
  expectation: TextExpectation,
  context: {
    readonly step: SyncPackQualityValidationStepName
    readonly phase: SyncPackQualityValidationPhase
    readonly command: string
    readonly workspaceRoot: string
    readonly packageRoot: string
  }
): SyncPackQualityValidationFinding[] {
  const findings: SyncPackQualityValidationFinding[] = []

  for (const marker of expectation.includes ?? []) {
    if (!output.includes(marker)) {
      findings.push(
        createOutputFinding({
          ...context,
          code: "missing-output-marker",
          message: `Expected output to include: ${marker}`,
        })
      )
    }
  }

  for (const marker of expectation.excludes ?? []) {
    if (output.includes(marker)) {
      findings.push(
        createOutputFinding({
          ...context,
          code: "unexpected-output-marker",
          message: `Output must not include: ${marker}`,
        })
      )
    }
  }

  return findings
}

function selectValidationCandidate(
  candidates: readonly AppCandidate[]
): AppCandidate | null {
  return (
    candidates.find((candidate) => candidate.id === "internal-support-crm") ??
    candidates.find(
      (candidate) => candidate.internalCategory === "business-saas"
    ) ??
    candidates[0] ??
    null
  )
}

async function runExternalStep(
  spec: ExternalCommandSpec,
  runner: ExternalCommandRunner
): Promise<ExternalCommandResult> {
  return runner(spec)
}

function createPnpmSpec(
  id: SyncPackQualityValidationStepName,
  phase: SyncPackQualityValidationPhase,
  cwd: string,
  displayCommand: string,
  args: readonly string[]
): ExternalCommandSpec {
  return {
    id,
    phase,
    cwd,
    displayCommand,
    kind: "pnpm",
    args,
  }
}

function createNodeSpec(
  id: SyncPackQualityValidationStepName,
  phase: SyncPackQualityValidationPhase,
  cwd: string,
  displayCommand: string,
  args: readonly string[]
): ExternalCommandSpec {
  return {
    id,
    phase,
    cwd,
    displayCommand,
    kind: "node",
    args,
  }
}

async function validateDocsSurface(
  workspaceRoot: string,
  packageRoot: string
): Promise<SyncPackQualityValidationStepResult> {
  const command = "internal docs validation"
  const findings: SyncPackQualityValidationFinding[] = []

  for (const assertion of docsSurfaceAssertions) {
    const absolutePath = path.join(packageRoot, assertion.filePath)
    const content = await readFile(absolutePath, "utf8")

    for (const marker of assertion.includes) {
      if (!content.includes(marker)) {
        findings.push(
          createQualityFinding({
            step: "docs-surface",
            phase: "docs",
            severity: "error",
            code: "docs-surface-drift",
            message: `${assertion.filePath} must include ${marker}.`,
            filePath: absolutePath,
            command,
            workspaceRoot,
            packageRoot,
            remediation: createFindingRemediation(
              "Update the documentation so the live package contract matches the CLI and validation workflow.",
              {
                doc: qualityValidationDocPath,
              }
            ),
          })
        )
      }
    }
  }

  return summarizeQualityStep("docs-surface", "docs", command, findings)
}

export async function runSyncPackQualityValidation(
  options: RunSyncPackQualityValidationOptions = {}
): Promise<SyncPackQualityValidationResult> {
  const workspaceRoot = options.workspaceRoot ?? findWorkspaceRoot()
  const packageRoot = options.packageRoot ?? findFeaturesSdkRoot()
  const runner = options.commandRunner ?? defaultCommandRunner
  const candidates = await readSeedCandidates(
    path.join(packageRoot, "rules", "sync-pack", "openalternative.seed.json")
  )
  const selectedCandidate = selectValidationCandidate(candidates)
  const selectedCandidateSummary = selectedCandidate
    ? {
        id: selectedCandidate.id,
        category: selectedCandidate.internalCategory,
        lane: selectedCandidate.lane,
      }
    : null
  const steps: SyncPackQualityValidationStepResult[] = []
  const builtSyncPackCli = path.join(
    packageRoot,
    "dist",
    "sync-pack",
    "cli",
    "sync-pack.js"
  )

  const addStep = (step: SyncPackQualityValidationStepResult): void => {
    steps.push(step)
  }

  const executeTextStep = async (
    spec: ExternalCommandSpec,
    expectation: TextExpectation
  ): Promise<void> => {
    const result = await runExternalStep(spec, runner)
    const findings: SyncPackQualityValidationFinding[] =
      result.exitCode === 0
        ? assertTextOutput(result.stdout, expectation, {
            step: spec.id,
            phase: spec.phase,
            command: spec.displayCommand,
            workspaceRoot,
            packageRoot,
          })
        : [
            createCommandFailureFinding({
              step: spec.id,
              phase: spec.phase,
              command: spec.displayCommand,
              workspaceRoot,
              packageRoot,
              result,
            }),
          ]

    addStep(
      summarizeQualityStep(spec.id, spec.phase, spec.displayCommand, findings)
    )
  }

  const executeStructuredStep = async (
    spec: ExternalCommandSpec,
    options: {
      readonly verifySteps?: readonly string[]
      readonly requireZeroWarnings?: boolean
      readonly requireZeroErrors?: boolean
    } = {}
  ): Promise<void> => {
    const result = await runExternalStep(spec, runner)
    const findings: SyncPackQualityValidationFinding[] = []
    const parsed = parseStructuredResult(
      spec.id,
      spec.phase,
      spec.displayCommand,
      workspaceRoot,
      packageRoot,
      result.stdout
    )

    findings.push(...parsed.findings)

    if (
      result.exitCode !== 0 &&
      (!parsed.result || (parsed.result.findings?.length ?? 0) === 0)
    ) {
      findings.push(
        createCommandFailureFinding({
          step: spec.id,
          phase: spec.phase,
          command: spec.displayCommand,
          workspaceRoot,
          packageRoot,
          result,
        })
      )
    }

    if (parsed.result) {
      if (options.requireZeroErrors && (parsed.result.errorCount ?? 0) > 0) {
        findings.push(
          createOutputFinding({
            step: spec.id,
            phase: spec.phase,
            command: spec.displayCommand,
            workspaceRoot,
            packageRoot,
            code: "unexpected-error-count",
            message: `Expected zero errors but received ${parsed.result.errorCount}.`,
          })
        )
      }

      if (
        options.requireZeroWarnings &&
        (parsed.result.warningCount ?? 0) > 0
      ) {
        findings.push(
          createOutputFinding({
            step: spec.id,
            phase: spec.phase,
            command: spec.displayCommand,
            workspaceRoot,
            packageRoot,
            code: "unexpected-warning-count",
            message: `Expected zero warnings but received ${parsed.result.warningCount}.`,
            severity: "warning",
          })
        )
      }

      if (options.verifySteps) {
        const actualSteps =
          parsed.result.steps?.map((step) => step.name ?? "") ?? []

        if (actualSteps.join("|") !== options.verifySteps.join("|")) {
          findings.push(
            createOutputFinding({
              step: spec.id,
              phase: spec.phase,
              command: spec.displayCommand,
              workspaceRoot,
              packageRoot,
              code: "verify-step-order-drift",
              message: `Expected verify steps ${options.verifySteps.join(" -> ")}, received ${actualSteps.join(" -> ")}.`,
            })
          )
        }

        if (typeof parsed.result.verdict !== "string") {
          findings.push(
            createOutputFinding({
              step: spec.id,
              phase: spec.phase,
              command: spec.displayCommand,
              workspaceRoot,
              packageRoot,
              code: "missing-verify-verdict",
              message: "Verify JSON result must include a verdict string.",
            })
          )
        }
      }
    }

    addStep(
      summarizeQualityStep(spec.id, spec.phase, spec.displayCommand, findings)
    )
  }

  const executeExpectedFailureStep = async (
    spec: ExternalCommandSpec,
    expectedMessage: string
  ): Promise<void> => {
    const result = await runExternalStep(spec, runner)
    const findings: SyncPackQualityValidationFinding[] = []
    const combinedOutput = `${result.stdout}\n${result.stderr}`

    if (result.exitCode === 0) {
      findings.push(
        createOutputFinding({
          step: spec.id,
          phase: spec.phase,
          command: spec.displayCommand,
          workspaceRoot,
          packageRoot,
          code: "expected-command-failure",
          message:
            "Expected the command to fail for a zero-match selector, but it succeeded.",
        })
      )
    }

    if (!combinedOutput.includes(expectedMessage)) {
      findings.push(
        createOutputFinding({
          step: spec.id,
          phase: spec.phase,
          command: spec.displayCommand,
          workspaceRoot,
          packageRoot,
          code: "missing-actionable-error-message",
          message: `Expected the failure output to include: ${expectedMessage}`,
        })
      )
    }

    addStep(
      summarizeQualityStep(spec.id, spec.phase, spec.displayCommand, findings)
    )
  }

  const addLibraryStructuredStep = (
    stepName: SyncPackQualityValidationStepName,
    phase: SyncPackQualityValidationPhase,
    command: string,
    result:
      | SyncPackIntentCheckResult
      | CheckGoldenExampleFitnessResult
      | Pick<SyncPackFindingResult, "findings">
  ): void => {
    const findings = result.findings.map((finding) =>
      createQualityFinding({
        step: stepName,
        phase,
        severity: finding.severity,
        code: finding.code,
        message: finding.message,
        filePath: finding.filePath,
        remediation: finding.remediation,
        command,
        workspaceRoot,
        packageRoot,
      })
    )

    addStep(summarizeQualityStep(stepName, phase, command, findings))
  }

  if (options.includePreflight) {
    await executeTextStep(
      createPnpmSpec(
        "install",
        "preflight",
        workspaceRoot,
        "pnpm install --frozen-lockfile",
        ["install", "--frozen-lockfile"]
      ),
      {
        excludes: ["ERR_"],
      }
    )
  }

  await executeTextStep(
    createPnpmSpec(
      "typecheck",
      "integrity",
      workspaceRoot,
      "pnpm --filter @afenda/features-sdk typecheck",
      ["--filter", "@afenda/features-sdk", "typecheck"]
    ),
    {}
  )
  await executeTextStep(
    createPnpmSpec(
      "build",
      "integrity",
      workspaceRoot,
      "pnpm --filter @afenda/features-sdk build",
      ["--filter", "@afenda/features-sdk", "build"]
    ),
    {}
  )
  await executeStructuredStep(
    createNodeSpec(
      "release-check",
      "integrity",
      packageRoot,
      "node dist/sync-pack/cli/sync-pack.js release-check --json --ci",
      [builtSyncPackCli, "release-check", "--json", "--ci"]
    ),
    {
      requireZeroErrors: true,
      requireZeroWarnings: true,
    }
  )
  await executeTextStep(
    createPnpmSpec(
      "test:run",
      "quality",
      workspaceRoot,
      "pnpm --filter @afenda/features-sdk test:run",
      ["--filter", "@afenda/features-sdk", "test:run"]
    ),
    {}
  )
  await executeTextStep(
    createPnpmSpec(
      "lint",
      "quality",
      workspaceRoot,
      "pnpm --filter @afenda/features-sdk lint",
      ["--filter", "@afenda/features-sdk", "lint"]
    ),
    {}
  )
  await executeTextStep(
    createPnpmSpec(
      "root-quickstart",
      "root-ux",
      workspaceRoot,
      "pnpm run feature-sync",
      ["run", "feature-sync"]
    ),
    {
      includes: [
        "Afenda Sync-Pack Quickstart",
        "Feature Sync — Start Here",
        "Daily operator:",
        "SDK/package maintainer:",
        "Current state:",
        "pnpm run feature-sync:verify",
        "It never auto-runs verify.",
      ],
      excludes: ["Feature Sync-Pack verify"],
    }
  )
  await executeTextStep(
    createPnpmSpec(
      "root-help",
      "root-ux",
      workspaceRoot,
      "pnpm run feature-sync:help",
      ["run", "feature-sync:help"]
    ),
    {
      includes: [
        "Afenda Sync-Pack CLI",
        "Daily Operator:",
        "SDK/package Maintainer:",
        "Workflow:",
        "Release Gates:",
      ],
    }
  )
  await executeStructuredStep(
    createNodeSpec(
      "intent-check",
      "maintainer",
      packageRoot,
      "node dist/sync-pack/cli/sync-pack.js intent-check --json --ci",
      [builtSyncPackCli, "intent-check", "--json", "--ci"]
    ),
    {
      requireZeroErrors: true,
    }
  )
  await executeTextStep(
    createNodeSpec(
      "verify",
      "workflow",
      packageRoot,
      "node dist/sync-pack/cli/sync-pack.js verify",
      [builtSyncPackCli, "verify"]
    ),
    {
      includes: [
        "Feature Sync-Pack verify",
        "What ran?",
        "What passed?",
        "What warned?",
        "What failed?",
        "What to fix next?",
        "Final verdict:",
      ],
    }
  )
  await executeStructuredStep(
    createNodeSpec(
      "verify-json",
      "workflow",
      packageRoot,
      "node dist/sync-pack/cli/sync-pack.js verify --json --ci",
      [builtSyncPackCli, "verify", "--json", "--ci"]
    ),
    {
      requireZeroErrors: true,
      verifySteps: ["release-check", "check", "doctor", "validate"],
    }
  )
  await executeStructuredStep(
    createNodeSpec(
      "check",
      "gate",
      packageRoot,
      "node dist/sync-pack/cli/sync-pack.js check --json --ci",
      [builtSyncPackCli, "check", "--json", "--ci"]
    ),
    {
      requireZeroErrors: true,
      requireZeroWarnings: true,
    }
  )
  await executeStructuredStep(
    createNodeSpec(
      "doctor",
      "gate",
      packageRoot,
      "node dist/sync-pack/cli/sync-pack.js doctor --json --ci",
      [builtSyncPackCli, "doctor", "--json", "--ci"]
    ),
    {
      requireZeroErrors: true,
    }
  )
  await executeStructuredStep(
    createNodeSpec(
      "validate",
      "gate",
      packageRoot,
      "node dist/sync-pack/cli/sync-pack.js validate --json --ci",
      [builtSyncPackCli, "validate", "--json", "--ci"]
    ),
    {
      requireZeroErrors: true,
      requireZeroWarnings: true,
    }
  )
  addLibraryStructuredStep(
    "golden-example-fitness",
    "maintainer",
    "read-only golden example fitness validation",
    await checkGoldenExampleFitness({
      packageRoot,
    })
  )

  if (!selectedCandidate) {
    addStep(
      summarizeQualityStep("rank-filter", "operator", "candidate selection", [
        createOutputFinding({
          step: "rank-filter",
          phase: "operator",
          command: "candidate selection",
          workspaceRoot,
          packageRoot,
          code: "missing-seed-candidate",
          message:
            "Quality validation requires at least one seed candidate to exercise operator features.",
        }),
      ])
    )
  } else {
    await executeTextStep(
      createNodeSpec(
        "rank-filter",
        "operator",
        packageRoot,
        `node dist/sync-pack/cli/sync-pack.js rank --category ${selectedCandidate.internalCategory}`,
        [
          builtSyncPackCli,
          "rank",
          "--category",
          selectedCandidate.internalCategory,
        ]
      ),
      {
        includes: [
          `Applied filters: category=${selectedCandidate.internalCategory}`,
          selectedCandidate.id,
        ],
      }
    )
    await executeTextStep(
      createNodeSpec(
        "report-filter",
        "operator",
        packageRoot,
        `node dist/sync-pack/cli/sync-pack.js report --lane ${selectedCandidate.lane}`,
        [builtSyncPackCli, "report", "--lane", selectedCandidate.lane]
      ),
      {
        includes: [
          `Applied filters: lane=${selectedCandidate.lane}`,
          "# Feature Sync-Pack Report",
        ],
      }
    )
    await executeTextStep(
      createNodeSpec(
        "generate-filter",
        "operator",
        packageRoot,
        `node dist/sync-pack/cli/sync-pack.js generate --pack ${selectedCandidate.id}`,
        [builtSyncPackCli, "generate", "--pack", selectedCandidate.id]
      ),
      {
        includes: [
          `Applied filters: pack=${selectedCandidate.id}`,
          "Generated",
          selectedCandidate.id,
        ],
      }
    )
    await executeExpectedFailureStep(
      createNodeSpec(
        "rank-zero-match",
        "operator",
        packageRoot,
        "node dist/sync-pack/cli/sync-pack.js rank --pack missing-quality-validation-pack",
        [builtSyncPackCli, "rank", "--pack", "missing-quality-validation-pack"]
      ),
      "No candidates matched the requested filters"
    )
    await executeTextStep(
      createNodeSpec(
        "scaffold",
        "operator",
        packageRoot,
        `node dist/sync-pack/cli/sync-pack.js scaffold --app-id ${selectedCandidate.id} --category ${selectedCandidate.internalCategory}`,
        [
          builtSyncPackCli,
          "scaffold",
          "--app-id",
          selectedCandidate.id,
          "--category",
          selectedCandidate.internalCategory,
        ]
      ),
      {
        includes: [
          "Planning pack:",
          "Web feature:",
          "API module:",
          "API route:",
        ],
      }
    )
  }

  addStep(await validateDocsSurface(workspaceRoot, packageRoot))

  return summarizeQualityResult(steps, selectedCandidateSummary)
}
