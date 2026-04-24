import { existsSync } from "node:fs"
import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"

import { ZodError } from "zod"

import {
  countFindings,
  createFindingRemediation,
  type SyncPackFinding,
  type SyncPackFindingResult,
  type SyncPackFindingSeverity,
} from "../finding.js"
import {
  appCandidateSchema,
  type AppCandidate,
} from "../schema/candidate.schema.js"
import {
  getRequiredPackFileNames,
  type PackFileName,
} from "../schema/pack-template.schema.js"
import { resolveGeneratedPacksPath } from "../workspace.js"

export type SyncPackCheckSeverity = SyncPackFindingSeverity

export type SyncPackCheckFinding = SyncPackFinding

export interface SyncPackCheckResult extends SyncPackFindingResult<SyncPackCheckFinding> {
  readonly packsRoot: string
  readonly checkedPackCount: number
}

export interface CheckGeneratedPacksOptions {
  readonly packsRoot?: string
}

const requiredPackFileNames = getRequiredPackFileNames()
const requiredPackFileNameSet = new Set<string>(requiredPackFileNames)
const findingRemediationDocPath =
  "docs/sync-pack/finding-remediation-catalog.md" as const
const packCheckCommand = "pnpm run feature-sync:check" as const
const generateCommand = "pnpm run feature-sync:generate" as const

function createPackCheckRemediation(
  action: string,
  command: string = packCheckCommand
): ReturnType<typeof createFindingRemediation> {
  return createFindingRemediation(action, {
    command,
    doc: findingRemediationDocPath,
  })
}

function sameStringArray(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

export async function findGeneratedPackDirectories(
  rootDirectory: string
): Promise<string[]> {
  if (!existsSync(rootDirectory)) {
    return []
  }

  const rootStat = await stat(rootDirectory)

  if (!rootStat.isDirectory()) {
    return []
  }

  const entries = await readdir(rootDirectory, { withFileTypes: true })
  const fileNames = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  if (fileNames.includes("00-candidate.json")) {
    return [rootDirectory]
  }

  const nestedDirectories = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map((entry) =>
        findGeneratedPackDirectories(path.join(rootDirectory, entry.name))
      )
  )

  return nestedDirectories.flat().sort()
}

function validateFileContract(
  packDirectory: string,
  actualFileNames: readonly string[]
): SyncPackCheckFinding[] {
  const expectedFileNames = [...requiredPackFileNames]
  const sortedActualFileNames = [...actualFileNames].sort()

  if (sameStringArray(sortedActualFileNames, expectedFileNames)) {
    return []
  }

  const missingFiles = expectedFileNames.filter(
    (fileName) => !actualFileNames.includes(fileName)
  )
  const extraFiles = actualFileNames.filter(
    (fileName) => !requiredPackFileNameSet.has(fileName)
  )

  return [
    {
      severity: "error",
      code: "pack-file-contract-mismatch",
      filePath: packDirectory,
      message: `Expected exactly 11 Sync-Pack files. Missing: ${missingFiles.join(", ") || "none"}. Extra: ${extraFiles.join(", ") || "none"}.`,
      remediation: createPackCheckRemediation(
        `Regenerate the pack at ${packDirectory} or restore the governed numbered file set, then rerun Sync-Pack check.`,
        generateCommand
      ),
    },
  ]
}

