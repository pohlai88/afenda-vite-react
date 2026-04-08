/**
 * SEMANTIC CONTRACT — button
 * Defines the approved contract for governed button variants, sizes, defaults, and doctrine.
 * Semantics: variants and sizes must come from canonical governed unions.
 * Styling: compose from approved registries and wrappers, not feature-level reinvention.
 * Runtime: exported schemas validate trusted shapes where boundary reuse is needed.
 * Consumption: use exported defaults and policy; do not create local button taxonomies.
 * Defaults: import canonical defaults instead of repeating inline literals.
 * Boundaries: feature code should not define raw button variants or class-based extensions.
 * Constraints: no uncontrolled `string` props and no ad hoc semantic invention.
 * Changes: preserve compatibility where practical and validate governance behavior.
 * Purpose: keep button usage aligned with the semantic architecture.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const buttonVariantValues = defineTuple([
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
])
export const buttonVariantSchema = z.enum(buttonVariantValues)
export type ButtonVariant = z.infer<typeof buttonVariantSchema>

export const buttonSizeValues = defineTuple([
  "default",
  "xs",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
  "icon-lg",
  "text",
])
export const buttonSizeSchema = z.enum(buttonSizeValues)
export type ButtonSize = z.infer<typeof buttonSizeSchema>

const buttonDefaultsSchema = z
  .object({
    variant: buttonVariantSchema,
    size: buttonSizeSchema,
  })
  .strict()

export const buttonDefaults = defineConstMap(
  buttonDefaultsSchema.parse({
    variant: "default",
    size: "default",
  })
)

const buttonPolicySchema = z
  .object({
    allowLoadingState: z.boolean(),
    allowLeftIcon: z.boolean(),
    allowRightIcon: z.boolean(),
    allowIconOnly: z.boolean(),
    allowFeatureLevelVariants: z.boolean(),
    allowRawClassVariantExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const buttonPolicy = defineConstMap(
  buttonPolicySchema.parse({
    allowLoadingState: true,
    allowLeftIcon: true,
    allowRightIcon: true,
    allowIconOnly: true,
    allowFeatureLevelVariants: false,
    allowRawClassVariantExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const buttonContract = defineComponentContract({
  vocabularies: { variant: buttonVariantValues, size: buttonSizeValues },
  defaults: buttonDefaults,
  policy: buttonPolicy,
})
