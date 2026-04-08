/**
 * SEMANTIC CONTRACT — dropdown-menu
 * Source: `src/components/ui/dropdown-menu.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const dropdownMenuVariantValues = defineTuple(["default"])
export const dropdownMenuVariantSchema = z.enum(dropdownMenuVariantValues)
export type DropdownMenuVariant = z.infer<typeof dropdownMenuVariantSchema>

const dropdownMenuDefaultsSchema = z
  .object({ variant: dropdownMenuVariantSchema })
  .strict()

export const dropdownMenuDefaults = defineConstMap(
  dropdownMenuDefaultsSchema.parse({ variant: "default" })
)

const dropdownMenuPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const dropdownMenuPolicy = defineConstMap(
  dropdownMenuPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const dropdownMenuContract = defineComponentContract({
  vocabularies: { variant: dropdownMenuVariantValues },
  defaults: dropdownMenuDefaults,
  policy: dropdownMenuPolicy,
})
