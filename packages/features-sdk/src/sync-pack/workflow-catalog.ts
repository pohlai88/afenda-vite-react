import path from "node:path"

import {
  candidateSelectionSchema,
  filterCandidates,
  type CandidateSelection,
} from "./candidate-selection.js"
import {
  requireSyncPackCommandDefinition,
  type CliCommandDefinition,
  type SyncPackCommandName,
} from "./cli/shared.js"
import {
  checkGeneratedPacks,
  type CheckGeneratedPacksOptions,
} from "./check/pack-check.js"
import {
  runSyncPackDoctor,
  type RunSyncPackDoctorOptions,
} from "./doctor/stack-doctor.js"
import {
  syncPackGoldenExamplePackIds,
  type SyncPackGoldenExamplePackId,
} from "./example-fitness/index.js"
import {
  generateFeaturePack,
  type GenerateFeaturePackResult,
} from "./generator/generate-pack.js"
import { generateCandidateReport } from "./generator/generate-report.js"
import { createSyncPackRankingReportRow } from "./report/generate-sync-pack-ranking-report.js"
import {
  inspectSyncPackControlConsoleState,
  type SyncPackControlConsoleState,
} from "./intent/index.js"
import {
  checkFeatureSdkPackageContract,
  type CheckFeatureSdkPackageContractOptions,
} from "./package-contract.js"
import {
  featureCategorySchema,
  type FeatureCategory,
} from "./schema/category.schema.js"
import type { AppPriority } from "./schema/priority.schema.js"
import {
  writeTechStackScaffold,
  type WriteTechStackScaffoldResult,
} from "./scaffold/stack-scaffold.js"
import {
  scoreCandidate,
  type CandidatePriorityScore,
} from "./scoring/score-candidate.js"
import {
  runSyncPackValidate,
  type RunSyncPackValidateOptions,
} from "./validate/index.js"
import {
  runSyncPackVerify,
  type RunSyncPackVerifyOptions,
} from "./verify/index.js"
import {
  findWorkspaceRoot,
  readSeedCandidates,
  resolveGeneratedPacksPath,
  resolveSeedPath,
} from "./workspace.js"

export type SyncPackWorkflowCapability =
  | "read"
  | "diagnose"
  | "execute_safe"
  | "plan"
  | "generate_guarded"

export interface SyncPackWorkflowDefinition<
  TInput = unknown,
  TResult = unknown,
> {
  readonly name: string
  readonly summary: string
  readonly usage: string
  readonly group: CliCommandDefinition["group"]
  readonly gate: boolean
  readonly capability: SyncPackWorkflowCapability
  readonly mutating: boolean
  readonly execute: (input: TInput) => Promise<TResult>
}

export interface RunSyncPackQuickstartOptions {
  readonly workspaceRoot?: string
  readonly packageRoot?: string
}

export interface SyncPackQuickstartResult {
  readonly workspace: SyncPackControlConsoleState["workspace"]
  readonly sdkChangesDetected: SyncPackControlConsoleState["sdkChangesDetected"]
  readonly intentCoverage: SyncPackControlConsoleState["intentCoverage"]
  readonly dailyOperatorCommand: string
  readonly maintainerCommands: readonly string[]
  readonly releaseGateCommands: readonly string[]
  readonly recommendedNextAction: string
  readonly goldenExamplePackIds: readonly SyncPackGoldenExamplePackId[]
}

export interface SyncPackRankRow {
  readonly candidateId: string
  readonly declaredPriority: AppPriority
  readonly recommendedPriority: AppPriority
  readonly score: CandidatePriorityScore
  readonly confidence: "low" | "medium" | "high"
  readonly declaredPriorityMatchesRecommendation: boolean
  readonly assumptions: readonly string[]
  readonly likelyImplementationSurfaces: readonly ("apps/web" | "apps/api")[]
  readonly requiredValidation: readonly string[]
}

export interface RunSyncPackRankOptions {
  readonly packageRoot?: string
  readonly seedPath?: string
  readonly filters?: CandidateSelection
}

export interface SyncPackRankResult {
  readonly seedPath: string
  readonly candidateCount: number
  readonly filteredCount: number
  readonly filters: CandidateSelection
  readonly rows: readonly SyncPackRankRow[]
}

export interface RunSyncPackReportOptions {
  readonly packageRoot?: string
  readonly seedPath?: string
  readonly filters?: CandidateSelection
}

export interface SyncPackReportResult {
  readonly seedPath: string
  readonly candidateCount: number
  readonly filteredCount: number
  readonly filters: CandidateSelection
  readonly report: string
}

export interface RunSyncPackGenerateOptions {
  readonly packageRoot?: string
  readonly seedPath?: string
  readonly filters?: CandidateSelection
  readonly outputDirectory?: string
}

