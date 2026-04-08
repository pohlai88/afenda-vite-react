/**
 * SEMANTIC CONTRACT — scroll-area
 * Source: `src/components/ui/scroll-area.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const scrollAreaVariantValues = defineTuple(["default"])
export const scrollAreaVariantSchema = z.enum(scrollAreaVariantValues)
export type ScrollAreaVariant = z.infer<typeof scrollAreaVariantSchema>

const scrollAreaDefaultsSchema = z
  .object({ variant: scrollAreaVariantSchema })
  .strict()

export const scrollAreaDefaults = defineConstMap(
  scrollAreaDefaultsSchema.parse({ variant: "default" })
)

const scrollAreaPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const scrollAreaPolicy = defineConstMap(
  scrollAreaPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const scrollAreaContract = defineComponentContract({
  vocabularies: { variant: scrollAreaVariantValues },
  defaults: scrollAreaDefaults,
  policy: scrollAreaPolicy,
})
