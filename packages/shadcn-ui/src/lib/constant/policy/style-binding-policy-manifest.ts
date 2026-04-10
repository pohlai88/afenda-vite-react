import { defineConstMap } from "../schema/shared"

import { type StyleBindingPolicy, styleBindingPolicy } from "./style-binding"
import { policyManifestSchema } from "./policy-manifest-schema"

export const STYLE_BINDING_POLICY_MANIFEST_VERSION = "1.0.0"

type StyleBindingPolicyField = keyof StyleBindingPolicy

const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

const RUNTIME = "packages/shadcn-ui/src/lib/constant/validate-constants.ts" as const

function entry(input: {
  field: StyleBindingPolicyField
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

export const styleBindingPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "styleBindingPolicy",
    policyVersion: STYLE_BINDING_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "allowedGlobalStyleOwners",
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
          "Authoritative owner envelope for global style/token roots. Ordering and uniqueness validated in schema and validate-constants.",
      }),
      entry({
        field: "primaryGlobalStyleOwner",
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
          "Canonical primary owner must be included in allowedGlobalStyleOwners.",
      }),
      entry({
        field: "requireGlobalTokenLayer",
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
          "Global token layer requirement; cross-checks with semantic-slot requirement.",
      }),
      entry({
        field: "requireSemanticColorSlots",
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
          "Semantic slot requirement paired with requireGlobalTokenLayer in superRefine.",
      }),
      entry({
        field: "requireShellVariableLayer",
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
        notes: "Requires governed shell variable layer ownership.",
      }),
      entry({
        field: "requireDensityVariableLayer",
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
        notes: "Requires governed density variable layer ownership.",
      }),
      entry({
        field: "allowComponentLocalSemanticColorDefinition",
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
          "Feature/component semantic-color redefinition gate outside governed token layer.",
      }),
      entry({
        field: "allowFeatureLevelGlobalStyleFork",
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
        notes: "Feature-level global style fork escape hatch.",
      }),
      entry({
        field: "allowFeatureLevelTokenAliasFork",
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
        notes: "Feature-level alias-layer fork escape hatch.",
      }),
      entry({
        field: "requireComponentsToConsumeTokenOutputs",
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
          "Components consume governed token outputs instead of local visual invention.",
      }),
      entry({
        field: "requireMetadataBoundStylesToUseGlobalLayer",
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
          "Metadata-driven style bindings must resolve through governed global/token layer.",
      }),
    ],
  }),
)

export const styleBindingPolicyManifestFields = Object.freeze(
  styleBindingPolicyManifest.entries.map((e) => e.field)
)

export const styleBindingPolicyCanonicalFields = Object.freeze(
  Object.keys(styleBindingPolicy) as StyleBindingPolicyField[]
)

export type StyleBindingPolicyManifest = typeof styleBindingPolicyManifest
