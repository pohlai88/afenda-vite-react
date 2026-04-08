/**
 * SEMANTIC CONTRACT — input-otp
 * Source: `src/components/ui/input-otp.tsx` (composition / input-otp primitive).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const inputOtpVariantValues = defineTuple(["default"])
export const inputOtpVariantSchema = z.enum(inputOtpVariantValues)
export type InputOtpVariant = z.infer<typeof inputOtpVariantSchema>

const inputOtpDefaultsSchema = z
  .object({ variant: inputOtpVariantSchema })
  .strict()

export const inputOtpDefaults = defineConstMap(
  inputOtpDefaultsSchema.parse({ variant: "default" })
)

const inputOtpPolicySchema = z
  .object({
    allowFeatureLevelSlotFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const inputOtpPolicy = defineConstMap(
  inputOtpPolicySchema.parse({
    allowFeatureLevelSlotFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const inputOtpContract = defineComponentContract({
  vocabularies: { variant: inputOtpVariantValues },
  defaults: inputOtpDefaults,
  policy: inputOtpPolicy,
})
