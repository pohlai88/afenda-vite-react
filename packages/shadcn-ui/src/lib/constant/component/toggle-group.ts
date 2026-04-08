/**
 * SEMANTIC CONTRACT — toggle-group
 * Source: `src/components/ui/toggle-group.tsx` — reuses toggle variants/sizes + orientation.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

import { toggleSizeValues, toggleVariantValues } from "./toggle"

export const toggleGroupOrientationValues = defineTuple([
  "horizontal",
  "vertical",
])
export const toggleGroupOrientationSchema = z.enum(toggleGroupOrientationValues)
export type ToggleGroupOrientation = z.infer<
  typeof toggleGroupOrientationSchema
>

const toggleGroupDefaultsSchema = z
  .object({
    variant: z.enum(toggleVariantValues),
    size: z.enum(toggleSizeValues),
    orientation: toggleGroupOrientationSchema,
  })
  .strict()

export const toggleGroupDefaults = defineConstMap(
  toggleGroupDefaultsSchema.parse({
    variant: "default",
    size: "default",
    orientation: "horizontal",
  })
)

const toggleGroupPolicySchema = z
  .object({
    allowFeatureLevelSpacingFork: z.boolean(),
    allowFeatureLevelOrientationExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const toggleGroupPolicy = defineConstMap(
  toggleGroupPolicySchema.parse({
    allowFeatureLevelSpacingFork: false,
    allowFeatureLevelOrientationExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const toggleGroupContract = defineComponentContract({
  vocabularies: {
    variant: toggleVariantValues,
    size: toggleSizeValues,
    orientation: toggleGroupOrientationValues,
  },
  defaults: toggleGroupDefaults,
  policy: toggleGroupPolicy,
})
