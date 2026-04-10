import { defineConstMap } from "../schema/shared"

import { type RadixPolicy, radixPolicy } from "./radix-policy"
import { policyManifestSchema } from "./policy-manifest-schema"

export const RADIX_POLICY_MANIFEST_VERSION = "1.0.0"

type RadixPolicyField = keyof RadixPolicy

const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

const RUNTIME = "packages/shadcn-ui/src/lib/constant/validate-constants.ts" as const
const DRIFT_AST = "scripts/check-ui-drift-ast.ts" as const

function entry(input: {
  field: RadixPolicyField
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

export const radixPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "radixPolicy",
    policyVersion: RADIX_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "allowDirectPrimitiveImportOutsideUiOwner",
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
          "AST import checks use this with ownershipPolicy.uiOwnerRoots. Policy integrity in schema + validate-constants; fixture-backed enforcement promotion is optional.",
      }),
      entry({
        field: "requirePrimitiveWrappingInUiOwner",
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
          "Doctrine for wrapper ownership; cross-checks in validate-constants with import/radix alignment. Not individually AST-proven per field in v1 manifest.",
      }),
      entry({
        field: "allowAsChild",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Composition stance; radixContractPolicy warns cover related wrapper patterns. No dedicated AST rule id tied solely to this boolean in manifest v1.",
      }),
      entry({
        field: "allowCustomBehaviorForks",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Semantic boundary for forking Radix interaction semantics outside governed wrappers; see schema JSDoc. Enforcement depth follows future AST heuristics.",
      }),
      entry({
        field: "allowAdHocAccessibilityOverrides",
        lifecycle: "review-only",
        consumerKind: "runtime-validator",
        consumers: [RUNTIME],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "ARIA/focus/keyboard override stance vs wrapper contract; see schema JSDoc. Promote with explicit rules when ready.",
      }),
      entry({
        field: "allowedPrimitivePackages",
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
          "Exact npm package allowlist; Zod regex + duplicate rejection + validate-constants uniqueness. AST import checks consume the allowlist via governance loader.",
      }),
    ],
  })
)

export const radixPolicyManifestFields = Object.freeze(
  radixPolicyManifest.entries.map((e) => e.field)
)

export const radixPolicyCanonicalFields = Object.freeze(
  Object.keys(radixPolicy) as RadixPolicyField[]
)

export type RadixPolicyManifest = typeof radixPolicyManifest