export interface SyncPackGenerateResult {
  readonly seedPath: string
  readonly outputDirectory: string
  readonly candidateCount: number
  readonly filteredCount: number
  readonly generatedFileCount: number
  readonly generatedPacks: readonly GenerateFeaturePackResult[]
}

export interface RunSyncPackScaffoldOptions {
  readonly appId?: string
  readonly category?: FeatureCategory
  readonly packageName?: string
  readonly outputDirectory?: string
  readonly workspaceRoot?: string
}

function createSyncPackWorkflowDefinition<TInput, TResult>(options: {
  readonly name: SyncPackCommandName
  readonly capability: SyncPackWorkflowCapability
  readonly mutating: boolean
  readonly execute: (input: TInput) => Promise<TResult>
}): SyncPackWorkflowDefinition<TInput, TResult> {
  const command = requireSyncPackCommandDefinition(options.name)

  return {
    name: command.name,
    summary: command.summary,
    usage: command.usage,
    group: command.group,
    gate: command.gate ?? false,
    capability: options.capability,
    mutating: options.mutating,
    execute: options.execute,
  }
}

function formatCandidateSelectionSummary(
  selection: CandidateSelection
): string {
  const parts = [
    selection.category ? `category=${selection.category}` : undefined,
    selection.lane ? `lane=${selection.lane}` : undefined,
    selection.owner ? `owner=${selection.owner}` : undefined,
    selection.pack ? `pack=${selection.pack}` : undefined,
  ].filter((value): value is string => Boolean(value))

  return parts.length > 0 ? parts.join(", ") : "none"
}

async function readCandidateWorkflowState(options: {
  readonly packageRoot?: string
  readonly seedPath?: string
  readonly filters?: CandidateSelection
}): Promise<{
  readonly seedPath: string
  readonly candidates: Awaited<ReturnType<typeof readSeedCandidates>>
  readonly filteredCandidates: Awaited<ReturnType<typeof readSeedCandidates>>
  readonly filters: CandidateSelection
}> {
  const filters = candidateSelectionSchema.parse(options.filters ?? {})
  const seedPath = path.resolve(
    options.seedPath ?? resolveSeedPath(options.packageRoot)
  )
  const candidates = await readSeedCandidates(seedPath)
  const filteredCandidates = filterCandidates(candidates, filters)

  return {
    seedPath,
    candidates,
    filteredCandidates,
    filters,
  }
}

function assertFilteredCandidates(
  candidates: readonly unknown[],
  filters: CandidateSelection
): void {
  if (candidates.length > 0) {
    return
  }

  throw new Error(
    `No candidates matched the requested filters (${formatCandidateSelectionSummary(filters)}).`
  )
}

export async function runSyncPackQuickstart(
  options: RunSyncPackQuickstartOptions = {}
): Promise<SyncPackQuickstartResult> {
  const currentState = await inspectSyncPackControlConsoleState(options)

  return {
    workspace: currentState.workspace,
    sdkChangesDetected: currentState.sdkChangesDetected,
    intentCoverage: currentState.intentCoverage,
    dailyOperatorCommand: "pnpm run feature-sync:verify",
    maintainerCommands: [
      "pnpm run feature-sync:intent",
      "pnpm run feature-sync:intent-check",
      "pnpm run feature-sync:sync-examples",
      "pnpm run feature-sync:quality-validate",
    ],
    releaseGateCommands: [
      "pnpm run feature-sync:release-check",
      "pnpm run feature-sync:check",
      "pnpm run feature-sync:doctor",
      "pnpm run feature-sync:validate",
    ],
    recommendedNextAction: "pnpm run feature-sync:verify",
    goldenExamplePackIds: [...syncPackGoldenExamplePackIds],
  }
}

export async function runSyncPackRank(
  options: RunSyncPackRankOptions = {}
): Promise<SyncPackRankResult> {
  const state = await readCandidateWorkflowState(options)
  assertFilteredCandidates(state.filteredCandidates, state.filters)

  const rows = [...state.filteredCandidates]
    .map((candidate) => ({
      ...createSyncPackRankingReportRow(candidate, scoreCandidate(candidate)),
      score: scoreCandidate(candidate),
    }))
    .sort((left, right) => {
      if (right.score.score !== left.score.score) {
        return right.score.score - left.score.score
      }

      return left.candidateId.localeCompare(right.candidateId)
    })

  return {
    seedPath: state.seedPath,
    candidateCount: state.candidates.length,
    filteredCount: state.filteredCandidates.length,
    filters: state.filters,
    rows,
  }
}

