/**
 * SEMANTIC CONTRACT — popover
 * Source: `src/components/ui/popover.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const popoverVariantValues = defineTuple(["default"])
export const popoverVariantSchema = z.enum(popoverVariantValues)
export type PopoverVariant = z.infer<typeof popoverVariantSchema>

const popoverDefaultsSchema = z
  .object({ variant: popoverVariantSchema })
  .strict()

export const popoverDefaults = defineConstMap(
  popoverDefaultsSchema.parse({ variant: "default" })
)

const popoverPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const popoverPolicy = defineConstMap(
  popoverPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const popoverContract = defineComponentContract({
  vocabularies: { variant: popoverVariantValues },
  defaults: popoverDefaults,
  policy: popoverPolicy,
})
