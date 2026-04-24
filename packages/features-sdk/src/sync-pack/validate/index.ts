import path from "node:path"

import { ZodError } from "zod"

import {
  countFindings,
  createFindingRemediation,
  type SyncPackFinding,
  type SyncPackFindingResult,
  type SyncPackFindingSeverity,
} from "../finding.js"
import { readSeedCandidates, resolveSeedPath } from "../workspace.js"

export type SyncPackValidateSeverity = SyncPackFindingSeverity

export type SyncPackValidateFinding = SyncPackFinding

export interface SyncPackValidateResult extends SyncPackFindingResult<SyncPackValidateFinding> {
  readonly seedPath: string
  readonly candidateCount: number
}

export interface RunSyncPackValidateOptions {
  readonly packageRoot?: string
  readonly seedPath?: string
}

const metadataReferenceDocPath = "docs/sync-pack/metadata-reference.md" as const
const validationRemediationDocPath =
  "docs/sync-pack/finding-remediation-catalog.md" as const
const validateCommand = "pnpm run feature-sync:validate" as const

function createValidateRemediation(
  action: string,
  doc: string = validationRemediationDocPath
): ReturnType<typeof createFindingRemediation> {
  return createFindingRemediation(action, {
    command: validateCommand,
    doc,
  })
}

function summarizeZodIssues(error: ZodError): string {
  return error.issues
    .slice(0, 3)
    .map((issue) => {
      const issuePath = issue.path.length > 0 ? issue.path.join(".") : "root"
      return `${issuePath}: ${issue.message}`
    })
    .join("; ")
}

function normalizeValidateError(
  seedPath: string,
  error: unknown
): SyncPackValidateFinding {
  if (error instanceof SyntaxError) {
    return {
      severity: "error",
      code: "invalid-seed-json",
      filePath: seedPath,
      message: `Seed JSON is invalid: ${error.message}`,
      remediation: createValidateRemediation(
        `Fix the JSON syntax in ${seedPath}, then rerun Sync-Pack validate.`
      ),
    }
  }

  if (error instanceof ZodError) {
    return {
      severity: "error",
      code: "invalid-seed-candidate",
      filePath: seedPath,
      message: `Seed candidate data is invalid: ${summarizeZodIssues(error)}`,
      remediation: createValidateRemediation(
        `Correct the invalid candidate fields in ${seedPath}, then rerun Sync-Pack validate.`,
        metadataReferenceDocPath
      ),
    }
  }

  if (
    error instanceof Error &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    if (error.code === "ENOENT") {
      return {
        severity: "error",
        code: "missing-seed-file",
        filePath: seedPath,
        message: `Seed file does not exist: ${seedPath}`,
        remediation: createValidateRemediation(
          `Restore ${seedPath} or pass the correct seed path, then rerun Sync-Pack validate.`
        ),
      }
    }

    return {
      severity: "error",
      code: "seed-read-failed",
      filePath: seedPath,
      message: `Unable to read or validate the seed file: ${error.message}`,
      remediation: createValidateRemediation(
        `Fix the seed access or workspace discovery issue for ${seedPath}, then rerun Sync-Pack validate.`
      ),
    }
  }

  return {
    severity: "error",
    code: "seed-read-failed",
    filePath: seedPath,
    message: `Unable to validate the seed file: ${String(error)}`,
    remediation: createValidateRemediation(
      `Fix the seed validation issue for ${seedPath}, then rerun Sync-Pack validate.`
    ),
  }
}

export async function runSyncPackValidate(
  options: RunSyncPackValidateOptions = {}
): Promise<SyncPackValidateResult> {
  let seedPath = options.seedPath

  try {
    seedPath = path.resolve(seedPath ?? resolveSeedPath(options.packageRoot))
    const candidates = await readSeedCandidates(seedPath)

    return {
      seedPath,
      candidateCount: candidates.length,
      findings: [],
      errorCount: 0,
      warningCount: 0,
    }
  } catch (error) {
    const resolvedSeedPath = path.resolve(
      seedPath ?? options.packageRoot ?? process.cwd()
    )
    const findings = [normalizeValidateError(resolvedSeedPath, error)]
    const { errorCount, warningCount } = countFindings(findings)

    return {
      seedPath: resolvedSeedPath,
      candidateCount: 0,
      findings,
      errorCount,
      warningCount,
    }
  }
}
