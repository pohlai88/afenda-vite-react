/**
 * GOVERNANCE POLICY — rule-policy
 * Canonical policy definition for rule severity and semantic drift enforcement.
 * Scope: classifies governed rule codes and how strongly they are enforced.
 * Authority: policy is reviewed truth; feature code and checks must not override it locally.
 * Severity: explicit levels such as `error`, `warning`, and `off` are the public doctrine.
 * Design: rules must stay deterministic, explainable, and actionable.
 * Consumption: lint, AST checks, tests, and CI rely on this file as configuration truth.
 * Changes: adjust policy intentionally and document why severity changes are safe.
 * Constraints: no vague heuristics or warning-only treatment for critical architectural drift.
 * Validation: keep policy shape typed, explicit, reviewable, and schema-checkable.
 * Purpose: keep enforcement behavior stable, scalable, and enforceable.
 *
 * ESLint vs other channels (`implemented`):
 *
 * - **`implemented` means ESLint linkage only.** It must stay aligned with `ruleCodeToEslintRule`
 *   (see `validateUiDriftRulePolicyLinks`). When `true`, a named ESLint rule is required; when
 *   `false`, no ESLint mapping is expected.
 * - It does **not** mean the rule is unenforced. Many codes use `level: "error"` with
 *   `implemented: false` because enforcement lives in `scripts/check-ui-drift-ast.ts`, regex
 *   scanners, or other CI — not in ESLint yet.
 * - A future schema rename (e.g. `eslintImplemented`) or per-channel flags may follow if we
 *   need explicit AST vs ESLint metadata in this record.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "./schema/shared"

export const governanceRuleLevelValues = defineTuple([
  "error",
  "warning",
  "off",
])
export const governanceRuleLevelSchema = z.enum(governanceRuleLevelValues)
export type GovernanceRuleLevel = (typeof governanceRuleLevelValues)[number]

export const uiDriftRuleCodeValues = defineTuple([
  "UIX-IMPORT-001",
  "UIX-IMPORT-002",
  "UIX-COLOR-001",
  "UIX-COLOR-002",
  "UIX-CLASS-001",
  "UIX-STYLE-001",
  "UIX-SEMANTIC-001",
  "UIX-SEMANTIC-002",
  "UIX-CONTROL-001",
  "UIX-VARIANT-001",
  "UIX-AST-IMPORT-001",
  "UIX-AST-IMPORT-002",
  "UIX-AST-IMPORT-003",
  "UIX-AST-IMPORT-004",
  "UIX-AST-IMPORT-005",
  "UIX-AST-IMPORT-006",
  "UIX-AST-COLOR-001",
  "UIX-AST-COLOR-002",
  "UIX-AST-CLASS-001",
  "UIX-AST-STYLE-001",
  "UIX-AST-SEMANTIC-001",
  "UIX-AST-SEMANTIC-002",
  "UIX-AST-SEMANTIC-REQUIRED-001",
  "UIX-AST-SEMANTIC-REQUIRED-002",
  "UIX-AST-SEMANTIC-REQUIRED-003",
  "UIX-AST-CONTROL-001",
  "UIX-AST-VARIANT-001",
  "UIX-AST-STRUCTURE-001",
  "UIX-AST-TOKEN-001",
  "UIX-AST-TOKEN-002",
  "UIX-AST-TOKEN-003",
  "UIX-AST-TOKEN-004",
  "UIX-AST-TRUTH-001",
  "UIX-AST-TRUTH-002",
  "UIX-AST-TRUTH-003",
  "UIX-AST-COMPLEXITY-001",
  "UIX-AST-COMPLEXITY-002",
  "UIX-AST-COMPLEXITY-003",
  "UIX-AST-COMPLEXITY-004",
  "UIX-AST-COMPONENT-001",
  "UIX-AST-COMPONENT-002",
  "UIX-AST-COMPONENT-003",
  "UIX-AST-SHELL-001",
  "UIX-AST-SHELL-002",
  "UIX-AST-SHELL-003",
  "UIX-AST-SHELL-004",
  "UIX-AST-SHELL-005",
  "UIX-AST-SHELL-006",
  "UIX-AST-SHELL-007",
  "UIX-AST-SHELL-008",
  "UIX-AST-SHELL-009",
  "UIX-AST-SHELL-010",
  "UIX-AST-SHELL-011",
  "UIX-AST-SHELL-012",
  "UIX-AST-SHELL-013",
  "UIX-REACT-PURITY-001",
  "UIX-REACT-STATE-001",
  "UIX-REACT-EFFECT-001",
  "UIX-REACT-MEMO-001",
  "UIX-TAILWIND-TOKEN-001",
  "UIX-TAILWIND-PALETTE-001",
  "UIX-TAILWIND-ARBITRARY-001",
  "UIX-SHADCN-CVA-001",
  "UIX-SHADCN-WRAPPER-001",
  "UIX-SHADCN-002",
  "UIX-SHADCN-003",
  "UIX-RADIX-IMPORT-001",
  "UIX-RADIX-001",
  "UIX-RADIX-002",
  "UIX-RADIX-003",
  "UIX-RADIX-004",
  "UIX-RADIX-005",
  "UIX-OWNERSHIP-BOUNDARY-001",
  "UIX-RUNTIME-001",
  "UIX-RUNTIME-002",
  "UIX-RUNTIME-003",
  "UIX-RUNTIME-004",
  "UIX-RUNTIME-005",
  "UIX-RUNTIME-006",
  "UIX-RUNTIME-007",
  "UIX-RUNTIME-008",
  "UIX-RUNTIME-009",
  "UIX-RUNTIME-010",
  "UIX-RUNTIME-011",
])
export const uiDriftRuleCodeSchema = z.enum(uiDriftRuleCodeValues)
export type UiDriftRuleCode = (typeof uiDriftRuleCodeValues)[number]

export const uiDriftRulePolicyEntrySchema = z
  .object({
    level: governanceRuleLevelSchema,
    /** ESLint linkage; see file-level note. Not “implemented anywhere.” */
    implemented: z
      .boolean()
      .describe(
        "True iff this rule code is backed by an entry in ruleCodeToEslintRule. False for AST-only or CI-only enforcement."
      ),
  })
  .strict()
