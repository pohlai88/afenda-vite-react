/**
 * SEMANTIC CONTRACT — accordion
 * Source: `src/components/ui/accordion.tsx` (Radix primitive wrapper; no cva variants).
 * Semantics: governed surface slot for registry and tooling alignment.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const accordionVariantValues = defineTuple(["default"])
export const accordionVariantSchema = z.enum(accordionVariantValues)
export type AccordionVariant = z.infer<typeof accordionVariantSchema>

const accordionDefaultsSchema = z
  .object({ variant: accordionVariantSchema })
  .strict()

export const accordionDefaults = defineConstMap(
  accordionDefaultsSchema.parse({ variant: "default" })
)

const accordionPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const accordionPolicy = defineConstMap(
  accordionPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const accordionContract = defineComponentContract({
  vocabularies: { variant: accordionVariantValues },
  defaults: accordionDefaults,
  policy: accordionPolicy,
})
