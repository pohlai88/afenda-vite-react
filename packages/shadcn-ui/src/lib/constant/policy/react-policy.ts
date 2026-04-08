/**
 * GOVERNANCE POLICY — react-policy
 * Canonical governance for React rendering discipline, state ownership, and effect hygiene.
 * Scope: codifies render purity, state management posture, effect discipline, and memo heuristics
 *   aligned with React rules-of-hooks, Vercel best practices, and React Compiler expectations.
 * Authority: policy is reviewed truth; product code must not bypass rendering invariants.
 * Severity: downstream AST checks and lint tooling use these flags to gate anti-patterns.
 * Design: prefer pure renders, local state until shared, effects for external sync only.
 * Consumption: CI, AST checkers, and React-specific lint rules read this for disciplinary truth.
 * Changes: adjust React governance deliberately; relaxed rules require documented rationale.
 * Constraints: bannedPatterns must be exact labels matchable by AST analysis, not vague descriptions.
 * Validation: schema-validated shape plus uniqueness assertions in validate-constants.
 * Purpose: keep React usage disciplined, compiler-friendly, and free of common anti-patterns.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple, nonEmptyStringSchema } from "../schema/shared"

const reactPolicySchema = z
  .object({
    requirePureRender: z.boolean(),
    allowMutationDuringRender: z.boolean(),
    allowStateSetterDuringRender: z.boolean(),
    allowConditionalHookCalls: z.boolean(),

    preferLocalStateUntilShared: z.boolean(),
    preferSingleSourceOfTruthState: z.boolean(),
    allowDerivedStateCopies: z.boolean(),
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
      "barrel-import-in-feature",
    ],
  })
)

export type ReactPolicy = typeof reactPolicy

export const reactBannedPatternValues = defineTuple(
  reactPolicy.bannedPatterns as unknown as [string, ...string[]]
)
