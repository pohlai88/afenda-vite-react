import path from "node:path"

import type {
  SyncPackFinding,
  SyncPackFindingResult,
  SyncPackFindingSeverity,
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

export async function runSyncPackValidate(
  options: RunSyncPackValidateOptions = {}
): Promise<SyncPackValidateResult> {
  const seedPath = path.resolve(
    options.seedPath ?? resolveSeedPath(options.packageRoot)
  )
  const candidates = await readSeedCandidates(seedPath)

  return {
    seedPath,
    candidateCount: candidates.length,
    findings: [],
    errorCount: 0,
    warningCount: 0,
  }
}
