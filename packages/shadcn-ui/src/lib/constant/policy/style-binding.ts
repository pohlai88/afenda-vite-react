/**
 * GOVERNANCE POLICY — style-binding
 * Global token/style binding governance.
 * Scope: declares canonical global token owners, defines whether global style/token
 *   layers are required, prevents feature-level forks of globals.css / index.css
 *   semantics, and ensures components consume governed token outputs instead of
 *   local visual invention.
 * Authority: policy is reviewed truth; product code must not fork global style layers.
 * Consumption: CI, AST checkers, and styling infrastructure read this policy.
 * Changes: adjust style-binding governance deliberately; structural changes require migration planning.
 * Validation: Zod schema + superRefine; validate-constants repeats checks at the aggregate boundary.
 * Purpose: keep global token/style ownership disciplined, auditable, and centrally governed.
 *
 * Note: `globalStyleOwnerValues` is the **current** authority list for repo layout (not a
 *   timeless vocabulary). `allowedGlobalStyleOwners` defaults are derived from this list to
 *   reduce drift between enum authority and policy defaults.
 */
import { z } from "zod/v4"

import {
  defineConstMap,
  defineTuple,
} from "../schema/shared"

function hasDuplicateGlobalStyleOwners(values: readonly string[]): boolean {
  return new Set(values).size !== values.length
}

function isLexicographicallySorted(values: readonly string[]): boolean {
  for (let i = 1; i < values.length; i += 1) {
    if (values[i - 1] > values[i]) {
      return false
    }
  }
  return true
}

export const globalStyleOwnerValues = defineTuple([
  "apps/web/src/index.css",
  "apps/web/src/globals.css",
])

export const globalStyleOwnerSchema = z.enum(globalStyleOwnerValues)
export type GlobalStyleOwner = z.infer<typeof globalStyleOwnerSchema>

const allowedGlobalStyleOwnersSchema = z
  .array(globalStyleOwnerSchema)
  .min(1)
  .readonly()

export const styleBindingPolicySchema = z
  .object({
    /**
     * Repo paths allowed to own global style/token binding for the app shell (the “owner envelope”).
     * Use with `primaryGlobalStyleOwner` for migration and split responsibilities.
     */
    allowedGlobalStyleOwners: allowedGlobalStyleOwnersSchema,

    /**
     * Canonical primary owner among `allowedGlobalStyleOwners` (must be listed there).
     */
    primaryGlobalStyleOwner: globalStyleOwnerSchema,

    requireGlobalTokenLayer: z.boolean(),
    requireSemanticColorSlots: z.boolean(),
    requireShellVariableLayer: z.boolean(),
    requireDensityVariableLayer: z.boolean(),

    /**
     * When false: components must not introduce a **new** semantic color system outside the
     * governed global/token layer (no ad-hoc semantic maps, component-scoped theme aliases that
     * replace global slots, or parallel semantic class maps). Consumption of existing global
     * semantic slots remains governed by `tailwind-policy` / `class-policy`.
     */
    allowComponentLocalSemanticColorDefinition: z.boolean(),

    allowFeatureLevelGlobalStyleFork: z.boolean(),

    /**
     * When true: features may introduce alternate local token names or alias layers that
     * reinterpret governed token outputs. When false: feature code must not create parallel
     * “token alias” layers (e.g. renaming semantic slots, duplicating token maps, or local
     * wrappers that override global meaning).
     */
    allowFeatureLevelTokenAliasFork: z.boolean(),

    /**
     * When true: UI components must consume outputs from the governed token system (semantic
     * color slots, shell/density CSS variables, token-backed utilities from the governed layer)
     * instead of inventing a separate local visual system.
     */
    requireComponentsToConsumeTokenOutputs: z.boolean(),

    /**
     * When true: any metadata-driven styling must resolve through the governed global/token
     * layer. Distinct from `metadata-ui`: that policy governs **whether** metadata may influence
     * styles; this field governs **where** those bindings must be sourced from.
     */
    requireMetadataBoundStylesToUseGlobalLayer: z.boolean(),
  })
  .strict()
  .superRefine((policy, ctx) => {
    if (hasDuplicateGlobalStyleOwners(policy.allowedGlobalStyleOwners)) {
      ctx.addIssue({
        code: "custom",
        message:
          "allowedGlobalStyleOwners must not contain duplicate entries (govern as a set, not a bag)",
        path: ["allowedGlobalStyleOwners"],
      })
    }

    const allowed = new Set(policy.allowedGlobalStyleOwners)
    if (!allowed.has(policy.primaryGlobalStyleOwner)) {
      ctx.addIssue({
        code: "custom",
        message:
          "primaryGlobalStyleOwner must be included in allowedGlobalStyleOwners (add it to allowedGlobalStyleOwners in style-binding.ts)",
        path: ["primaryGlobalStyleOwner"],
      })
    }

    if (!isLexicographicallySorted(policy.allowedGlobalStyleOwners)) {
      ctx.addIssue({
        code: "custom",
        message:
          "allowedGlobalStyleOwners must be sorted in ascending lexicographic order for deterministic diffs",
        path: ["allowedGlobalStyleOwners"],
      })
    }

    if (
      policy.requireGlobalTokenLayer &&
      !policy.requireSemanticColorSlots
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "requireSemanticColorSlots must be true when requireGlobalTokenLayer is true",
        path: ["requireSemanticColorSlots"],
      })
    }
  })
  .readonly()

