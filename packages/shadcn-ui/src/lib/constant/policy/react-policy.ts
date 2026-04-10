/**
 * GOVERNANCE POLICY — react-policy
 * Canonical governance for React rendering discipline, state ownership, and effect hygiene.
 * Scope: codifies render purity, state management posture, effect discipline, and memo heuristics
 *   aligned with React rules-of-hooks, Vercel best practices, and React Compiler expectations.
 * Module/import boundary rules (e.g. barrel files) live in `import-policy`, not here.
 * Authority: policy is reviewed truth; product code must not bypass rendering invariants.
 * Severity: downstream AST checks and lint tooling use these flags to gate anti-patterns.
 * Design: prefer pure renders, local state until shared, effects for external sync only.
 * Consumption: CI, AST checkers, and React-specific lint rules read this for disciplinary truth.
 * Changes: adjust React governance deliberately; relaxed rules require documented rationale.
 * Constraints: bannedPatterns must be exact labels matchable by AST analysis, not vague descriptions.
 * Validation: schema-validated shape plus uniqueness assertions in validate-constants.
 * Purpose: keep React usage disciplined, compiler-friendly, and free of common anti-patterns.
 *
 * Policy semantics (boolean prefixes):
 *
 * - `require*` — Hard invariant. Violations are incorrect code and should be enforced when automation exists.
 * - `allow*` — Explicit exception gate. When false, the named escape hatch is disallowed and should be blocked.
 * - `prefer*` — Strong directional guidance. May be enforced heuristically or via review; not every violation is automatically blocking.
 *
 * Paired `require*` vs `allow*` fields (e.g. `requirePureRender` / `allowMutationDuringRender`) are intentional:
 * doctrine vs violation gate — do not collapse without a documented migration.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple, nonEmptyStringSchema } from "../schema/shared"

export const reactPolicySchema = z
  .object({
    requirePureRender: z.boolean(),
    allowMutationDuringRender: z.boolean(),
    allowStateSetterDuringRender: z.boolean(),
    allowConditionalHookCalls: z.boolean(),

    preferLocalStateUntilShared: z.boolean(),
    preferSingleSourceOfTruthState: z.boolean(),
    /**
     * When false, disallows storing values in state that can be derived directly from props,
     * selectors, or existing state without loss of correctness (distinct from memoization or caching).
     */
    allowDerivedStateCopies: z.boolean(),
    /**
     * When true, components exposed as reusable UI or product boundaries should prefer controlled
     * interfaces over implicit internal state.
     */
    preferControlledComponentsAtBoundary: z.boolean(),

    preferEffectForExternalSyncOnly: z.boolean(),
    allowBusinessLogicDumpedIntoEffects: z.boolean(),

    preferMemoOnlyWhenMeasured: z.boolean(),
    allowBlindMemoizationEverywhere: z.boolean(),

    bannedPatterns: z.array(nonEmptyStringSchema).min(1).readonly(),
  })
  .strict()

export const reactPolicy = defineConstMap(
  reactPolicySchema.parse({
    requirePureRender: true,
    allowMutationDuringRender: false,
    allowStateSetterDuringRender: false,
    allowConditionalHookCalls: false,

    preferLocalStateUntilShared: true,
    preferSingleSourceOfTruthState: true,
    allowDerivedStateCopies: false,
    preferControlledComponentsAtBoundary: true,

    preferEffectForExternalSyncOnly: true,
    allowBusinessLogicDumpedIntoEffects: false,

    preferMemoOnlyWhenMeasured: true,
    allowBlindMemoizationEverywhere: false,

    bannedPatterns: [
      "set-state-in-render",
      "mutate-props",
      "mutate-module-scope-during-render",
      "conditional-hooks",
      "duplicate-derived-state",
      "effect-as-primary-business-logic",
      "effect-for-derived-state",
      "blind-memoization",
    ],
  })
)

export type ReactPolicy = typeof reactPolicy
export type ReactPolicyInput = z.input<typeof reactPolicySchema>

export const reactBannedPatternValues = defineTuple(
  reactPolicy.bannedPatterns as unknown as [string, ...string[]]
)

export function parseReactPolicy(value: unknown): ReactPolicy {
  return reactPolicySchema.parse(value)
}

export function assertReactPolicy(input: unknown): ReactPolicy {
  try {
    return reactPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ReactPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseReactPolicy(
  input: unknown
): { success: true; data: ReactPolicy } | { success: false; error: string } {
  const result = reactPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isReactPolicy(input: unknown): input is ReactPolicy {
  return reactPolicySchema.safeParse(input).success
}

export const ReactPolicyUtils = Object.freeze({
  schema: reactPolicySchema,
  assert: assertReactPolicy,
  is: isReactPolicy,
  parse: parseReactPolicy,
  safeParse: safeParseReactPolicy,
  defaults: reactPolicy,
})
