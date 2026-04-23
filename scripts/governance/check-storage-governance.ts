import {
  evaluateStorageGovernance,
  loadStorageGovernanceConfig,
} from "../lib/storage-governance.js"

const config = loadStorageGovernanceConfig()
const evaluation = evaluateStorageGovernance(config)

if (evaluation.violations.length > 0) {
  console.error(
    `Storage governance found ${String(evaluation.violations.length)} violation(s):`
  )
  for (const violation of evaluation.violations) {
    console.error(
      `- [${violation.rule}] ${violation.path}\n  ${violation.message}`
    )
  }
  process.exitCode = 1
} else {
  console.log("Storage governance check passed.")
}
