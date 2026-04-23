import fs from "node:fs/promises"
import path from "node:path"

import type { RepoGuardWaiverRegistry } from "@afenda/governance-toolchain"

export type {
  RepoGuardWaiver,
  RepoGuardWaiverRegistry,
  RepoGuardWaiverReport,
} from "@afenda/governance-toolchain"
export {
  applyRepoGuardWaivers,
  buildRepoGuardWaiverCheckResult,
  evaluateRepoGuardWaiverRegistry,
} from "@afenda/governance-toolchain"

export async function loadRepoGuardWaiverRegistry(
  repoRoot: string,
  relativePath: string
): Promise<RepoGuardWaiverRegistry> {
  const raw = await fs.readFile(path.join(repoRoot, relativePath), "utf8")
  return JSON.parse(raw) as RepoGuardWaiverRegistry
}
