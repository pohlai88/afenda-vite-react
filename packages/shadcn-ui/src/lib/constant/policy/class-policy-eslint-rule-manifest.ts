/**
 * GOVERNANCE — class-policy ↔ ESLint rule IDs (status-aware)
 *
 * - `implemented` — rule exists in the plugin and fully covers the policy field.
 * - `partial` — rule exists but only covers part of the field (legacy or shared rule).
 * - `planned` — target rule not registered in the plugin yet; no enforcement.
 *
 * Enforcement truth: `implemented` / `partial` entries must match `plugin-rule-registry.cjs`.
 *
 * See: packages/eslint-config/afenda-ui-plugin/WAVE1_WAVE2_RULE_SPECS.md
 */
import { type ClassPolicy } from "./class-policy"

export type ClassPolicyField = keyof ClassPolicy

export type ClassPolicyRuleCoverageStatus = "implemented" | "partial" | "planned"

/** ESLint config style id: `afenda-ui/<rule-name>` (plugin prefix + rule file key). */
export type AfendaUiScopedRuleId = `afenda-ui/${string}`

export interface ClassPolicyEslintRuleBinding {
  readonly ruleId: AfendaUiScopedRuleId
  readonly status: ClassPolicyRuleCoverageStatus
  /** Why partial/planned, or split from a monolith rule. */
  readonly notes?: string
}

export interface ClassPolicyEslintRuleManifestEntry {
  readonly rules: readonly ClassPolicyEslintRuleBinding[]
}

export const CLASS_POLICY_ESLINT_RULE_MANIFEST_VERSION = "3.1.0"

const PREFIX = "afenda-ui/"

/** Strip `afenda-ui/` for comparison with `plugin.rules` keys. */
export function parseAfendaUiRuleIdToPluginKey(ruleId: string): string {
  return ruleId.startsWith(PREFIX) ? ruleId.slice(PREFIX.length) : ruleId
}

/**
 * Canonical mapping: each classPolicy field → bindings with explicit coverage status.
 */