const defaultAllowedGlobalStyleOwners = [...globalStyleOwnerValues].sort()

export const styleBindingPolicy = defineConstMap(
  /**
   * Valid example:
   * {
   *   allowedGlobalStyleOwners: ["apps/web/src/globals.css", "apps/web/src/index.css"],
   *   primaryGlobalStyleOwner: "apps/web/src/index.css",
   *   requireGlobalTokenLayer: true,
   *   requireSemanticColorSlots: true,
   *   ...
   * }
   *
   * Invalid example:
   * {
   *   allowedGlobalStyleOwners: ["apps/web/src/index.css", "apps/web/src/globals.css"], // unsorted
   *   primaryGlobalStyleOwner: "apps/web/src/theme.css", // not in allowedGlobalStyleOwners
   *   requireGlobalTokenLayer: true,
   *   requireSemanticColorSlots: false, // incompatible with requireGlobalTokenLayer
   *   ...
   * }
   */
  styleBindingPolicySchema.parse({
    allowedGlobalStyleOwners: defaultAllowedGlobalStyleOwners,
    primaryGlobalStyleOwner: "apps/web/src/index.css",

    requireGlobalTokenLayer: true,
    requireSemanticColorSlots: true,
    requireShellVariableLayer: true,
    requireDensityVariableLayer: true,

    allowComponentLocalSemanticColorDefinition: false,
    allowFeatureLevelGlobalStyleFork: false,
    allowFeatureLevelTokenAliasFork: false,

    requireComponentsToConsumeTokenOutputs: true,
    requireMetadataBoundStylesToUseGlobalLayer: true,
  }),
)

export type StyleBindingPolicy = typeof styleBindingPolicy
export type StyleBindingPolicyInput = z.input<typeof styleBindingPolicySchema>

export function parseStyleBindingPolicy(value: unknown): StyleBindingPolicy {
  return styleBindingPolicySchema.parse(value)
}

export function assertStyleBindingPolicy(input: unknown): StyleBindingPolicy {
  try {
    return styleBindingPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid StyleBindingPolicy: ${err.message}`, {
        cause: err,
      })
    }
    throw err
  }
}

export function safeParseStyleBindingPolicy(
  input: unknown
):
  | { success: true; data: StyleBindingPolicy }
  | { success: false; error: string } {
  const result = styleBindingPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isStyleBindingPolicy(input: unknown): input is StyleBindingPolicy {
  return styleBindingPolicySchema.safeParse(input).success
}

export const StyleBindingPolicyUtils = Object.freeze({
  schema: styleBindingPolicySchema,
  assert: assertStyleBindingPolicy,
  is: isStyleBindingPolicy,
  parse: parseStyleBindingPolicy,
  safeParse: safeParseStyleBindingPolicy,
  defaults: styleBindingPolicy,
})
