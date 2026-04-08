/**
 * SEMANTIC CONTRACT — menubar
 * Source: `src/components/ui/menubar.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const menubarVariantValues = defineTuple(["default"])
export const menubarVariantSchema = z.enum(menubarVariantValues)
export type MenubarVariant = z.infer<typeof menubarVariantSchema>

const menubarDefaultsSchema = z
  .object({ variant: menubarVariantSchema })
  .strict()

export const menubarDefaults = defineConstMap(
  menubarDefaultsSchema.parse({ variant: "default" })
)

const menubarPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const menubarPolicy = defineConstMap(
  menubarPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const menubarContract = defineComponentContract({
  vocabularies: { variant: menubarVariantValues },
  defaults: menubarDefaults,
  policy: menubarPolicy,
})
