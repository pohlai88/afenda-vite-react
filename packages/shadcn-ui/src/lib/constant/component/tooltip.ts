/**
 * SEMANTIC CONTRACT — tooltip
 * Source: `src/components/ui/tooltip.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const tooltipVariantValues = defineTuple(["default"])
export const tooltipVariantSchema = z.enum(tooltipVariantValues)
export type TooltipVariant = z.infer<typeof tooltipVariantSchema>

const tooltipDefaultsSchema = z
  .object({ variant: tooltipVariantSchema })
  .strict()

export const tooltipDefaults = defineConstMap(
  tooltipDefaultsSchema.parse({ variant: "default" })
)

const tooltipPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const tooltipPolicy = defineConstMap(
  tooltipPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const tooltipContract = defineComponentContract({
  vocabularies: { variant: tooltipVariantValues },
  defaults: tooltipDefaults,
  policy: tooltipPolicy,
})
