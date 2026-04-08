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
 * Validation: schema-validated shape plus uniqueness assertions in validate-constants.
 * Purpose: prevent Radix primitive drift and maintain accessibility guarantees centrally.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple, nonEmptyStringSchema } from "../schema/shared"

const radixPolicySchema = z
  .object({
    allowDirectPrimitiveImportOutsideUiOwner: z.boolean(),
    requirePrimitiveWrappingInUiOwner: z.boolean(),
    allowAsChild: z.boolean(),
    allowCustomBehaviorForks: z.boolean(),
    allowAdHocAccessibilityOverrides: z.boolean(),
    allowedPrimitivePackages: z.array(nonEmptyStringSchema).min(1).readonly(),
  })
  .strict()

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
  radixPolicy.allowedPrimitivePackages as unknown as [string, ...string[]]
)

const radixContractPolicySchema = z
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
     * Warn if local open/checked/selected state appears to replace
     * primitive-controlled behavior in wrapper files.
     */
    warnOnLocalStateReplacingPrimitiveBehavior: z.boolean(),

    /**
     * Warn if asChild-capable wrappers appear to remove composition flexibility.
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
