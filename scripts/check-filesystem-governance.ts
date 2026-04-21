/**
 * Validate repository filesystem governance: promoted shared layers, generic
 * file names, and maximum source-tree depth. This is intentionally narrow and
 * functional-first so the rule system can harden incrementally.
 */

import {
  collectFilesystemGovernanceViolations,
  loadFilesystemGovernanceConfig,
} from "./lib/filesystem-governance"

const config = loadFilesystemGovernanceConfig()
const violations = collectFilesystemGovernanceViolations(config)

if (violations.length === 0) {
  console.log("Filesystem governance check passed.")
  process.exit(0)
}

console.error(
  `Filesystem governance found ${String(violations.length)} violation(s):`
)

for (const violation of violations) {
  console.error(`- [${violation.rule}] ${violation.path}`)
  console.error(`  ${violation.message}`)
}

process.exit(1)
