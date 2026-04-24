import { existsSync } from "node:fs"
import { readdir, readFile, stat } from "node:fs/promises"
import path from "node:path"

import {
  countFindings,
  createFindingRemediation,
  type SyncPackFinding,
  type SyncPackFindingResult,
  type SyncPackFindingSeverity,
} from "../finding.js"
import { appCandidateSchema } from "../schema/candidate.schema.js"
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

function sameStringArray(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

async function findPackDirectories(rootDirectory: string): Promise<string[]> {
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
      .map((entry) => findPackDirectories(path.join(rootDirectory, entry.name)))
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
      remediation: createFindingRemediation(
        "Regenerate the pack or restore the numbered file set so it matches the governed template contract.",
        {
          command: "pnpm run feature-sync:generate",
          doc: "docs/sync-pack/README.md",
        }
      ),
    },
  ]
}

async function validateCandidateJson(
  packDirectory: string
): Promise<SyncPackCheckFinding[]> {
  const candidatePath = path.join(packDirectory, "00-candidate.json")
  const rawCandidate = await readFile(candidatePath, "utf8")
  const candidate = appCandidateSchema.parse(JSON.parse(rawCandidate))
  const appId = path.basename(packDirectory)
  const category = path.basename(path.dirname(packDirectory))
  const findings: SyncPackCheckFinding[] = []

  if (candidate.id !== appId) {
    findings.push({
      severity: "error",
      code: "candidate-id-path-mismatch",
      filePath: candidatePath,
      message: `Candidate id ${candidate.id} does not match pack directory ${appId}.`,
      remediation: createFindingRemediation(
        "Rename the pack directory or correct 00-candidate.json so the candidate id matches the path."
      ),
    })
  }

  if (candidate.internalCategory !== category) {
    findings.push({
      severity: "error",
      code: "candidate-category-path-mismatch",
      filePath: candidatePath,
      message: `Candidate category ${candidate.internalCategory} does not match pack category directory ${category}.`,
      remediation: createFindingRemediation(
        "Move the pack into the correct category directory or update 00-candidate.json so the category matches the path."
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
      remediation: createFindingRemediation(
        "Set candidate status to approved or change buildMode away from adopt before implementation handoff."
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
      remediation: createFindingRemediation(
        "Set securityReviewRequired=true for high-sensitivity candidates before approval."
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
        remediation: createFindingRemediation(
          "Replace empty content with Not yet known or complete the section before handoff."
        ),
      })
    }
  }

  return findings
}

async function checkPackDirectory(
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
  const packDirectories = await findPackDirectories(packsRoot)
  const findings: SyncPackCheckFinding[] = []

  if (packDirectories.length === 0) {
    findings.push({
      severity: "error",
      code: "no-generated-packs",
      filePath: packsRoot,
      message: "No Sync-Pack directories found.",
      remediation: createFindingRemediation(
        "Generate planning packs before running check.",
        {
          command: "pnpm run feature-sync:generate",
          doc: "docs/sync-pack/README.md",
        }
      ),
    })
  }

  for (const packDirectory of packDirectories) {
    findings.push(...(await checkPackDirectory(packDirectory)))
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
