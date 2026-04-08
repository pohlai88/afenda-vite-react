/**
 * SEMANTIC CONTRACT — navigation-menu
 * Source: `src/components/ui/navigation-menu.tsx` (cva base style only; no variant keys).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const navigationMenuVariantValues = defineTuple(["default"])
export const navigationMenuVariantSchema = z.enum(navigationMenuVariantValues)
export type NavigationMenuVariant = z.infer<typeof navigationMenuVariantSchema>

const navigationMenuDefaultsSchema = z
  .object({ variant: navigationMenuVariantSchema })
  .strict()

export const navigationMenuDefaults = defineConstMap(
  navigationMenuDefaultsSchema.parse({ variant: "default" })
)

const navigationMenuPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const navigationMenuPolicy = defineConstMap(
  navigationMenuPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const navigationMenuContract = defineComponentContract({
  vocabularies: { variant: navigationMenuVariantValues },
  defaults: navigationMenuDefaults,
  policy: navigationMenuPolicy,
})
