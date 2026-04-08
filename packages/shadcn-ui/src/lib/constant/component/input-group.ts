/**
 * SEMANTIC CONTRACT — input-group
 * Source: `src/components/ui/input-group.tsx` — addon `align` + button `size` cva.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const inputGroupAddonAlignValues = defineTuple([
  "inline-start",
  "inline-end",
  "block-start",
  "block-end",
])
export const inputGroupAddonAlignSchema = z.enum(inputGroupAddonAlignValues)
export type InputGroupAddonAlign = z.infer<typeof inputGroupAddonAlignSchema>

export const inputGroupButtonSizeValues = defineTuple([
  "xs",
  "sm",
  "icon-xs",
  "icon-sm",
])
export const inputGroupButtonSizeSchema = z.enum(inputGroupButtonSizeValues)
export type InputGroupButtonSize = z.infer<typeof inputGroupButtonSizeSchema>

const inputGroupDefaultsSchema = z
  .object({
    addonAlign: inputGroupAddonAlignSchema,
    groupButtonSize: inputGroupButtonSizeSchema,
  })
  .strict()

export const inputGroupDefaults = defineConstMap(
  inputGroupDefaultsSchema.parse({
    addonAlign: "inline-start",
    groupButtonSize: "xs",
  })
)

const inputGroupPolicySchema = z
  .object({
    allowFeatureLevelAddonAlignExtension: z.boolean(),
    allowFeatureLevelButtonSizeExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const inputGroupPolicy = defineConstMap(
  inputGroupPolicySchema.parse({
    allowFeatureLevelAddonAlignExtension: false,
    allowFeatureLevelButtonSizeExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const inputGroupContract = defineComponentContract({
  vocabularies: {
    addonAlign: inputGroupAddonAlignValues,
    groupButtonSize: inputGroupButtonSizeValues,
  },
  defaults: inputGroupDefaults,
  policy: inputGroupPolicy,
})
