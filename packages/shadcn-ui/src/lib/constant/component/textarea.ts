/**
 * SEMANTIC CONTRACT — textarea
 * Source: `src/components/ui/textarea.tsx` (single styled surface; no variant API).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const textareaVariantValues = defineTuple(["default"])
export const textareaVariantSchema = z.enum(textareaVariantValues)
export type TextareaVariant = z.infer<typeof textareaVariantSchema>

const textareaDefaultsSchema = z
  .object({ variant: textareaVariantSchema })
  .strict()

export const textareaDefaults = defineConstMap(
  textareaDefaultsSchema.parse({ variant: "default" })
)

const textareaPolicySchema = z
  .object({
    allowFeatureLevelSurfaceFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const textareaPolicy = defineConstMap(
  textareaPolicySchema.parse({
    allowFeatureLevelSurfaceFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const textareaContract = defineComponentContract({
  vocabularies: { variant: textareaVariantValues },
  defaults: textareaDefaults,
  policy: textareaPolicy,
})
