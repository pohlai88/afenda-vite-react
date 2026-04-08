/**
 * SEMANTIC CONTRACT — spinner
 * Source: `src/components/ui/spinner.tsx` (status icon surface).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const spinnerVariantValues = defineTuple(["default"])
export const spinnerVariantSchema = z.enum(spinnerVariantValues)
export type SpinnerVariant = z.infer<typeof spinnerVariantSchema>

const spinnerDefaultsSchema = z
  .object({ variant: spinnerVariantSchema })
  .strict()

export const spinnerDefaults = defineConstMap(
  spinnerDefaultsSchema.parse({ variant: "default" })
)

const spinnerPolicySchema = z
  .object({
    allowFeatureLevelIconFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const spinnerPolicy = defineConstMap(
  spinnerPolicySchema.parse({
    allowFeatureLevelIconFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const spinnerContract = defineComponentContract({
  vocabularies: { variant: spinnerVariantValues },
  defaults: spinnerDefaults,
  policy: spinnerPolicy,
})
