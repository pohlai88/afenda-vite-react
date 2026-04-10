import { defineConstMap } from "../schema/shared"

import { type ClassPolicy, classPolicy } from "./class-policy"
import { policyManifestSchema } from "./policy-manifest-schema"

export const CLASS_POLICY_MANIFEST_VERSION = "1.1.0"

type ClassPolicyField = keyof ClassPolicy
const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

function entry(input: {
  field: ClassPolicyField
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

export const classPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "classPolicy",
    policyVersion: CLASS_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "allowRawPaletteClasses",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift.ts",
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Raw palette usage is detected in drift checks and cross-policy consistency checks.",
      }),
      entry({
        field: "allowArbitraryValuesInFeatures",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift.ts",
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Arbitrary Tailwind values are scanned, but fixture-backed confidence is pending.",
      }),
      entry({
        field: "allowInlineStyleAttributeInProductUi",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift.ts",
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Inline style usage is checked by drift scripts and kept aligned with tailwind policy.",
      }),
      entry({
        field: "allowHexRgbHslColorsInProductUi",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift.ts",
          "scripts/check-ui-drift-ast.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Hardcoded color checks are active but still classified as review-only until fixture coverage lands.",
      }),
      entry({
        field: "allowCvaOutsideUiPackage",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift.ts",
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Direct CVA usage outside the UI owner is checked by import drift rules.",
      }),
      entry({
        field: "allowDirectRadixImportOutsideUiPackage",
        lifecycle: "review-only",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift.ts",
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Direct Radix primitive import checks are active in both regex and AST drift checks.",
      }),
      entry({
        field: "allowDirectTokenUsageInFeatures",
        lifecycle: "review-only",
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
          "Token-level drift checks exist in AST scanning but need fixture-backed hardening.",
      }),
      entry({
        field: "maxRecommendedClassNameTokensInFeatures",
        lifecycle: "backlog",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/policy/class-governance-scope.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Complexity threshold is scanned, but policy status remains backlog until scorecard fixtures are defined.",
      }),
      entry({
        field: "allowAsChildOutsideUiPackage",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: [],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes:
          "Wave 1 ESLint rule planned; paired with radixPolicy.allowAsChild in validate-constants.",
      }),
      entry({
        field: "allowSlotOutsideUiPackage",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: [],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes: "Wave 1 ESLint no-slot-outside-ui planned; import + JSX usage.",
      }),
      entry({
        field: "allowFeatureLevelVariantMaps",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: ["packages/eslint-config/afenda-ui-plugin/no-local-semantic-map-rule.cjs"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Overlaps componentPolicy / shadcnPolicy; dedicated no-feature-variant-maps rule planned.",
      }),
      entry({
        field: "allowFeatureLevelStatusToClassMapping",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: [],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes: "Semantic drift: status → class maps; complements no-local-semantic-map.",
      }),
      entry({
        field: "allowFeatureLevelSemanticColorMapping",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: [],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes: "Local semantic color policy recreation outside design system.",
      }),
      entry({
        field: "allowFeatureLevelTruthToVariantMapping",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: ["scripts/check-ui-drift-ast.ts"],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes: "Truth/reconciliation → badge/alert variant drift; AST truth rules partially overlap.",
      }),
      entry({
        field: "allowArbitraryZIndex",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: [],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes: "Stacking escalation governance; Wave 1 styling rule planned.",
      }),
      entry({
        field: "allowPositioningUtilities",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: [],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes: "absolute/fixed/inset drift; warn/error severity TBD in rule options.",
      }),
      entry({
        field: "allowGridTemplateOverrides",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: [],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-2-objective-enforcement",
        legacySunset: null,
        notes: "Complex grid template overrides in feature UI.",
      }),
      entry({
        field: "allowClassNamePassThrough",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: [],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes: "Wrapper className tunnel governance; scope-aware severity in rule design.",
      }),
      entry({
        field: "allowCnComposition",
        lifecycle: "backlog",
        consumerKind: "eslint",
        consumers: [],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes: "Nested cn() / composition complexity; may pair with CI scorecard.",
      }),
      entry({
        field: "warnClassNameTokenCount",
        lifecycle: "backlog",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/policy/class-governance-scope.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Global warn threshold; align with scopes.* overrides when resolving lane-specific limits.",
      }),
      entry({
        field: "errorClassNameTokenCount",
        lifecycle: "backlog",
        consumerKind: "ci-script",
        consumers: [
          "scripts/check-ui-drift-ast.ts",
          "packages/shadcn-ui/src/lib/constant/policy/class-governance-scope.ts",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes: "Global error threshold; must stay >= warnClassNameTokenCount (Zod + validate-constants).",
      }),
      entry({
        field: "scopes",
        lifecycle: "backlog",
        consumerKind: "runtime-validator",
        consumers: [
          "packages/shadcn-ui/src/lib/constant/validate-constants.ts",
          "packages/shadcn-ui/src/lib/constant/policy/class-governance-scope.ts",
          "packages/eslint-config/afenda-ui-plugin/utils/class-governance-scope.cjs",
        ],
        fixtureCoverage: { valid: false, invalid: false, edge: false },
        fixturePaths: emptyFixturePaths,
        ciBlocking: false,
        canonical: true,
        compatibilityOnly: false,
        phase: "phase-3-semantic-enforcement",
        legacySunset: null,
        notes:
          "Optional per-lane numeric overrides; empty object means use global warn/error/max fields only.",
      }),
    ],
  })
)

export const classPolicyManifestFields = Object.freeze(
  classPolicyManifest.entries.map((entry) => entry.field)
)

export const classPolicyCanonicalFields = Object.freeze(
  Object.keys(classPolicy) as ClassPolicyField[]
)

export type ClassPolicyManifest = typeof classPolicyManifest
