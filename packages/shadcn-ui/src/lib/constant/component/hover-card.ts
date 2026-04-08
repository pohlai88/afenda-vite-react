/**
 * SEMANTIC CONTRACT — hover-card
 * Source: `src/components/ui/hover-card.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const hoverCardVariantValues = defineTuple(["default"])
export const hoverCardVariantSchema = z.enum(hoverCardVariantValues)
export type HoverCardVariant = z.infer<typeof hoverCardVariantSchema>

const hoverCardDefaultsSchema = z
  .object({ variant: hoverCardVariantSchema })
  .strict()

export const hoverCardDefaults = defineConstMap(
  hoverCardDefaultsSchema.parse({ variant: "default" })
)

const hoverCardPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const hoverCardPolicy = defineConstMap(
  hoverCardPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const hoverCardContract = defineComponentContract({
  vocabularies: { variant: hoverCardVariantValues },
  defaults: hoverCardDefaults,
  policy: hoverCardPolicy,
})
