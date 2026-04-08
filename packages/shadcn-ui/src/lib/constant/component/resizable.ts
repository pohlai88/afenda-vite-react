/**
 * SEMANTIC CONTRACT — resizable
 * Source: `src/components/ui/resizable.tsx` (react-resizable-panels composition).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const resizableVariantValues = defineTuple(["default"])
export const resizableVariantSchema = z.enum(resizableVariantValues)
export type ResizableVariant = z.infer<typeof resizableVariantSchema>

const resizableDefaultsSchema = z
  .object({ variant: resizableVariantSchema })
  .strict()

export const resizableDefaults = defineConstMap(
  resizableDefaultsSchema.parse({ variant: "default" })
)

const resizablePolicySchema = z
  .object({
    allowFeatureLevelPanelFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const resizablePolicy = defineConstMap(
  resizablePolicySchema.parse({
    allowFeatureLevelPanelFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const resizableContract = defineComponentContract({
  vocabularies: { variant: resizableVariantValues },
  defaults: resizableDefaults,
  policy: resizablePolicy,
})
