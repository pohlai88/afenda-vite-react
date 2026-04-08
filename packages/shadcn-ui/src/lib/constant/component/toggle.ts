/**
 * SEMANTIC CONTRACT — toggle
 * Source: `src/components/ui/toggle.tsx` — `toggleVariants` cva.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const toggleVariantValues = defineTuple(["default", "outline"])
export const toggleVariantSchema = z.enum(toggleVariantValues)
export type ToggleVariant = z.infer<typeof toggleVariantSchema>

export const toggleSizeValues = defineTuple(["default", "sm", "lg"])
export const toggleSizeSchema = z.enum(toggleSizeValues)
export type ToggleSize = z.infer<typeof toggleSizeSchema>

const toggleDefaultsSchema = z
  .object({
    variant: toggleVariantSchema,
    size: toggleSizeSchema,
  })
  .strict()

export const toggleDefaults = defineConstMap(
  toggleDefaultsSchema.parse({
    variant: "default",
    size: "default",
  })
)

const togglePolicySchema = z
  .object({
    allowFeatureLevelVariantExtension: z.boolean(),
    allowFeatureLevelSizeExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const togglePolicy = defineConstMap(
  togglePolicySchema.parse({
    allowFeatureLevelVariantExtension: false,
    allowFeatureLevelSizeExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const toggleContract = defineComponentContract({
  vocabularies: {
    variant: toggleVariantValues,
    size: toggleSizeValues,
  },
  defaults: toggleDefaults,
  policy: togglePolicy,
})
