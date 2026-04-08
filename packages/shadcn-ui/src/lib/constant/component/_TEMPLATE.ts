/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  COMPONENT CONTRACT TEMPLATE  v2                                       │
 * │                                                                        │
 * │  Copy this file → rename to <component>.ts → fill in the blanks.      │
 * │  The three-part contract is enforced by `defineComponentContract()`:   │
 * │    1. VOCABULARIES — canonical enum tuples (what values are legal)     │
 * │    2. DEFAULTS     — schema-validated fallback prop values             │
 * │    3. POLICY       — governance flags that prevent feature-level drift │
 * │                                                                        │
 * │  If any part is missing, TypeScript will error at the contract call.   │
 * │  If any value violates its Zod schema, the module will throw at load.  │
 * │                                                                        │
 * │  NAMING CONVENTIONS (enforced across 58+ contracts):                   │
 * │    Vocabulary tuple  → <component><Dimension>Values                    │
 * │    Vocabulary schema → <component><Dimension>Schema                    │
 * │    Vocabulary type   → <Component><Dimension>                          │
 * │    Defaults export   → <component>Defaults                            │
 * │    Policy export     → <component>Policy                              │
 * │    Contract export   → <component>Contract                            │
 * │                                                                        │
 * │  POLICY FLAG NAMING (pick the right suffix):                           │
 * │    allowFeatureLevel<Dim>Extension — when a governed dimension         │
 * │      (variant, size, orientation) might be extended by feature code    │
 * │    allowFeatureLevelPrimitiveFork — when the whole Radix primitive     │
 * │      might be forked in feature code (most single-variant wrappers)   │
 * │    allowInlineVisualStyleProps — always include; controls style={}     │
 * │    require<Constraint> — for mandatory structural rules               │
 * │      (e.g. requireTitle, requireAccessibleLabel)                       │
 * │                                                                        │
 * │  INTEGRATION CHECKLIST:                                                │
 * │    [ ] Copy + rename this file                                         │
 * │    [ ] Fill vocabularies from the component's cva() or prop unions     │
 * │    [ ] Fill defaults matching the component's defaultVariants / params │
 * │    [ ] Wire the .tsx file to import defaults + types from this file    │
 * │    [ ] Register vocabulary tuples in registry/component-registry.ts   │
 * │    [ ] Add export * in constant/index.ts (alphabetical)               │
 * │    [ ] Run npx tsc --noEmit from packages/shadcn-ui                   │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * SEMANTIC CONTRACT — <component>
 * Source: `src/components/ui/<component>.tsx`
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

// ─── 1. VOCABULARIES ────────────────────────────────────────────────────────
// One tuple per governed cva dimension or union prop.
// The registry (component-registry.ts) will import the *Values tuple.
// Mirror the exact values from the component's cva({ variants: { ... } }).

export const exampleVariantValues = defineTuple([
  "default",
  "secondary",
  "outline",
])
export const exampleVariantSchema = z.enum(exampleVariantValues)
export type ExampleVariant = z.infer<typeof exampleVariantSchema>

// Multi-dimension example (uncomment if needed):
//
// export const exampleSizeValues = defineTuple(["sm", "default", "lg"])
// export const exampleSizeSchema = z.enum(exampleSizeValues)
// export type ExampleSize = z.infer<typeof exampleSizeSchema>

// ─── 2. DEFAULTS ────────────────────────────────────────────────────────────
// Must match the component's `defaultVariants` and destructured param defaults.
// The .tsx file should import these instead of repeating literals:
//   `variant = exampleDefaults.variant`

const exampleDefaultsSchema = z
  .object({
    variant: exampleVariantSchema,
  })
  .strict()

export const exampleDefaults = defineConstMap(
  exampleDefaultsSchema.parse({
    variant: "default",
  })
)

// ─── 3. POLICY ──────────────────────────────────────────────────────────────
// Boolean flags answer: "Is feature code allowed to…?"
// Always include `allowInlineVisualStyleProps`.
// Use `allowFeatureLevel<Dim>Extension` for governed dimensions.
// Use `allowFeatureLevelPrimitiveFork` for single-variant Radix wrappers.
// Use `require<Rule>` for mandatory structural constraints.

const examplePolicySchema = z
  .object({
    allowFeatureLevelVariantExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const examplePolicy = defineConstMap(
  examplePolicySchema.parse({
    allowFeatureLevelVariantExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

// ─── CONTRACT ASSERTION ─────────────────────────────────────────────────────
// Enforces all three parts at compile time (TypeScript) and load time (Zod).

export const exampleContract = defineComponentContract({
  vocabularies: { variant: exampleVariantValues },
  defaults: exampleDefaults,
  policy: examplePolicy,
})
