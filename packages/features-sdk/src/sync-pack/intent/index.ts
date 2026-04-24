import { execFile } from "node:child_process"
import { existsSync } from "node:fs"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"

import { ZodError, z } from "zod"

import {
  countFindings,
  createFindingRemediation,
  type SyncPackFinding,
  type SyncPackFindingResult,
} from "../finding.js"
import { findFeaturesSdkRoot, findWorkspaceRoot } from "../workspace.js"

const execFileAsync = promisify(execFile)

export const syncPackIntentContractId = "FSDK-INTENT-001" as const

export const syncPackIntentChangedSurfaces = [
  "src",
  "docs",
  "rules",
  "package-metadata",
  "generated-packs",
  "root-scripts",
] as const

export const syncPackIntentInvariantRefs = [
  "FSDK-CONTRACT-001",
  "FSDK-CLI-001",
  "FSDK-CLI-002",
  "FSDK-CLI-003",
  "FSDK-CLI-004",
  "FSDK-FINDING-001",
  "FSDK-INTENT-001",
  "FSDK-EXAMPLE-001",
] as const

export type SyncPackChangedSurface =
  (typeof syncPackIntentChangedSurfaces)[number]

export type SyncPackIntentInvariantRef =
  (typeof syncPackIntentInvariantRefs)[number]

export interface SyncPackChangeIntentTruthBinding {
  readonly doctrineRefs: readonly string[]
  readonly invariantRefs: readonly SyncPackIntentInvariantRef[]
  readonly expectedDiffScope: readonly string[]
  readonly expectedGeneratedOutputs: readonly string[]
  readonly evidenceRefs: readonly string[]
}

export interface SyncPackChangeIntent {
  readonly id: string
  readonly title: string
  readonly status: "draft" | "accepted" | "implemented"
  readonly owner: string
  readonly summary: string
  readonly changedSurface: readonly SyncPackChangedSurface[]
  readonly commandsAffected: readonly string[]
  readonly truthBinding: SyncPackChangeIntentTruthBinding
  readonly validationPlan: readonly string[]
  readonly reviewNote: string
}

export type SyncPackIntentCheckFinding = SyncPackFinding

export interface SyncPackIntentCheckResult extends SyncPackFindingResult<SyncPackIntentCheckFinding> {
  readonly contractId: typeof syncPackIntentContractId
  readonly verdict: "pass" | "fail"
  readonly changedFiles: readonly string[]
  readonly matchedIntentIds: readonly string[]
}

export interface SyncPackWorktreeState {
  readonly workspaceStatus: "clean" | "dirty"
  readonly changedFiles: readonly string[]
  readonly packageOwnedFiles: readonly string[]
  readonly changedIntentFiles: readonly string[]
}

export interface SyncPackControlConsoleState {
  readonly workspace: "clean" | "dirty" | "unknown"
  readonly sdkChangesDetected: "yes" | "no" | "unknown"
  readonly intentCoverage: "satisfied" | "required" | "unknown"
}

export interface RunSyncPackIntentCheckOptions {
  readonly workspaceRoot?: string
  readonly packageRoot?: string
  readonly changeIntentsRoot?: string
  readonly worktreeState?: SyncPackWorktreeState
}

const metadataReferenceDocPath = "docs/sync-pack/metadata-reference.md" as const
const remediationCatalogDocPath =
  "docs/sync-pack/finding-remediation-catalog.md" as const
const intentContractDocPath =
  "docs/sync-pack/FSDK-INTENT-001_CHANGE_INTENT_CONTRACT.md" as const
const intentCommand = "pnpm run feature-sync:intent" as const
const intentCheckCommand = "pnpm run feature-sync:intent-check" as const

const windowsAbsolutePathPattern = /^[a-zA-Z]:[\\/]/u
const posixAbsolutePathPattern = /^\//u
const kebabCasePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

function normalizeRepoRelativePath(value: string): string {
  const trimmed = value.trim().replaceAll("\\", "/")
  const withoutLeadingDot = trimmed.replace(/^\.\/+/u, "")

  return withoutLeadingDot.replace(/\/{2,}/gu, "/")
}

