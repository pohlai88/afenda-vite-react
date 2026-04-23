import {
  evaluateGeneratedArtifactGovernance,
  loadGeneratedArtifactGovernanceConfig,
} from "./lib/generated-artifact-governance.js"

const config = loadGeneratedArtifactGovernanceConfig()
const evaluation = evaluateGeneratedArtifactGovernance(config)

if (evaluation.violations.length > 0) {
  console.error(
    `Generated artifact governance found ${String(evaluation.violations.length)} violation(s):`
  )
  for (const violation of evaluation.violations) {
    console.error(
      `- [${violation.rule}] ${violation.path}\n  ${violation.message}`
    )
  }
  process.exitCode = 1
} else {
  console.log("Generated artifact governance check passed.")
}