async function validateCandidateJson(
  packDirectory: string
): Promise<SyncPackCheckFinding[]> {
  const candidatePath = path.join(packDirectory, "00-candidate.json")
  let candidate: AppCandidate

  try {
    const rawCandidate = await readFile(candidatePath, "utf8")
    candidate = appCandidateSchema.parse(JSON.parse(rawCandidate))
  } catch (error) {
    if (error instanceof SyntaxError) {
      return [
        {
          severity: "error",
          code: "invalid-candidate-json",
          filePath: candidatePath,
          message: `00-candidate.json is not valid JSON: ${error.message}`,
          remediation: createPackCheckRemediation(
            `Fix the JSON syntax in ${candidatePath}, then rerun Sync-Pack check.`
          ),
        },
      ]
    }

    if (error instanceof ZodError) {
      const issueSummary = error.issues
        .slice(0, 3)
        .map((issue) => {
          const issuePath =
            issue.path.length > 0 ? issue.path.join(".") : "root"
          return `${issuePath}: ${issue.message}`
        })
        .join("; ")

      return [
        {
          severity: "error",
          code: "invalid-candidate-schema",
          filePath: candidatePath,
          message: `00-candidate.json does not satisfy the candidate schema: ${issueSummary}`,
          remediation: createPackCheckRemediation(
            `Correct the invalid candidate fields in ${candidatePath}, then rerun Sync-Pack check.`
          ),
        },
      ]
    }

    return [
      {
        severity: "error",
        code: "candidate-read-failed",
        filePath: candidatePath,
        message: `Unable to read or validate 00-candidate.json: ${error instanceof Error ? error.message : String(error)}`,
        remediation: createPackCheckRemediation(
          `Restore ${candidatePath} and rerun Sync-Pack check.`
        ),
      },
    ]
  }

  const appId = path.basename(packDirectory)
  const category = path.basename(path.dirname(packDirectory))
  const findings: SyncPackCheckFinding[] = []

  if (candidate.id !== appId) {
    findings.push({
      severity: "error",
      code: "candidate-id-path-mismatch",
      filePath: candidatePath,
      message: `Candidate id ${candidate.id} does not match pack directory ${appId}.`,
      remediation: createPackCheckRemediation(
        `Rename ${packDirectory} or correct ${candidatePath} so the candidate id matches the directory path.`
      ),
    })
  }

  if (candidate.internalCategory !== category) {
    findings.push({
      severity: "error",
      code: "candidate-category-path-mismatch",
      filePath: candidatePath,
      message: `Candidate category ${candidate.internalCategory} does not match pack category directory ${category}.`,
      remediation: createPackCheckRemediation(
        `Move ${packDirectory} into the correct category directory or update ${candidatePath} so internalCategory matches the path.`
      ),
    })
  }

  if (candidate.buildMode === "adopt" && candidate.status !== "approved") {
    findings.push({
      severity: "error",
      code: "adopt-requires-approval",
      filePath: candidatePath,
      message:
        "Build mode adopt requires status approved before implementation handoff.",
      remediation: createPackCheckRemediation(
        `Update ${candidatePath} so adopt candidates are approved before handoff, or change buildMode away from adopt.`
      ),
    })
  }

  if (
    candidate.dataSensitivity === "high" &&
    !candidate.securityReviewRequired
  ) {
    findings.push({
      severity: "error",
      code: "high-sensitivity-requires-security-review",
      filePath: candidatePath,
      message: "High data sensitivity requires securityReviewRequired=true.",
      remediation: createPackCheckRemediation(
        `Set securityReviewRequired=true in ${candidatePath} for high-sensitivity candidates before approval.`
      ),
    })
  }

  return findings
}

async function validateMarkdownFiles(
  packDirectory: string,
  actualFileNames: readonly string[]
): Promise<SyncPackCheckFinding[]> {
  const markdownFileNames = actualFileNames.filter(
    (fileName): fileName is Exclude<PackFileName, "00-candidate.json"> =>
      fileName.endsWith(".md") && requiredPackFileNameSet.has(fileName)
  )
  const findings: SyncPackCheckFinding[] = []

  for (const fileName of markdownFileNames) {
    const filePath = path.join(packDirectory, fileName)
    const content = await readFile(filePath, "utf8")

    if (content.trim().length === 0) {
      findings.push({
        severity: "error",
        code: "empty-pack-section",
        filePath,
        message: `${fileName} is empty. Unknown sections must say Not yet known.`,
        remediation: createPackCheckRemediation(
          `Replace the empty section in ${filePath} with Not yet known or complete the content before handoff.`
        ),
      })
    }
  }

  return findings
}

export async function checkGeneratedPackDirectory(
  packDirectory: string
): Promise<SyncPackCheckFinding[]> {
  const entries = await readdir(packDirectory, { withFileTypes: true })
  const actualFileNames = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
  const contractFindings = validateFileContract(packDirectory, actualFileNames)

  if (contractFindings.some((finding) => finding.severity === "error")) {
    return contractFindings
  }

  return [
    ...contractFindings,
    ...(await validateCandidateJson(packDirectory)),
    ...(await validateMarkdownFiles(packDirectory, actualFileNames)),
  ]
}

export async function checkGeneratedPacks(
  options: CheckGeneratedPacksOptions = {}
): Promise<SyncPackCheckResult> {
  const packsRoot = path.resolve(
    options.packsRoot ?? resolveGeneratedPacksPath()
  )
  const packDirectories = await findGeneratedPackDirectories(packsRoot)
  const findings: SyncPackCheckFinding[] = []

  if (packDirectories.length === 0) {
    findings.push({
      severity: "error",
      code: "no-generated-packs",
      filePath: packsRoot,
      message: "No Sync-Pack directories found.",
      remediation: createPackCheckRemediation(
        `Generate planning packs under ${packsRoot} before running Sync-Pack check.`,
        generateCommand
      ),
    })
  }

  for (const packDirectory of packDirectories) {
    findings.push(...(await checkGeneratedPackDirectory(packDirectory)))
  }

  const { errorCount, warningCount } = countFindings(findings)

  return {
    packsRoot,
    checkedPackCount: packDirectories.length,
    findings,
    errorCount,
    warningCount,
  }
}