export async function runSyncPackReport(
  options: RunSyncPackReportOptions = {}
): Promise<SyncPackReportResult> {
  const state = await readCandidateWorkflowState(options)
  assertFilteredCandidates(state.filteredCandidates, state.filters)

  return {
    seedPath: state.seedPath,
    candidateCount: state.candidates.length,
    filteredCount: state.filteredCandidates.length,
    filters: state.filters,
    report: generateCandidateReport(state.candidates, {
      filters: state.filters,
    }),
  }
}

export async function runSyncPackGenerate(
  options: RunSyncPackGenerateOptions = {}
): Promise<SyncPackGenerateResult> {
  const state = await readCandidateWorkflowState(options)
  assertFilteredCandidates(state.filteredCandidates, state.filters)

  const outputDirectory = path.resolve(
    options.outputDirectory ?? resolveGeneratedPacksPath(options.packageRoot)
  )
  const generatedPacks: GenerateFeaturePackResult[] = []
  let generatedFileCount = 0

  for (const candidate of state.filteredCandidates) {
    const result = await generateFeaturePack({
      candidate,
      outputDirectory,
    })

    generatedPacks.push(result)
    generatedFileCount += result.writtenFiles.length
  }

  return {
    seedPath: state.seedPath,
    outputDirectory,
    candidateCount: state.candidates.length,
    filteredCount: state.filteredCandidates.length,
    generatedFileCount,
    generatedPacks,
  }
}

export async function runSyncPackScaffold(
  options: RunSyncPackScaffoldOptions = {}
): Promise<WriteTechStackScaffoldResult> {
  const workspaceRoot = options.workspaceRoot ?? findWorkspaceRoot()
  const appId = options.appId ?? "sync-pack-app"
  const category = featureCategorySchema.parse(
    options.category ?? "mini-developer"
  )
  const outputDirectory =
    options.outputDirectory ??
    path.join(workspaceRoot, ".artifacts", "sync-pack-scaffold", appId)

  return writeTechStackScaffold({
    appId,
    category,
    packageName: options.packageName,
    outputDirectory,
    workspaceRoot,
  })
}

export const syncPackWorkflowCatalog = {
  quickstart: createSyncPackWorkflowDefinition({
    name: "quickstart",
    capability: "read",
    mutating: false,
    execute: runSyncPackQuickstart,
  }),
  verify: createSyncPackWorkflowDefinition({
    name: "verify",
    capability: "execute_safe",
    mutating: false,
    execute: (input: RunSyncPackVerifyOptions = {}) => runSyncPackVerify(input),
  }),
  "release-check": createSyncPackWorkflowDefinition({
    name: "release-check",
    capability: "diagnose",
    mutating: false,
    execute: (input: CheckFeatureSdkPackageContractOptions = {}) =>
      checkFeatureSdkPackageContract(input),
  }),
  check: createSyncPackWorkflowDefinition({
    name: "check",
    capability: "diagnose",
    mutating: false,
    execute: (input: CheckGeneratedPacksOptions = {}) =>
      checkGeneratedPacks(input),
  }),
  doctor: createSyncPackWorkflowDefinition({
    name: "doctor",
    capability: "diagnose",
    mutating: false,
    execute: (input: RunSyncPackDoctorOptions = {}) => runSyncPackDoctor(input),
  }),
  validate: createSyncPackWorkflowDefinition({
    name: "validate",
    capability: "diagnose",
    mutating: false,
    execute: (input: RunSyncPackValidateOptions = {}) =>
      runSyncPackValidate(input),
  }),
  rank: createSyncPackWorkflowDefinition({
    name: "rank",
    capability: "plan",
    mutating: false,
    execute: runSyncPackRank,
  }),
  report: createSyncPackWorkflowDefinition({
    name: "report",
    capability: "plan",
    mutating: false,
    execute: runSyncPackReport,
  }),
  generate: createSyncPackWorkflowDefinition({
    name: "generate",
    capability: "generate_guarded",
    mutating: true,
    execute: runSyncPackGenerate,
  }),
  scaffold: createSyncPackWorkflowDefinition({
    name: "scaffold",
    capability: "generate_guarded",
    mutating: true,
    execute: runSyncPackScaffold,
  }),
} as const

export type SyncPackWorkflowCatalog = typeof syncPackWorkflowCatalog
export type SyncPackWorkflowName = keyof SyncPackWorkflowCatalog

export function getSyncPackWorkflowDefinition(
  name: string
): SyncPackWorkflowCatalog[SyncPackWorkflowName] | undefined {
  return syncPackWorkflowCatalog[name as SyncPackWorkflowName]
}

export function requireSyncPackWorkflowDefinition(
  name: SyncPackWorkflowName
): SyncPackWorkflowCatalog[SyncPackWorkflowName] {
  const workflow = getSyncPackWorkflowDefinition(name)

  if (!workflow) {
    throw new Error(`Missing Sync-Pack workflow definition for ${name}.`)
  }

  return workflow
}
