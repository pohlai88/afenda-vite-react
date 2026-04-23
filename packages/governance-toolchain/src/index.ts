export type {
  RepoGuardFinding,
  RepoGuardCheckResult,
  RepoGuardCoverageStatus,
  RepoGuardCoverageEntry,
  RepoGuardCoverageSummary,
  RepoGuardContractBinding,
  RepoGuardReport,
  RepoGuardCliResult,
} from "./contracts/repo-guard.js"
export type {
  RepoGuardWaiver,
  RepoGuardWaiverRegistry,
  RepoGuardWaiverViolation,
  RepoGuardWaiverSoonToExpire,
  RepoGuardWaiverReport,
} from "./contracts/repo-guard-waivers.js"
export type {
  PromotionReadinessCheck,
  PromotionReadinessReport,
} from "./contracts/promotion-readiness.js"
export type {
  DuplicateOverlapPolicy,
  DuplicateOverlapScope,
} from "./contracts/duplicate-overlap.js"
export type {
  SourceEvidenceMismatchBinding,
  SourceEvidenceMismatchGitEntry,
  SourceEvidenceMismatchPolicy,
} from "./contracts/source-evidence-mismatch.js"
export type {
  PlacementOwnershipRule,
  PlacementOwnershipScope,
} from "./contracts/placement-ownership.js"
export type {
  RepoGuardDirtyFilePolicy,
  RepoGuardWorkingTreePolicy,
  RepoGuardWorktreeEntry,
} from "./contracts/repo-guard-worktree.js"
export type { RepoGuardCoverageDefinition } from "./coverage/repo-guard-coverage.js"
export type {
  RepoGuardStatus,
  RepoGuardMode,
  PromotionReadinessStatus,
} from "./status/status.js"
export { buildRepoGuardCoverage } from "./coverage/repo-guard-coverage.js"
export { buildRepoGuardReport } from "./reports/repo-guard-report.js"
export { buildPromotionReadinessReport } from "./reports/promotion-readiness-report.js"
export {
  formatRepoGuardHumanReport,
  formatRepoGuardMarkdownReport,
} from "./formatters/repo-guard-formatters.js"
export {
  formatPromotionReadinessHumanReport,
  formatPromotionReadinessMarkdownReport,
} from "./formatters/promotion-readiness-formatters.js"
export { statusFromRepoGuardFindings } from "./status/repo-guard-findings.js"
export {
  applyRepoGuardWaivers,
  buildRepoGuardWaiverCheckResult,
  evaluateRepoGuardWaiverRegistry,
} from "./waivers/repo-guard-waivers.js"
export { evaluateDuplicateOverlapFindings } from "./evaluators/duplicate-overlap.js"
export { evaluateSourceEvidenceMismatchFindings } from "./evaluators/source-evidence-mismatch.js"
export {
  evaluatePlacementOwnershipFindings,
  resolvePlacementOwnershipScope,
  matchesPlacementOwnershipRule,
  resolveStrongestPlacementOwnershipRules,
} from "./evaluators/placement-ownership.js"
export {
  evaluateDirtyFileCandidates,
  evaluateWorkingTreeFindings,
} from "./evaluators/repo-guard-worktree.js"
export { repoGuardCoverageCatalog } from "./registries/repo-guard-coverage-catalog.js"
export { promotionReadinessCheckCatalog } from "./registries/promotion-readiness-check-catalog.js"