function validateRepoRelativePath(value: string, label: string): string | null {
  if (value.length === 0) {
    return `${label} must not be empty.`
  }

  if (
    windowsAbsolutePathPattern.test(value) ||
    posixAbsolutePathPattern.test(value)
  ) {
    return `${label} must be repo-relative, not absolute.`
  }

  const segments = value.split("/")

  if (segments.some((segment) => segment === "..")) {
    return `${label} must not contain backtracking segments.`
  }

  return null
}

function validateExpectedDiffScopeEntry(value: string): string | null {
  const normalized = normalizeRepoRelativePath(value)
  const isPrefix = normalized.endsWith("/**")
  const candidate = isPrefix ? normalized.slice(0, -3) : normalized
  const pathError = validateRepoRelativePath(
    candidate,
    "truthBinding.expectedDiffScope entry"
  )

  if (pathError) {
    return pathError
  }

  if (isPrefix && candidate.length === 0) {
    return "truthBinding.expectedDiffScope prefix must not be empty."
  }

  return null
}

const truthBoundRepoPathSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1)
    .transform((value) => normalizeRepoRelativePath(value))
    .superRefine((value, context) => {
      const error = validateRepoRelativePath(value, label)

      if (error) {
        context.addIssue({
          code: "custom",
          message: error,
        })
      }
    })

const expectedDiffScopeSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => normalizeRepoRelativePath(value))
  .superRefine((value, context) => {
    const error = validateExpectedDiffScopeEntry(value)

    if (error) {
      context.addIssue({
        code: "custom",
        message: error,
      })
    }
  })

export const syncPackChangeIntentSchema = z.strictObject({
  id: z.string().trim().min(1).regex(kebabCasePattern, {
    message: "Intent id must use stable kebab-case.",
  }),
  title: z.string().trim().min(1),
  status: z.enum(["draft", "accepted", "implemented"]),
  owner: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  changedSurface: z.array(z.enum(syncPackIntentChangedSurfaces)),
  commandsAffected: z.array(z.string().trim().min(1)),
  truthBinding: z.strictObject({
    doctrineRefs: z.array(
      truthBoundRepoPathSchema("truthBinding.doctrineRefs entry")
    ),
    invariantRefs: z.array(z.enum(syncPackIntentInvariantRefs)),
    expectedDiffScope: z.array(expectedDiffScopeSchema),
    expectedGeneratedOutputs: z.array(
      truthBoundRepoPathSchema("truthBinding.expectedGeneratedOutputs entry")
    ),
    evidenceRefs: z.array(
      truthBoundRepoPathSchema("truthBinding.evidenceRefs entry")
    ),
  }),
  validationPlan: z.array(z.string().trim().min(1)),
  reviewNote: z.string().trim().min(1),
})

interface LoadedIntentRecord {
  readonly relativePath: string
  readonly absolutePath: string
  readonly intent: SyncPackChangeIntent | null
  readonly findings: readonly SyncPackIntentCheckFinding[]
}

function createIntentRemediation(
  action: string,
  options: {
    readonly command?: string
    readonly doc?: string
  } = {}
): ReturnType<typeof createFindingRemediation> {
  return createFindingRemediation(action, {
    command: options.command ?? intentCheckCommand,
    doc: options.doc ?? intentContractDocPath,
  })
}

function createIntentTemplateNote(): string {
  return "Draft intent scaffold; add review context before accepting or implementing."
}

export function createSyncPackChangeIntentTemplate(input: {
  readonly id: string
  readonly title: string
  readonly owner: string
  readonly summary?: string
}): SyncPackChangeIntent {
  return {
    id: input.id,
    title: input.title,
    status: "draft",
    owner: input.owner,
    summary: input.summary?.trim() || input.title,
    changedSurface: [],
    commandsAffected: [],
    truthBinding: {
      doctrineRefs: [],
      invariantRefs: [],
      expectedDiffScope: [],
      expectedGeneratedOutputs: [],
      evidenceRefs: [],
    },
    validationPlan: [],
    reviewNote: createIntentTemplateNote(),
  }
}