export type UiDriftRulePolicyEntry = z.infer<
  typeof uiDriftRulePolicyEntrySchema
>

export const uiDriftRulePolicySchema = z.record(
  uiDriftRuleCodeSchema,
  uiDriftRulePolicyEntrySchema
)
export type UiDriftRulePolicy = Readonly<
  Record<UiDriftRuleCode, UiDriftRulePolicyEntry>
>

export const eslintRuleNameSchema = z.string().trim().min(1)
export const ruleCodeToEslintRuleSchema = z.record(
  z.string().trim().min(1),
  eslintRuleNameSchema
)
export type RuleCodeToEslintRule = Readonly<
  Partial<Record<UiDriftRuleCode, string>>
>

const uiDriftRulePolicyDefinition = {
  "UIX-IMPORT-001": { level: "error", implemented: false },
  "UIX-IMPORT-002": { level: "error", implemented: false },
  "UIX-COLOR-001": { level: "error", implemented: true },
  "UIX-COLOR-002": { level: "error", implemented: true },
  "UIX-CLASS-001": { level: "error", implemented: false },
  "UIX-STYLE-001": { level: "error", implemented: true },
  "UIX-SEMANTIC-001": { level: "warning", implemented: false },
  "UIX-SEMANTIC-002": { level: "warning", implemented: false },
  "UIX-CONTROL-001": { level: "warning", implemented: false },
  "UIX-VARIANT-001": { level: "warning", implemented: false },
  "UIX-AST-IMPORT-001": { level: "error", implemented: false },
  "UIX-AST-IMPORT-002": { level: "error", implemented: false },
  "UIX-AST-IMPORT-003": { level: "error", implemented: false },
  "UIX-AST-IMPORT-004": { level: "error", implemented: false },
  "UIX-AST-IMPORT-005": { level: "error", implemented: false },
  "UIX-AST-IMPORT-006": { level: "error", implemented: false },
  "UIX-AST-COLOR-001": { level: "error", implemented: true },
  "UIX-AST-COLOR-002": { level: "error", implemented: false },
  "UIX-AST-CLASS-001": { level: "error", implemented: false },
  "UIX-AST-STYLE-001": { level: "error", implemented: false },
  "UIX-AST-SEMANTIC-001": { level: "error", implemented: true },
  "UIX-AST-SEMANTIC-002": { level: "warning", implemented: false },
  "UIX-AST-SEMANTIC-REQUIRED-001": { level: "warning", implemented: false },
  "UIX-AST-SEMANTIC-REQUIRED-002": { level: "warning", implemented: false },
  "UIX-AST-SEMANTIC-REQUIRED-003": { level: "warning", implemented: false },
  "UIX-AST-CONTROL-001": { level: "error", implemented: false },
  "UIX-AST-VARIANT-001": { level: "error", implemented: false },
  "UIX-AST-STRUCTURE-001": { level: "warning", implemented: false },
  "UIX-AST-TOKEN-001": { level: "warning", implemented: true },
  "UIX-AST-TOKEN-002": { level: "warning", implemented: false },
  "UIX-AST-TOKEN-003": { level: "warning", implemented: false },
  "UIX-AST-TOKEN-004": { level: "warning", implemented: false },
  "UIX-AST-TRUTH-001": { level: "error", implemented: false },
  "UIX-AST-TRUTH-002": { level: "error", implemented: false },
  "UIX-AST-TRUTH-003": { level: "error", implemented: false },
  "UIX-AST-COMPLEXITY-001": { level: "warning", implemented: false },
  "UIX-AST-COMPLEXITY-002": { level: "warning", implemented: false },
  "UIX-AST-COMPLEXITY-003": { level: "warning", implemented: false },
  "UIX-AST-COMPLEXITY-004": { level: "error", implemented: false },
  "UIX-AST-COMPONENT-001": { level: "warning", implemented: false },
  "UIX-AST-COMPONENT-002": { level: "warning", implemented: false },
  "UIX-AST-COMPONENT-003": { level: "off", implemented: false },
  "UIX-AST-SHELL-001": { level: "warning", implemented: false },
  "UIX-AST-SHELL-002": { level: "warning", implemented: false },
  "UIX-AST-SHELL-003": { level: "warning", implemented: false },
  "UIX-AST-SHELL-004": { level: "warning", implemented: false },
  "UIX-AST-SHELL-005": { level: "warning", implemented: false },
  "UIX-AST-SHELL-006": { level: "warning", implemented: false },
  "UIX-AST-SHELL-007": { level: "warning", implemented: false },
  "UIX-AST-SHELL-008": { level: "warning", implemented: false },
  "UIX-AST-SHELL-009": { level: "warning", implemented: false },
  "UIX-AST-SHELL-010": { level: "warning", implemented: false },
  "UIX-AST-SHELL-011": { level: "warning", implemented: false },
  "UIX-AST-SHELL-012": { level: "warning", implemented: false },
  "UIX-AST-SHELL-013": { level: "warning", implemented: false },
  "UIX-REACT-PURITY-001": { level: "error", implemented: false },
  "UIX-REACT-STATE-001": { level: "warning", implemented: false },
  "UIX-REACT-EFFECT-001": { level: "warning", implemented: false },
  "UIX-REACT-MEMO-001": { level: "warning", implemented: false },
  "UIX-TAILWIND-TOKEN-001": { level: "error", implemented: false },
  "UIX-TAILWIND-PALETTE-001": { level: "error", implemented: false },
  "UIX-TAILWIND-ARBITRARY-001": { level: "error", implemented: false },
  "UIX-SHADCN-CVA-001": { level: "error", implemented: false },
  "UIX-SHADCN-WRAPPER-001": { level: "error", implemented: false },
  "UIX-SHADCN-002": { level: "warning", implemented: false },
  "UIX-SHADCN-003": { level: "warning", implemented: false },
  "UIX-RADIX-IMPORT-001": { level: "error", implemented: false },
  "UIX-RADIX-001": { level: "error", implemented: false },
  "UIX-RADIX-002": { level: "error", implemented: false },
  "UIX-RADIX-003": { level: "error", implemented: false },
  "UIX-RADIX-004": { level: "warning", implemented: false },
  "UIX-RADIX-005": { level: "warning", implemented: false },
  "UIX-OWNERSHIP-BOUNDARY-001": { level: "error", implemented: false },
  "UIX-RUNTIME-001": { level: "error", implemented: false },
  "UIX-RUNTIME-002": { level: "warning", implemented: false },
  "UIX-RUNTIME-003": { level: "error", implemented: false },
  "UIX-RUNTIME-004": { level: "error", implemented: false },
  "UIX-RUNTIME-005": { level: "warning", implemented: false },
  "UIX-RUNTIME-006": { level: "warning", implemented: false },
  "UIX-RUNTIME-007": { level: "warning", implemented: false },
  "UIX-RUNTIME-008": { level: "warning", implemented: false },
  "UIX-RUNTIME-009": { level: "warning", implemented: false },
  "UIX-RUNTIME-010": { level: "warning", implemented: false },
  "UIX-RUNTIME-011": { level: "warning", implemented: false },
} as const satisfies UiDriftRulePolicy

