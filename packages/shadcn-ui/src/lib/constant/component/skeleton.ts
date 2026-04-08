/**
 * SEMANTIC CONTRACT — skeleton
 * Source: `src/components/ui/skeleton.tsx` (loading placeholder surface).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const skeletonVariantValues = defineTuple(["default"])
export const skeletonVariantSchema = z.enum(skeletonVariantValues)
export type SkeletonVariant = z.infer<typeof skeletonVariantSchema>

const skeletonDefaultsSchema = z
  .object({ variant: skeletonVariantSchema })
  .strict()

export const skeletonDefaults = defineConstMap(
  skeletonDefaultsSchema.parse({ variant: "default" })
)

const skeletonPolicySchema = z
  .object({
    allowFeatureLevelShapeFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const skeletonPolicy = defineConstMap(
  skeletonPolicySchema.parse({
    allowFeatureLevelShapeFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const skeletonContract = defineComponentContract({
  vocabularies: { variant: skeletonVariantValues },
  defaults: skeletonDefaults,
  policy: skeletonPolicy,
})
