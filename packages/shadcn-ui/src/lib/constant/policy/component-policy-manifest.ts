import { defineConstMap } from "../schema/shared"

import {
  type ComponentPolicyContract,
  componentPolicyContract,
} from "./component-policy"
import { policyManifestSchema } from "./policy-manifest-schema"

export const COMPONENT_POLICY_MANIFEST_VERSION = "1.0.0"

type ComponentPolicyField = keyof ComponentPolicyContract

const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

function entry(input: {
  field: ComponentPolicyField
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

export const componentPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "componentPolicyContract",
    policyVersion: COMPONENT_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "featureLevelVariantDefinition",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: ["scripts/check-ui-drift.ts", "scripts/check-ui-drift-ast.ts"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Feature-level variant definition is governed by drift checks through compatibility policy booleans.",
      }),
      entry({
        field: "featureLevelSemanticMaps",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: ["scripts/check-ui-drift.ts", "scripts/check-ui-drift-ast.ts"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Semantic map drift is scanned, but promoted enforcement requires fixture-backed tuning.",
      }),
      entry({
        field: "semanticMappingForDomainStatuses",
        lifecycle: "backlog",
        consumerKind: "ci-script",
        consumers: ["scripts/check-ui-drift.ts", "scripts/check-ui-drift-ast.ts"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Domain status mapping requirement exists in policy intent and compatibility booleans; explicit evidence enforcement is pending.",
      }),
      entry({
        field: "sharedEmptyStatePattern",
        lifecycle: "backlog",
        consumerKind: "runtime-validator",
        consumers: ["packages/shadcn-ui/src/lib/constant/validate-constants.ts"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Shared empty-state pattern governance is represented in policy but not yet checked by dedicated AST fixture rules.",
      }),
      entry({
        field: "sharedLoadingStatePattern",
        lifecycle: "backlog",
        consumerKind: "runtime-validator",
        consumers: ["packages/shadcn-ui/src/lib/constant/validate-constants.ts"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Shared loading-state pattern governance is represented in policy but not yet checked by dedicated AST fixture rules.",
      }),
      entry({
        field: "singleGovernedPrimitivePerComponentType",
        lifecycle: "backlog",
        consumerKind: "runtime-validator",
        consumers: ["packages/shadcn-ui/src/lib/constant/validate-constants.ts"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Single primitive ownership is modeled as policy doctrine; static rule coverage is planned.",
      }),
      entry({
        field: "governedComponentsInFeatures",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: ["scripts/check-ui-drift.ts", "scripts/check-ui-drift-ast.ts"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Feature governed-component requirements are actively checked but not yet fixture-promoted.",
      }),
      entry({
        field: "governedDomainToUiMapping",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: ["scripts/check-ui-drift.ts", "scripts/check-ui-drift-ast.ts"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Governed domain-to-UI mapping is checked by drift scripts and should graduate with fixture evidence.",
      }),
      entry({
        field: "noLocalDomainToUiMapping",
        lifecycle: "backlog",
        consumerKind: "ci-script",
        consumers: ["scripts/check-ui-drift-ast.ts"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Canonical no-local-domain-to-ui mapping rule is added in contract and queued for targeted semantic AST enforcement.",
      }),
    ],
  })
)

export const componentPolicyManifestFields = Object.freeze(
  componentPolicyManifest.entries.map((entry) => entry.field)
)

export const componentPolicyCanonicalFields = Object.freeze(
  Object.keys(componentPolicyContract) as ComponentPolicyField[]
)

export type ComponentPolicyManifest = typeof componentPolicyManifest
