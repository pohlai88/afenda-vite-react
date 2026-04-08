/**
 * SEMANTIC CONTRACT — combobox
 * Source: `src/components/ui/combobox.tsx` (composition; no governed cva surface).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const comboboxVariantValues = defineTuple(["default"])
export const comboboxVariantSchema = z.enum(comboboxVariantValues)
export type ComboboxVariant = z.infer<typeof comboboxVariantSchema>

const comboboxDefaultsSchema = z
  .object({ variant: comboboxVariantSchema })
  .strict()

export const comboboxDefaults = defineConstMap(
  comboboxDefaultsSchema.parse({ variant: "default" })
)

const comboboxPolicySchema = z
  .object({
    allowFeatureLevelCompositionFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const comboboxPolicy = defineConstMap(
  comboboxPolicySchema.parse({
    allowFeatureLevelCompositionFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const comboboxContract = defineComponentContract({
  vocabularies: { variant: comboboxVariantValues },
  defaults: comboboxDefaults,
  policy: comboboxPolicy,
})
