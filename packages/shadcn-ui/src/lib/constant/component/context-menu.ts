/**
 * SEMANTIC CONTRACT — context-menu
 * Source: `src/components/ui/context-menu.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const contextMenuVariantValues = defineTuple(["default"])
export const contextMenuVariantSchema = z.enum(contextMenuVariantValues)
export type ContextMenuVariant = z.infer<typeof contextMenuVariantSchema>

const contextMenuDefaultsSchema = z
  .object({ variant: contextMenuVariantSchema })
  .strict()

export const contextMenuDefaults = defineConstMap(
  contextMenuDefaultsSchema.parse({ variant: "default" })
)

const contextMenuPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const contextMenuPolicy = defineConstMap(
  contextMenuPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const contextMenuContract = defineComponentContract({
  vocabularies: { variant: contextMenuVariantValues },
  defaults: contextMenuDefaults,
  policy: contextMenuPolicy,
})
