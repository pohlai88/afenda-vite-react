import { defineConstMap } from "../schema/shared"

import { type OwnershipPolicy, ownershipPolicy } from "./ownership-policy"
import { policyManifestSchema } from "./policy-manifest-schema"

export const OWNERSHIP_POLICY_MANIFEST_VERSION = "1.0.0"

type OwnershipPolicyField = keyof OwnershipPolicy

const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

const RUNTIME = "packages/shadcn-ui/src/lib/constant/validate-constants.ts" as const
const DRIFT_AST = "scripts/check-ui-drift-ast.ts" as const
const WRAPPER_CONTRACTS = "scripts/check-ui-wrapper-contracts.ts" as const
const SHELL_GOV_REPORT = "scripts/check-shell-governance-report.ts" as const

function entry(input: {
  field: OwnershipPolicyField
  lifecycle: "enforced" | "review-only" | "backlog" | "deprecated"
  consumerKind: "eslint" | "ci-script" | "runtime-validator" | "manual-review"
  consumers: readonly [string, ...string[]] | readonly []
  fixtureCoverage: { valid: boolean; invalid: boolean; edge: boolean }
  fixturePaths: {
    valid: readonly string[]
    invalid: readonly string[]
    edge: readonly string[]
  }
  ciBlocking: boolean
  canonical: boolean
  compatibilityOnly: boolean
  phase:
    | "phase-1-structure"
    | "phase-2-objective-enforcement"
    | "phase-3-semantic-enforcement"
    | "phase-4-legacy-removal"
  legacySunset: string | null
  notes: string
}) {
  return input
}

export const ownershipPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "ownershipPolicy",
    policyVersion: OWNERSHIP_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "uiOwnerRoots",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME, DRIFT_AST],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-1-structure",
        legacySunset: null,
        notes:
          "Authority list for governed UI owners; paths exist in validate-constants. AST drift uses this for governed vs feature classification. Not fixture-backed at manifest level yet; promote only with path-level fixture proof if needed.",
      }),
      entry({
        field: "wrapperContractScanRoots",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [RUNTIME, WRAPPER_CONTRACTS],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Subset of uiOwnerRoots: enforced in validate-constants (every entry must appear in uiOwnerRoots). Wrapper contract scanner audits only these roots. Stronger structural invariant than path-only fields; still review-only until optional dedicated fixture runner.",
      }),
      entry({
        field: "productRoots",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [RUNTIME, DRIFT_AST, SHELL_GOV_REPORT],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-1-structure",
        legacySunset: null,
        notes:
          "Broad drift-scan roots (apps + packages), not “product app code only.” Name is legacy; see ownership-policy schema JSDoc. Consumers use this as inclusion roots for scans and reports.",
      }),
      entry({
        field: "semanticOwnerRoots",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [RUNTIME, DRIFT_AST],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Truth/semantic authority roots; AST uses these to exempt semantic adapters from some feature-level rules. Validated for path existence in validate-constants.",
      }),
      entry({
        field: "tokenOwnerFiles",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-1-structure",
        legacySunset: null,
        notes:
          "File-based token authority entrypoints today; validate-constants checks paths exist. Do not add parallel token authority outside this list without governance review. Future expansion to path-based authority (e.g. tokenOwnerPaths) may require a deliberate migration.",
      }),
      entry({
        field: "inlineStyleExceptionRoots",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [RUNTIME, DRIFT_AST],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Narrow exception surface only: paths where inline-style policy may be relaxed by checker logic. Not a general styling freedom zone and not a substitute for tokens or governed components. Additions require explicit governance review to avoid erosion.",
      }),
    ],
  })
)

export const ownershipPolicyManifestFields = Object.freeze(
  ownershipPolicyManifest.entries.map((e) => e.field)
)

export const ownershipPolicyCanonicalFields = Object.freeze(
  Object.keys(ownershipPolicy) as OwnershipPolicyField[]
)

export type OwnershipPolicyManifest = typeof ownershipPolicyManifest