export function matchesSyncPackIntentDiffScope(
  scopeEntry: string,
  changedFilePath: string
): boolean {
  const normalizedScope = normalizeRepoRelativePath(scopeEntry)
  const normalizedChangedFile = normalizeRepoRelativePath(changedFilePath)

  if (normalizedScope.endsWith("/**")) {
    const prefix = normalizedScope.slice(0, -3)

    return (
      normalizedChangedFile === prefix ||
      normalizedChangedFile.startsWith(`${prefix}/`)
    )
  }

  return normalizedChangedFile === normalizedScope
}

function resolvePackageRelativePath(
  workspaceRoot: string,
  packageRoot: string
): string {
  return normalizeRepoRelativePath(path.relative(workspaceRoot, packageRoot))
}

function toAbsoluteWorkspacePath(
  workspaceRoot: string,
  relativePath: string
): string {
  return path.join(
    workspaceRoot,
    ...normalizeRepoRelativePath(relativePath).split("/")
  )
}

function isIntentRelativePath(
  filePath: string,
  packageRelativePath: string
): boolean {
  const intentPrefix = `${packageRelativePath}/docs/sync-pack/change-intents/`

  return filePath.startsWith(intentPrefix) && filePath.endsWith(".intent.json")
}

async function runGitCommand(
  workspaceRoot: string,
  args: readonly string[]
): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", [...args], {
      cwd: workspaceRoot,
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024,
    })

    return stdout
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to execute git command."

    throw new Error(
      `Unable to inspect git worktree state for Sync-Pack intent checks: ${message}`
    )
  }
}

function parseGitStatusEntries(stdout: string): string[] {
  return stdout
    .split(/\r?\n/u)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map((line) => {
      const payload = line.slice(3).trim()
      const resolvedPath = payload.includes(" -> ")
        ? (payload.split(" -> ").at(-1) ?? payload)
        : payload

      return normalizeRepoRelativePath(resolvedPath)
    })
}

async function rootFileAffectsFeatureSync(
  workspaceRoot: string,
  relativePath: "package.json" | "turbo.json"
): Promise<boolean> {
  const diffText =
    (await runGitCommand(workspaceRoot, ["diff", "--", relativePath])) +
    (await runGitCommand(workspaceRoot, [
      "diff",
      "--cached",
      "--",
      relativePath,
    ]))

  return /(feature-sync|sync-pack:)/u.test(diffText)
}

async function resolvePackageOwnedFiles(
  workspaceRoot: string,
  packageRoot: string,
  changedFiles: readonly string[]
): Promise<string[]> {
  const packageRelativePath = resolvePackageRelativePath(
    workspaceRoot,
    packageRoot
  )
  const packageOwned: string[] = []

  for (const changedFile of changedFiles) {
    if (
      changedFile === `${packageRelativePath}/package.json` ||
      changedFile.startsWith(`${packageRelativePath}/src/`) ||
      changedFile.startsWith(`${packageRelativePath}/docs/`) ||
      changedFile.startsWith(`${packageRelativePath}/rules/`)
    ) {
      packageOwned.push(changedFile)
      continue
    }

    if (
      (changedFile === "package.json" || changedFile === "turbo.json") &&
      (await rootFileAffectsFeatureSync(
        workspaceRoot,
        changedFile as "package.json" | "turbo.json"
      ))
    ) {
      packageOwned.push(changedFile)
    }
  }

  return [...new Set(packageOwned)].sort()
}

