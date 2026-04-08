/**
 * SEMANTIC CONTRACT — carousel
 * Source: `src/components/ui/carousel.tsx` — `orientation?: "horizontal" | "vertical"`.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const carouselOrientationValues = defineTuple(["horizontal", "vertical"])
export const carouselOrientationSchema = z.enum(carouselOrientationValues)
export type CarouselOrientation = z.infer<typeof carouselOrientationSchema>

const carouselDefaultsSchema = z
  .object({ orientation: carouselOrientationSchema })
  .strict()

export const carouselDefaults = defineConstMap(
  carouselDefaultsSchema.parse({ orientation: "horizontal" })
)

const carouselPolicySchema = z
  .object({
    allowFeatureLevelOrientationExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const carouselPolicy = defineConstMap(
  carouselPolicySchema.parse({
    allowFeatureLevelOrientationExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const carouselContract = defineComponentContract({
  vocabularies: { orientation: carouselOrientationValues },
  defaults: carouselDefaults,
  policy: carouselPolicy,
})
