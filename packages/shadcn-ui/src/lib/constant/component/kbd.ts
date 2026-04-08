/**
 * SEMANTIC CONTRACT — kbd
 * Source: `src/components/ui/kbd.tsx` (keyboard hint surface).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const kbdVariantValues = defineTuple(["default"])
export const kbdVariantSchema = z.enum(kbdVariantValues)
export type KbdVariant = z.infer<typeof kbdVariantSchema>

const kbdDefaultsSchema = z
  .object({ variant: kbdVariantSchema })
  .strict()

export const kbdDefaults = defineConstMap(
  kbdDefaultsSchema.parse({ variant: "default" })
)

const kbdPolicySchema = z
  .object({
    allowFeatureLevelPresentationFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const kbdPolicy = defineConstMap(
  kbdPolicySchema.parse({
    allowFeatureLevelPresentationFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const kbdContract = defineComponentContract({
  vocabularies: { variant: kbdVariantValues },
  defaults: kbdDefaults,
  policy: kbdPolicy,
})