export const uiDriftRulePolicy = defineConstMap(
  uiDriftRulePolicySchema.parse(uiDriftRulePolicyDefinition)
)

const ruleCodeToEslintRuleDefinition = {
  "UIX-COLOR-001": "afenda-ui/no-raw-colors",
  "UIX-COLOR-002": "afenda-ui/no-raw-colors",
  "UIX-STYLE-001": "afenda-ui/no-inline-style-theming",
  "UIX-AST-COLOR-001": "afenda-ui/no-direct-semantic-color",
  "UIX-AST-SEMANTIC-001": "afenda-ui/no-local-semantic-map",
  "UIX-AST-TOKEN-001": "afenda-ui/semantic-token-allowlist",
} as const satisfies RuleCodeToEslintRule

export const ruleCodeToEslintRule = defineConstMap(
  ruleCodeToEslintRuleSchema.parse(ruleCodeToEslintRuleDefinition)
)

/**
 * Ensures `implemented` stays aligned with `ruleCodeToEslintRule`.
 * `implemented` is ESLint-only; AST/CI enforcement is not represented here.
 */
export function validateUiDriftRulePolicyLinks(): void {
  for (const [ruleCode, entry] of Object.entries(uiDriftRulePolicy)) {
    const eslintRuleName = ruleCodeToEslintRule[ruleCode]

    if (entry.implemented && !eslintRuleName) {
      throw new Error(
        `Rule "${ruleCode}" has implemented=true (ESLint) but is missing ruleCodeToEslintRule mapping.`
      )
    }

    if (!entry.implemented && eslintRuleName) {
      throw new Error(
        `Rule "${ruleCode}" has ruleCodeToEslintRule mapping but implemented=false (ESLint). Set implemented=true or remove the ESLint mapping.`
      )
    }
  }
}
