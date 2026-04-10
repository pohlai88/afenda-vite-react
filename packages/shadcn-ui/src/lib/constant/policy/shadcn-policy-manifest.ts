import { defineConstMap } from "../schema/shared"

import { type ShadcnPolicy, shadcnPolicy } from "./shadcn-policy"
import { policyManifestSchema } from "./policy-manifest-schema"

export const SHADCN_POLICY_MANIFEST_VERSION = "1.0.0"

type ShadcnPolicyField = keyof ShadcnPolicy

const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

const RUNTIME = "packages/shadcn-ui/src/lib/constant/validate-constants.ts" as const
const DRIFT_AST = "scripts/check-ui-drift-ast.ts" as const

function entry(input: {
  field: ShadcnPolicyField
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

export const shadcnPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "shadcnPolicy",
    policyVersion: SHADCN_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "requireWrappedPrimitiveConsumption",
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
          "Doctrine tied to ownershipPolicy.uiOwnerRoots; drift AST import rules align with radixPolicy + importPolicy. Dedicated per-field AST proof optional.",
      }),
      entry({
        field: "requireDefaultShadcnStructure",
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
          "forwardRef/cn/spread conventions; see schema JSDoc. Mix of structural heuristics — promote with explicit AST rules when ready.",
      }),
      entry({
        field: "allowLocalVariantFactoryOutsideUiOwner",
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
          "Variant factory placement: where cva()/factory helpers may be declared. Distinct from allowFeatureLevelVariantMapping (hand-written variant→class maps) and from CVA package import allowCvaOutsideUiOwner.",
      }),
      entry({
        field: "allowCvaOutsideUiOwner",
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
          "class-variance-authority import ownership; validated with importPolicy.cvaImportAllowedSourcePathPrefixes. Cross-checked in validate-constants.",
      }),
      entry({
        field: "requireGovernedCnHelper",
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
          "cn() import must match importPolicy allowed paths; UIX-AST-IMPORT-003 in check-ui-drift-ast when requireGovernedCnHelper is true.",
      }),
      entry({
        field: "requireDataSlotAttribute",
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
          "Compound/slot components from UI owners; not every leaf. May overlap shell/registry contracts — wire AST or registry checks before promoting.",
      }),
      entry({
        field: "allowFeatureLevelVariantMapping",
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
          "Semantic: local variant key → Tailwind class string tables in features. Distinct from variant factory location (allowLocalVariantFactoryOutsideUiOwner), CVA imports (allowCvaOutsideUiOwner), and componentPolicy.allowFeatureLevelVariantDefinition (broader feature variant definition). Future AST when mapped.",
      }),
    ],
  })
)

export const shadcnPolicyManifestFields = Object.freeze(
  shadcnPolicyManifest.entries.map((e) => e.field)
)

export const shadcnPolicyCanonicalFields = Object.freeze(
  Object.keys(shadcnPolicy) as ShadcnPolicyField[]
)

export type ShadcnPolicyManifest = typeof shadcnPolicyManifest
