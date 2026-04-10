import { defineConstMap } from "../schema/shared"

import { type TailwindPolicy, tailwindPolicy } from "./tailwind-policy"
import { policyManifestSchema } from "./policy-manifest-schema"

export const TAILWIND_POLICY_MANIFEST_VERSION = "1.0.0"

type TailwindPolicyField = keyof TailwindPolicy

const emptyFixturePaths = {
  valid: [] as const,
  invalid: [] as const,
  edge: [] as const,
}

const RUNTIME = "packages/shadcn-ui/src/lib/constant/validate-constants.ts" as const
const DRIFT_AST = "scripts/check-ui-drift-ast.ts" as const

function entry(input: {
  field: TailwindPolicyField
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

export const tailwindPolicyManifest = defineConstMap(
  policyManifestSchema.parse({
    policyName: "tailwindPolicy",
    policyVersion: TAILWIND_POLICY_MANIFEST_VERSION,
    entries: [
      entry({
        field: "requireThemeVariables",
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
          "Theme variable / @theme discipline; align with CSS entry and token pipeline. Cross-checked with classPolicy in validate-constants.",
      }),
      entry({
        field: "requireSemanticColorTokens",
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
          "Semantic color posture; pairs allowRawPaletteClasses and color domain in allowedUtilityDomains.",
      }),
      entry({
        field: "requireThemeInlineMapping",
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
          "Tailwind v4 @theme inline mapping expectations; tie to docs/CSS architecture.",
      }),
      entry({
        field: "allowRawPaletteClasses",
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
          "UIX-AST-COLOR-001 when false; class-string scan in check-ui-drift-ast. Sync with classPolicy.allowRawPaletteClasses.",
      }),
      entry({
        field: "allowHardcodedHexRgbHslColorsInProductUi",
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
          "UIX-AST-COLOR-002 literal color detection in drift AST. Sync with classPolicy where applicable.",
      }),
      entry({
        field: "allowArbitraryValuesInFeatures",
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
          "Gates UIX-AST-CLASS-001 arbitrary bracket values; uses allowedArbitraryValueFragments when false.",
      }),
      entry({
        field: "allowInlineVisualStyleProps",
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
          "UIX-AST-STYLE-001 JSX inline style checks when false. Align with classPolicy inline-style flags.",
      }),
      entry({
        field: "allowApplyDirective",
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
          "@apply ban rationale in tailwind-policy JSDoc; wire CSS/PostCSS or AST when promoting.",
      }),
      entry({
        field: "allowDarkVariantForSemanticColors",
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
          "Blocks dark: on semantic color utilities in product code; theme owns light/dark. See schema JSDoc.",
      }),
      entry({
        field: "allowedArbitraryValueFragments",
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
          "Substring allowlist for arbitrary-value scanning (isAllowedArbitraryValueByPolicy). Uniqueness in validate-constants.",
      }),
      entry({
        field: "allowedSelectorFragments",
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
          "Governed variant/state selector segments in class strings; uniqueness in validate-constants. Future drift AST alignment.",
      }),
      entry({
        field: "allowedUtilityDomains",
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
          "Nested map: layout/spacing/…/color with UtilityDomainLevel (true | token-only | semantic-only). Single manifest row for the whole object; see utilityDomainLevelConstrainedModeValues. Future per-domain AST when mapped.",
      }),
    ],
  })
)

export const tailwindPolicyManifestFields = Object.freeze(
  tailwindPolicyManifest.entries.map((e) => e.field)
)

export const tailwindPolicyCanonicalFields = Object.freeze(
  Object.keys(tailwindPolicy) as TailwindPolicyField[]
)

export type TailwindPolicyManifest = typeof tailwindPolicyManifest