export async function resolveSyncPackWorktreeState(
  options: {
    readonly workspaceRoot?: string
    readonly packageRoot?: string
  } = {}
): Promise<SyncPackWorktreeState> {
  const packageRoot = path.resolve(options.packageRoot ?? findFeaturesSdkRoot())
  const workspaceRoot = path.resolve(
    options.workspaceRoot ?? findWorkspaceRoot(packageRoot)
  )
  const packageRelativePath = resolvePackageRelativePath(
    workspaceRoot,
    packageRoot
  )
  const statusOutput = await runGitCommand(workspaceRoot, [
    "status",
    "--short",
    "--untracked-files=all",
  ])
  const changedFiles = parseGitStatusEntries(statusOutput)
  const packageOwnedFiles = await resolvePackageOwnedFiles(
    workspaceRoot,
    packageRoot,
    changedFiles
  )
  const changedIntentFiles = changedFiles.filter((filePath) =>
    isIntentRelativePath(filePath, packageRelativePath)
  )

  return {
    workspaceStatus: changedFiles.length > 0 ? "dirty" : "clean",
    changedFiles,
    packageOwnedFiles,
    changedIntentFiles,
  }
}

function resolveChangeIntentsRoot(packageRoot: string): string {
  return path.join(packageRoot, "docs", "sync-pack", "change-intents")
}

async function loadSyncPackIntentRecords(
  workspaceRoot: string,
  changeIntentsRoot: string
): Promise<LoadedIntentRecord[]> {
  if (!existsSync(changeIntentsRoot)) {
    return [
      {
        relativePath: normalizeRepoRelativePath(
          path.relative(workspaceRoot, changeIntentsRoot)
        ),
        absolutePath: changeIntentsRoot,
        intent: null,
        findings: [
          {
            severity: "error",
            code: "missing-change-intents-directory",
            filePath: changeIntentsRoot,
            message:
              "docs/sync-pack/change-intents does not exist for Sync-Pack maintainer validation.",
            remediation: createIntentRemediation(
              "Create docs/sync-pack/change-intents and add a governed README plus the active intent file before rerunning intent-check."
            ),
          },
        ],
      },
    ]
  }

  const entries = await readdir(changeIntentsRoot, { withFileTypes: true })

  return Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".intent.json"))
      .map(async (entry) => {
        const absolutePath = path.join(changeIntentsRoot, entry.name)
        const relativePath = normalizeRepoRelativePath(
          path.relative(workspaceRoot, absolutePath)
        )
        const findings: SyncPackIntentCheckFinding[] = []

        try {
          const raw = await readFile(absolutePath, "utf8")
          const parsedJson = JSON.parse(raw) as unknown
          const intent = syncPackChangeIntentSchema.parse(parsedJson)
          const expectedId = entry.name.replace(/\.intent\.json$/u, "")

          if (intent.id !== expectedId) {
            findings.push({
              severity: "error",
              code: "intent-path-id-mismatch",
              filePath: absolutePath,
              message: `Intent id ${intent.id} must match filename ${expectedId}.intent.json.`,
              remediation: createIntentRemediation(
                `Rename ${relativePath} or update the id field so they match before rerunning intent-check.`
              ),
            })
          }

          for (const doctrineRef of intent.truthBinding.doctrineRefs) {
            if (
              !existsSync(toAbsoluteWorkspacePath(workspaceRoot, doctrineRef))
            ) {
              findings.push({
                severity: "error",
                code: "missing-intent-doctrine-ref",
                filePath: absolutePath,
                message: `Doctrine reference ${doctrineRef} does not exist.`,
                remediation: createIntentRemediation(
                  `Fix doctrineRefs in ${relativePath} so every reference points to an existing governed document.`
                ),
              })
            }
          }

          for (const evidenceRef of intent.truthBinding.evidenceRefs) {
            if (
              !existsSync(toAbsoluteWorkspacePath(workspaceRoot, evidenceRef))
            ) {
              findings.push({
                severity: "error",
                code: "missing-intent-evidence-ref",
                filePath: absolutePath,
                message: `Evidence reference ${evidenceRef} does not exist.`,
                remediation: createIntentRemediation(
                  `Fix evidenceRefs in ${relativePath} so every reference points to an existing file.`
                ),
              })
            }
          }

          return {
            relativePath,
            absolutePath,
            intent,
            findings,
          }
        } catch (error) {
          if (error instanceof SyntaxError) {
            findings.push({
              severity: "error",
              code: "invalid-intent-json",
              filePath: absolutePath,
              message: `Intent file is not valid JSON: ${error.message}`,
              remediation: createIntentRemediation(
                `Fix the JSON syntax in ${relativePath}, then rerun intent-check.`
              ),
            })
          } else if (error instanceof ZodError) {
            findings.push({
              severity: "error",
              code: "invalid-intent-schema",
              filePath: absolutePath,
              message: `Intent file does not satisfy ${syncPackIntentContractId}: ${error.issues
                .slice(0, 3)
                .map((issue) => {
                  const issuePath =
                    issue.path.length > 0 ? issue.path.join(".") : "root"
                  return `${issuePath}: ${issue.message}`
                })
                .join("; ")}`,
              remediation: createIntentRemediation(
                `Correct the invalid fields in ${relativePath} using ${metadataReferenceDocPath} and rerun intent-check.`,
                {
                  doc: metadataReferenceDocPath,
                }
              ),
            })
          } else {
            findings.push({
              severity: "error",
              code: "intent-read-failed",
              filePath: absolutePath,
              message: `Unable to read ${relativePath}: ${error instanceof Error ? error.message : String(error)}`,
              remediation: createIntentRemediation(
                `Restore ${relativePath} and rerun intent-check.`
              ),
            })
          }

          return {
            relativePath,
            absolutePath,
            intent: null,
            findings,
          }
        }
      })
  )
}

