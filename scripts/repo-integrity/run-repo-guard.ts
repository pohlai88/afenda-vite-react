import { loadAfendaConfig, workspaceRoot } from "../config/afenda-config.js"
import {
  formatRepoGuardHumanReport,
  runRepoGuard,
  writeRepoGuardEvidence,
} from "../lib/repo-guard.js"
import { repoGuardPolicy } from "./repo-guard-policy.js"

const config = await loadAfendaConfig()
const args = new Set(process.argv.slice(2))
const mode = args.has("--ci") ? "ci" : "human"
const writeEvidence =
  !args.has("--read-only") && (args.has("--ci") || args.has("--report"))

const result = await runRepoGuard({
  config,
  policy: repoGuardPolicy,
  mode,
  repoRoot: workspaceRoot,
})

const repoGuardDomain = config.governance.domains.find(
  (domain) => domain.id === "GOV-TRUTH-001"
)

if (writeEvidence) {
  if (!repoGuardDomain) {
    throw new Error(
      'Missing governance domain "GOV-TRUTH-001" required by the repository integrity guard.'
    )
  }

  await writeRepoGuardEvidence({
    policy: repoGuardPolicy,
    report: result.report,
    domain: repoGuardDomain,
    repoRoot: workspaceRoot,
  })
}

console.log(formatRepoGuardHumanReport(result.report))

if (args.has("--report") && !args.has("--ci")) {
  process.exit(0)
}

process.exit(result.exitCode)
