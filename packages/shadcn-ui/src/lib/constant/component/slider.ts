/**
 * SEMANTIC CONTRACT — slider
 * Source: `src/components/ui/slider.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const sliderVariantValues = defineTuple(["default"])
export const sliderVariantSchema = z.enum(sliderVariantValues)
export type SliderVariant = z.infer<typeof sliderVariantSchema>

const sliderDefaultsSchema = z
  .object({ variant: sliderVariantSchema })
  .strict()

export const sliderDefaults = defineConstMap(
  sliderDefaultsSchema.parse({ variant: "default" })
)

const sliderPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const sliderPolicy = defineConstMap(
  sliderPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const sliderContract = defineComponentContract({
  vocabularies: { variant: sliderVariantValues },
  defaults: sliderDefaults,
  policy: sliderPolicy,
})
