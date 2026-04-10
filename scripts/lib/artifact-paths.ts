/**
 * Canonical paths for repo-level generated artifacts (see docs/REPO_ARTIFACT_POLICY.md).
 * Package build outputs stay beside producers (e.g. `apps/web/dist`, `packages/name/dist`).
 */
import path from "node:path"

/** Root-relative bucket for non-source, repo-scoped outputs. */
export const ARTIFACTS_ROOT_NAME = ".artifacts" as const

export function artifactsRoot(repoRoot: string): string {
  return path.join(repoRoot, ARTIFACTS_ROOT_NAME)
}

/** Shell governance JSON snapshots (CI + local). */
export function shellGovernanceReportsDir(repoRoot: string): string {
  return path.join(repoRoot, ARTIFACTS_ROOT_NAME, "reports", "shell-governance")
}
