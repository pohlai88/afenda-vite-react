/**
 * SEMANTIC CONTRACT — empty
 * Source: `src/components/ui/empty.tsx` — `emptyMediaVariants` cva `variant`.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const emptyMediaVariantValues = defineTuple(["default", "icon"])
export const emptyMediaVariantSchema = z.enum(emptyMediaVariantValues)
export type EmptyMediaVariant = z.infer<typeof emptyMediaVariantSchema>

const emptyDefaultsSchema = z
  .object({ mediaVariant: emptyMediaVariantSchema })
  .strict()

export const emptyDefaults = defineConstMap(
  emptyDefaultsSchema.parse({ mediaVariant: "default" })
)

const emptyPolicySchema = z
  .object({
    allowFeatureLevelMediaVariantExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const emptyPolicy = defineConstMap(
  emptyPolicySchema.parse({
    allowFeatureLevelMediaVariantExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const emptyContract = defineComponentContract({
  vocabularies: { mediaVariant: emptyMediaVariantValues },
  defaults: emptyDefaults,
  policy: emptyPolicy,
})
