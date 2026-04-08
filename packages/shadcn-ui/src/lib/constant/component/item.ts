/**
 * SEMANTIC CONTRACT — item
 * Source: `src/components/ui/item.tsx` — `itemVariants` + `itemMediaVariants` cva.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const itemVariantValues = defineTuple(["default", "outline", "muted"])
export const itemVariantSchema = z.enum(itemVariantValues)
export type ItemVariant = z.infer<typeof itemVariantSchema>

export const itemSizeValues = defineTuple(["default", "sm", "xs"])
export const itemSizeSchema = z.enum(itemSizeValues)
export type ItemSize = z.infer<typeof itemSizeSchema>

export const itemMediaVariantValues = defineTuple(["default", "icon", "image"])
export const itemMediaVariantSchema = z.enum(itemMediaVariantValues)
export type ItemMediaVariant = z.infer<typeof itemMediaVariantSchema>

const itemDefaultsSchema = z
  .object({
    variant: itemVariantSchema,
    size: itemSizeSchema,
    mediaVariant: itemMediaVariantSchema,
  })
  .strict()

export const itemDefaults = defineConstMap(
  itemDefaultsSchema.parse({
    variant: "default",
    size: "default",
    mediaVariant: "default",
  })
)

const itemPolicySchema = z
  .object({
    allowFeatureLevelVariantExtension: z.boolean(),
    allowFeatureLevelSizeExtension: z.boolean(),
    allowFeatureLevelMediaVariantExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const itemPolicy = defineConstMap(
  itemPolicySchema.parse({
    allowFeatureLevelVariantExtension: false,
    allowFeatureLevelSizeExtension: false,
    allowFeatureLevelMediaVariantExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const itemContract = defineComponentContract({
  vocabularies: {
    variant: itemVariantValues,
    size: itemSizeValues,
    mediaVariant: itemMediaVariantValues,
  },
  defaults: itemDefaults,
  policy: itemPolicy,
})
