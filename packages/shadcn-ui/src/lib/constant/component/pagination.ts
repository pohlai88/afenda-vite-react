/**
 * SEMANTIC CONTRACT — pagination
 * Source: `src/components/ui/pagination.tsx` (composition with buttons / links).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const paginationVariantValues = defineTuple(["default"])
export const paginationVariantSchema = z.enum(paginationVariantValues)
export type PaginationVariant = z.infer<typeof paginationVariantSchema>

const paginationDefaultsSchema = z
  .object({ variant: paginationVariantSchema })
  .strict()

export const paginationDefaults = defineConstMap(
  paginationDefaultsSchema.parse({ variant: "default" })
)

const paginationPolicySchema = z
  .object({
    allowFeatureLevelMarkupFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const paginationPolicy = defineConstMap(
  paginationPolicySchema.parse({
    allowFeatureLevelMarkupFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const paginationContract = defineComponentContract({
  vocabularies: { variant: paginationVariantValues },
  defaults: paginationDefaults,
  policy: paginationPolicy,
})