function dedupeFindings(
  findings: readonly SyncPackIntentCheckFinding[]
): SyncPackIntentCheckFinding[] {
  const seen = new Set<string>()

  return findings.filter((finding) => {
    const key = [
      finding.severity,
      finding.code,
      finding.message,
      finding.filePath ?? "",
    ].join("|")

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

export async function runSyncPackIntentCheck(
  options: RunSyncPackIntentCheckOptions = {}
): Promise<SyncPackIntentCheckResult> {
  const packageRoot = path.resolve(options.packageRoot ?? findFeaturesSdkRoot())
  const workspaceRoot = path.resolve(
    options.workspaceRoot ?? findWorkspaceRoot(packageRoot)
  )
  const packageRelativePath = resolvePackageRelativePath(
    workspaceRoot,
    packageRoot
  )
  const changeIntentsRoot = path.resolve(
    options.changeIntentsRoot ?? resolveChangeIntentsRoot(packageRoot)
  )
  const worktreeState =
    options.worktreeState ??
    (await resolveSyncPackWorktreeState({
      workspaceRoot,
      packageRoot,
    }))
  const records = await loadSyncPackIntentRecords(
    workspaceRoot,
    changeIntentsRoot
  )
  const findings: SyncPackIntentCheckFinding[] = records.flatMap(
    (record) => record.findings
  )
  const validIntents = records
    .filter(
      (
        record
      ): record is LoadedIntentRecord & {
        readonly intent: SyncPackChangeIntent
      } => record.intent !== null
    )
    .map((record) => ({
      relativePath: record.relativePath,
      absolutePath: record.absolutePath,
      intent: record.intent,
    }))
  const changedIntentSet = new Set(worktreeState.changedIntentFiles)
  const changedNonDraftIntents = validIntents.filter(
    (record) =>
      changedIntentSet.has(record.relativePath) &&
      record.intent.status !== "draft"
  )
  const changedDraftIntents = validIntents.filter(
    (record) =>
      changedIntentSet.has(record.relativePath) &&
      record.intent.status === "draft"
  )
  const coverageFiles = worktreeState.packageOwnedFiles.filter(
    (filePath) => !isIntentRelativePath(filePath, packageRelativePath)
  )
  const matchedIntentIds = new Set<string>()

  if (worktreeState.packageOwnedFiles.length > 0) {
    if (changedNonDraftIntents.length === 0) {
      findings.push({
        severity: "error",
        code:
          changedDraftIntents.length > 0
            ? "draft-intent-only"
            : "missing-change-intent",
        filePath:
          changedDraftIntents[0]?.absolutePath ??
          path.join(changeIntentsRoot, "README.md"),
        message:
          changedDraftIntents.length > 0
            ? "Only draft Sync-Pack change intent files changed while package-owned features-sdk surfaces are dirty."
            : "Package-owned features-sdk changes require at least one changed non-draft Sync-Pack change intent file.",
        remediation: createIntentRemediation(
          changedDraftIntents.length > 0
            ? "Promote the changed draft intent to accepted or implemented, then rerun intent-check."
            : "Run pnpm run feature-sync:intent, complete the truth-binding fields, set status to accepted or implemented, and rerun intent-check.",
          {
            command: changedDraftIntents.length > 0 ? undefined : intentCommand,
          }
        ),
      })
    }

    for (const changedFile of coverageFiles) {
      const matchingIntent = changedNonDraftIntents.find((record) =>
        record.intent.truthBinding.expectedDiffScope.some((scopeEntry) =>
          matchesSyncPackIntentDiffScope(scopeEntry, changedFile)
        )
      )

      if (matchingIntent) {
        matchedIntentIds.add(matchingIntent.intent.id)
        continue
      }

      findings.push({
        severity: "error",
        code: "uncovered-change-scope",
        filePath: toAbsoluteWorkspacePath(workspaceRoot, changedFile),
        message: `Changed file ${changedFile} is not covered by any changed non-draft intent truthBinding.expectedDiffScope entry.`,
        remediation: createIntentRemediation(
          `Update a changed non-draft intent so truthBinding.expectedDiffScope covers ${changedFile}, then rerun intent-check.`,
          {
            doc: remediationCatalogDocPath,
          }
        ),
      })
    }
  }

  const dedupedFindings = dedupeFindings(findings)
  const { errorCount, warningCount } = countFindings(dedupedFindings)

  return {
    contractId: syncPackIntentContractId,
    verdict: errorCount > 0 ? "fail" : "pass",
    findings: dedupedFindings,
    errorCount,
    warningCount,
    changedFiles: worktreeState.changedFiles,
    matchedIntentIds: [...matchedIntentIds].sort(),
  }
}

export async function inspectSyncPackControlConsoleState(
  options: {
    readonly workspaceRoot?: string
    readonly packageRoot?: string
  } = {}
): Promise<SyncPackControlConsoleState> {
  try {
    const packageRoot = path.resolve(
      options.packageRoot ?? findFeaturesSdkRoot()
    )
    const workspaceRoot = path.resolve(
      options.workspaceRoot ?? findWorkspaceRoot(packageRoot)
    )
    const worktreeState = await resolveSyncPackWorktreeState({
      workspaceRoot,
      packageRoot,
    })

    if (worktreeState.packageOwnedFiles.length === 0) {
      return {
        workspace: worktreeState.workspaceStatus,
        sdkChangesDetected: "no",
        intentCoverage: "satisfied",
      }
    }

    const result = await runSyncPackIntentCheck({
      workspaceRoot,
      packageRoot,
      worktreeState,
    })

    return {
      workspace: worktreeState.workspaceStatus,
      sdkChangesDetected: "yes",
      intentCoverage: result.verdict === "pass" ? "satisfied" : "required",
    }
  } catch {
    return {
      workspace: "unknown",
      sdkChangesDetected: "unknown",
      intentCoverage: "unknown",
    }
  }
}

export async function writeSyncPackChangeIntent(input: {
  readonly packageRoot?: string
  readonly id: string
  readonly title: string
  readonly owner: string
  readonly summary?: string
}): Promise<{
  readonly filePath: string
  readonly intent: SyncPackChangeIntent
}> {
  const packageRoot = path.resolve(input.packageRoot ?? findFeaturesSdkRoot())
  const changeIntentsRoot = resolveChangeIntentsRoot(packageRoot)
  const intent = syncPackChangeIntentSchema.parse(
    createSyncPackChangeIntentTemplate(input)
  )
  const filePath = path.join(changeIntentsRoot, `${intent.id}.intent.json`)

  if (existsSync(filePath)) {
    throw new Error(`Intent file already exists: ${filePath}`)
  }

  await mkdir(changeIntentsRoot, { recursive: true })
  await writeFile(filePath, `${JSON.stringify(intent, null, 2)}\n`, "utf8")

  return {
    filePath,
    intent,
  }
}
