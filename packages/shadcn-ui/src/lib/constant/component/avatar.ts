/**
 * SEMANTIC CONTRACT — avatar
 * Source: `src/components/ui/avatar.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const avatarVariantValues = defineTuple(["default"])
export const avatarVariantSchema = z.enum(avatarVariantValues)
export type AvatarVariant = z.infer<typeof avatarVariantSchema>

const avatarDefaultsSchema = z
  .object({ variant: avatarVariantSchema })
  .strict()

export const avatarDefaults = defineConstMap(
  avatarDefaultsSchema.parse({ variant: "default" })
)

const avatarPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const avatarPolicy = defineConstMap(
  avatarPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const avatarContract = defineComponentContract({
  vocabularies: { variant: avatarVariantValues },
  defaults: avatarDefaults,
  policy: avatarPolicy,
})
