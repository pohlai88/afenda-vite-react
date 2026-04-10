/**
 * GOVERNANCE POLICY — radix-policy
 * Canonical governance for Radix UI primitive consumption and behavioral ownership.
 * Scope: controls direct import restrictions, wrapping requirements, and approved packages.
 * Authority: policy is reviewed truth; product code must not import or fork primitives ad hoc.
 * Severity: downstream AST checks gate Radix imports and behavioral overrides as hard errors.
 * Design: keep primitive wrapping central; asChild composition stays available for governed use.
 * Consumption: CI, AST checkers, and drift tooling read this for Radix governance truth.
 * Changes: expand the approved packages list deliberately; removals require migration planning.
 * Constraints: allowedPrimitivePackages must be exact npm package names, not prefixes or globs.
 * Validation: schema-validated shape plus uniqueness and package-name shape in Zod superRefine;
 *   validate-constants repeats checks at the aggregate boundary.
 * Ownership boundary: “UI owner” vs outside is resolved using ownershipPolicy.uiOwnerRoots
 *   (see ownership-policy.ts); this file does not duplicate those paths.
 * Purpose: prevent Radix primitive drift and maintain accessibility guarantees centrally.
 */
import { z } from "zod/v4"

import {
  defineConstMap,
  defineTuple,
  hasDuplicateStrings,
} from "../schema/shared"

/**
 * Exact scoped npm package name for @radix-ui/react-* primitives.
 * Rejects globs, path-like strings, and prefix-only forms.
 */
const radixPrimitivePackageNameSchema = z
  .string()
  .trim()
  .regex(
    /^@radix-ui\/react-[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Expected exact @radix-ui/react-* npm package name (no globs, slashes, or prefixes)."
  )

/** Runtime-checked non-empty list; single cast for defineTuple (Zod already guarantees min(1)). */
function assertNonEmptyTuple(values: readonly string[]): [string, ...string[]] {
  if (values.length === 0) {
    throw new Error("allowedPrimitivePackages must contain at least one package.")
  }
  return values as unknown as [string, ...string[]]
}

export const radixPolicySchema = z
  .object({
    allowDirectPrimitiveImportOutsideUiOwner: z.boolean(),
    requirePrimitiveWrappingInUiOwner: z.boolean(),
    allowAsChild: z.boolean(),
    /**
     * When false: feature and non-owner code must not replace or fork Radix interaction
     * semantics (open/close, focus traps, keyboard handling) outside governed wrappers.
     * Does not forbid normal composition or props on wrappers inside UI owners.
     */
    allowCustomBehaviorForks: z.boolean(),
    /**
     * When false: arbitrary ARIA/role/focus/keyboard overrides that bypass the governed
     * primitive wrapper contract are not allowed in product paths. Legitimate a11y
     * composition remains inside governed UI packages per wrapper contracts.
     */
    allowAdHocAccessibilityOverrides: z.boolean(),
    allowedPrimitivePackages: z
      .array(radixPrimitivePackageNameSchema)
      .min(1)
      .readonly(),
  })
  .strict()
  .superRefine((policy, ctx) => {
    if (hasDuplicateStrings(policy.allowedPrimitivePackages)) {
      ctx.addIssue({
        code: "custom",
        message:
          "allowedPrimitivePackages must not contain duplicate entries (govern as a set).",
        path: ["allowedPrimitivePackages"],
      })
    }
  })

export const radixPolicy = defineConstMap(
  radixPolicySchema.parse({
    allowDirectPrimitiveImportOutsideUiOwner: false,
    requirePrimitiveWrappingInUiOwner: true,
    allowAsChild: true,
    allowCustomBehaviorForks: false,
    allowAdHocAccessibilityOverrides: false,
    allowedPrimitivePackages: [
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-direction",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
    ],
  })
)

export type RadixPolicy = typeof radixPolicy

export const radixPrimitivePackageValues = defineTuple(
  assertNonEmptyTuple(radixPolicy.allowedPrimitivePackages)
)

export const radixContractPolicySchema = z
  .object({
    /**
     * Wrapped primitive components must pass through remaining props.
     */
    requirePropsSpreadToPrimitive: z.boolean(),

    /**
     * Wrapped primitive components must preserve ref flow.
     */
    requireRefForwardingOrExplicitRefPassThrough: z.boolean(),

    /**
     * Wrapped primitive components must render a Radix primitive element.
     */
    requirePrimitiveRenderInWrapper: z.boolean(),

    /**
     * Heuristic: warn if local open/checked/selected state appears to replace
     * primitive-controlled behavior in wrapper files (softer than objective checks above).
     */
    warnOnLocalStateReplacingPrimitiveBehavior: z.boolean(),

    /**
     * Heuristic: warn if asChild-capable wrappers appear to remove composition flexibility.
     */
    warnOnSuspiciousAsChildContractDrift: z.boolean(),
  })
  .strict()

export const radixContractPolicy = defineConstMap(
  radixContractPolicySchema.parse({
    requirePropsSpreadToPrimitive: true,
    requireRefForwardingOrExplicitRefPassThrough: true,
    requirePrimitiveRenderInWrapper: true,
    warnOnLocalStateReplacingPrimitiveBehavior: true,
    warnOnSuspiciousAsChildContractDrift: true,
  })
)

export type RadixContractPolicy = typeof radixContractPolicy
export type RadixPolicyInput = z.input<typeof radixPolicySchema>
export type RadixContractPolicyInput = z.input<typeof radixContractPolicySchema>

export function parseRadixPolicy(value: unknown): RadixPolicy {
  return radixPolicySchema.parse(value)
}

export function assertRadixPolicy(input: unknown): RadixPolicy {
  try {
    return radixPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid RadixPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseRadixPolicy(
  input: unknown
): { success: true; data: RadixPolicy } | { success: false; error: string } {
  const result = radixPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isRadixPolicy(input: unknown): input is RadixPolicy {
  return radixPolicySchema.safeParse(input).success
}

export function parseRadixContractPolicy(value: unknown): RadixContractPolicy {
  return radixContractPolicySchema.parse(value)
}

export function assertRadixContractPolicy(input: unknown): RadixContractPolicy {
  try {
    return radixContractPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid RadixContractPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseRadixContractPolicy(
  input: unknown
):
  | { success: true; data: RadixContractPolicy }
  | { success: false; error: string } {
  const result = radixContractPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isRadixContractPolicy(
  input: unknown
): input is RadixContractPolicy {
  return radixContractPolicySchema.safeParse(input).success
}

export const RadixPolicyUtils = Object.freeze({
  schema: radixPolicySchema,
  assert: assertRadixPolicy,
  is: isRadixPolicy,
  parse: parseRadixPolicy,
  safeParse: safeParseRadixPolicy,
  defaults: radixPolicy,
})

export const RadixContractPolicyUtils = Object.freeze({
  schema: radixContractPolicySchema,
  assert: assertRadixContractPolicy,
  is: isRadixContractPolicy,
  parse: parseRadixContractPolicy,
  safeParse: safeParseRadixContractPolicy,
  defaults: radixContractPolicy,
})
