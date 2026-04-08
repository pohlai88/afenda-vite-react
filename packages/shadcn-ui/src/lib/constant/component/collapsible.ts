/**
 * SEMANTIC CONTRACT — collapsible
 * Source: `src/components/ui/collapsible.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const collapsibleVariantValues = defineTuple(["default"])
export const collapsibleVariantSchema = z.enum(collapsibleVariantValues)
export type CollapsibleVariant = z.infer<typeof collapsibleVariantSchema>

const collapsibleDefaultsSchema = z
  .object({ variant: collapsibleVariantSchema })
  .strict()

export const collapsibleDefaults = defineConstMap(
  collapsibleDefaultsSchema.parse({ variant: "default" })
)

const collapsiblePolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const collapsiblePolicy = defineConstMap(
  collapsiblePolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const collapsibleContract = defineComponentContract({
  vocabularies: { variant: collapsibleVariantValues },
  defaults: collapsibleDefaults,
  policy: collapsiblePolicy,
})
