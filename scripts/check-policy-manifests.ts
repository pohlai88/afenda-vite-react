/**
 * Policy manifest validator.
 *
 * Verifies manifest schema, canonical parity, and fixture-path references for
 * all governance policy manifests.
 *
 * Usage:
 *   pnpm run script:check-policy-manifests
 */
import path from "node:path"
import { existsSync } from "node:fs"

import { classPolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/class-policy-manifest.ts"
import { componentPolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/component-policy-manifest.ts"
import { importPolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/import-policy-manifest.ts"
import { metadataUiPolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/metadata-ui-policy-manifest.ts"
import { ownershipPolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/ownership-policy-manifest.ts"
import { radixContractPolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/radix-contract-policy-manifest.ts"
import { radixPolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/radix-policy-manifest.ts"
import { reactPolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/react-policy-manifest.ts"
import { shadcnPolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/shadcn-policy-manifest.ts"
import { tailwindPolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/tailwind-policy-manifest.ts"
import { validatePolicyManifest } from "../packages/shadcn-ui/src/lib/constant/policy/validate-policy-manifest.ts"

const report = validatePolicyManifest()
const cwd = process.cwd()
const fixturePathErrors: string[] = []

for (const manifest of [
  classPolicyManifest,
  componentPolicyManifest,
  importPolicyManifest,
  metadataUiPolicyManifest,
  ownershipPolicyManifest,
  radixPolicyManifest,
  radixContractPolicyManifest,
  reactPolicyManifest,
  shadcnPolicyManifest,
  tailwindPolicyManifest,
]) {
  for (const entry of manifest.entries) {
    for (const fixturePath of [
      ...entry.fixturePaths.valid,
      ...entry.fixturePaths.invalid,
      ...entry.fixturePaths.edge,
    ]) {
      const absolute = path.resolve(cwd, fixturePath)
      if (!existsSync(absolute)) {
        fixturePathErrors.push(
          `Fixture path does not exist for "${manifest.policyName}.${entry.field}": ${fixturePath}`
        )
      }
    }
  }
}

for (const warning of report.warnings) {
  const where = warning.field ? ` (${warning.field})` : ""
  console.warn(`[WARNING] ${warning.code}${where}: ${warning.message}`)
}

if (!report.ok || fixturePathErrors.length > 0) {
  for (const issue of report.errors) {
    const where = issue.field ? ` (${issue.field})` : ""
    console.error(`[ERROR] ${issue.code}${where}: ${issue.message}`)
  }
  for (const issue of fixturePathErrors) {
    console.error(`[ERROR] fixture_path_missing: ${issue}`)
  }
  process.exit(1)
}

console.log(
  `policy manifests: ok (${report.errors.length} errors, ${report.warnings.length} warnings)`
)
