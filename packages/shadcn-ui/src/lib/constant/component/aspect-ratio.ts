/**
 * SEMANTIC CONTRACT — aspect-ratio
 * Source: `src/components/ui/aspect-ratio.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const aspectRatioVariantValues = defineTuple(["default"])
export const aspectRatioVariantSchema = z.enum(aspectRatioVariantValues)
export type AspectRatioVariant = z.infer<typeof aspectRatioVariantSchema>

const aspectRatioDefaultsSchema = z
  .object({ variant: aspectRatioVariantSchema })
  .strict()

export const aspectRatioDefaults = defineConstMap(
  aspectRatioDefaultsSchema.parse({ variant: "default" })
)

const aspectRatioPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const aspectRatioPolicy = defineConstMap(
  aspectRatioPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const aspectRatioContract = defineComponentContract({
  vocabularies: { variant: aspectRatioVariantValues },
  defaults: aspectRatioDefaults,
  policy: aspectRatioPolicy,
})