export const classPolicyEslintRuleManifest = {
  allowRawPaletteClasses: {
    rules: [
      {
        ruleId: "afenda-ui/no-raw-colors",
        status: "partial",
        notes:
          "Monolith rule flags raw palette utilities among other issues; dedicated no-raw-palette-classes is planned.",
      },
      {
        ruleId: "afenda-ui/no-raw-palette-classes",
        status: "planned",
        notes: "Enterprise split: palette-namespace-only detection.",
      },
    ],
  },
  allowArbitraryValuesInFeatures: {
    rules: [
      {
        ruleId: "afenda-ui/no-arbitrary-tailwind-values",
        status: "planned",
        notes: "CI drift exists; ESLint rule not registered yet.",
      },
    ],
  },
  allowInlineStyleAttributeInProductUi: {
    rules: [
      {
        ruleId: "afenda-ui/no-inline-style-theming",
        status: "partial",
        notes:
          "Only color keys in style objects; full no-inline-styles (any property) is planned.",
      },
      {
        ruleId: "afenda-ui/no-inline-styles",
        status: "planned",
        notes: "General block of style={} when policy disallows.",
      },
    ],
  },
  allowHexRgbHslColorsInProductUi: {
    rules: [
      {
        ruleId: "afenda-ui/no-raw-colors",
        status: "partial",
        notes:
          "hardcoded-color / arbitrary color branches; dedicated no-literal-color-values is planned.",
      },
      {
        ruleId: "afenda-ui/no-literal-color-values",
        status: "planned",
        notes: "Dedicated literals-only rule for strings and inline values.",
      },
    ],
  },
  allowCvaOutsideUiPackage: {
    rules: [
      {
        ruleId: "afenda-ui/no-cva-outside-ui",
        status: "planned",
        notes: "Import + cva() call detection; align with drift scripts.",
      },
    ],
  },
  allowDirectRadixImportOutsideUiPackage: {
    rules: [
      {
        ruleId: "afenda-ui/no-direct-radix-outside-ui",
        status: "implemented",
        notes:
          "Implemented in eslint-config plugin with shared scope resolution; blocks @radix-ui/react-* imports outside ui-package.",
      },
    ],
  },
  allowDirectTokenUsageInFeatures: {
    rules: [
      {
        ruleId: "afenda-ui/no-direct-token-usage",
        status: "planned",
        notes: "Feature import paths for token modules.",
      },
    ],
  },
  allowAsChildOutsideUiPackage: {
    rules: [
      {
        ruleId: "afenda-ui/no-as-child-outside-ui",
        status: "planned",
        notes: "JSX asChild + forwarded prop patterns outside ui-package.",
      },
    ],
  },
  allowSlotOutsideUiPackage: {
    rules: [
      {
        ruleId: "afenda-ui/no-slot-outside-ui",
        status: "planned",
        notes: "@radix-ui/react-slot import and Slot usage gate.",
      },
    ],
  },
  allowFeatureLevelVariantMaps: {
    rules: [
      {
        ruleId: "afenda-ui/no-feature-variant-maps",
        status: "planned",
        notes: "Dedicated variant-map heuristic; overlaps shadcnPolicy / componentPolicy.",
      },
    ],
  },
  allowFeatureLevelStatusToClassMapping: {
    rules: [
      {
        ruleId: "afenda-ui/no-local-semantic-map",
        status: "partial",
        notes: "ClassMap/ToneMap heuristics; dedicated no-status-to-class-mapping planned.",
      },
      {
        ruleId: "afenda-ui/no-status-to-class-mapping",
        status: "planned",
        notes: "Narrow rule for status → utility class maps and ternary className.",
      },
    ],
  },
  allowFeatureLevelSemanticColorMapping: {
    rules: [
      {
        ruleId: "afenda-ui/no-local-semantic-map",
        status: "partial",
        notes: "Some overlap via Tailwind class detection in object maps.",
      },
      {
        ruleId: "afenda-ui/no-semantic-color-mapping",
        status: "planned",
        notes: "Broader semantic color policy recreation outside design system.",
      },
    ],
  },
  allowFeatureLevelTruthToVariantMapping: {
    rules: [
      {
        ruleId: "afenda-ui/no-local-semantic-map",
        status: "partial",
        notes: "Record<> key typing overlap for truth enums.",
      },
      {
        ruleId: "afenda-ui/no-truth-to-variant-mapping",
        status: "planned",
        notes: "Domain truth/reconciliation → badge/alert variant mapping.",
      },
    ],
  },
  allowArbitraryZIndex: {
    rules: [
      {
        ruleId: "afenda-ui/no-arbitrary-z-index",
        status: "planned",
        notes: "z-[n] and arbitrary stacking utilities.",
      },
    ],
  },
  allowPositioningUtilities: {
    rules: [
      {
        ruleId: "afenda-ui/positioning-utility-governance",
        status: "planned",
        notes: "absolute/fixed/inset/top/left drift; default warn in options.",
      },
    ],
  },
  allowGridTemplateOverrides: {
    rules: [
      {
        ruleId: "afenda-ui/grid-template-governance",
        status: "planned",
        notes: "grid-template-rows/cols/areas complexity in feature UI.",
      },
    ],
  },
  allowClassNamePassThrough: {
    rules: [
      {
        ruleId: "afenda-ui/classname-pass-through-governance",
        status: "planned",
        notes: "Wrapper className tunnel; scope-aware severity.",
      },
    ],
  },
  allowCnComposition: {
    rules: [
      {
        ruleId: "afenda-ui/cn-composition-governance",
        status: "planned",
        notes: "Nested cn / large conditional class composition.",
      },
    ],
  },
  maxRecommendedClassNameTokensInFeatures: {
    rules: [
      {
        ruleId: "afenda-ui/classname-token-count",
        status: "planned",
        notes: "Token count against global / scoped limits.",
      },
    ],
  },
  warnClassNameTokenCount: {
    rules: [
      {
        ruleId: "afenda-ui/classname-token-count",
        status: "planned",
        notes: "Warn threshold; pairs with errorClassNameTokenCount and scopes.*.",
      },
    ],
  },
  errorClassNameTokenCount: {
    rules: [
      {
        ruleId: "afenda-ui/classname-token-count",
        status: "planned",
        notes: "Error threshold; same rule with severity by count.",
      },
    ],
  },
  scopes: {
    rules: [
      {
        ruleId: "afenda-ui/classname-token-count",
        status: "planned",
        notes:
          "Lane-specific numeric overrides apply to token-count and future scope-aware rules; no separate plugin key yet.",
      },
    ],
  },
} as const satisfies Record<ClassPolicyField, ClassPolicyEslintRuleManifestEntry>

export type ClassPolicyEslintRuleManifest = typeof classPolicyEslintRuleManifest

/**
 * Rules that are not tied to a single classPolicy boolean field (semantic-only,
 * token allowlist, etc.). `no-local-semantic-map` is intentionally omitted — it is
 * referenced as partial coverage on several classPolicy fields.
 */
export const AFENDA_UI_RULE_IDS_OUTSIDE_CLASS_POLICY_MANIFEST = [
  "afenda-ui/no-direct-semantic-color",
  "afenda-ui/semantic-token-allowlist",
] as const
