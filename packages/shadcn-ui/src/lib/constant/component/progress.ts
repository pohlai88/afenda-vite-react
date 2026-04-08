/**
 * SEMANTIC CONTRACT — progress
 * Source: `src/components/ui/progress.tsx` (Radix primitive wrapper).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const progressVariantValues = defineTuple(["default"])
export const progressVariantSchema = z.enum(progressVariantValues)
export type ProgressVariant = z.infer<typeof progressVariantSchema>

const progressDefaultsSchema = z
  .object({ variant: progressVariantSchema })
  .strict()

export const progressDefaults = defineConstMap(
  progressDefaultsSchema.parse({ variant: "default" })
)

const progressPolicySchema = z
  .object({
    allowFeatureLevelPrimitiveFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const progressPolicy = defineConstMap(
  progressPolicySchema.parse({
    allowFeatureLevelPrimitiveFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const progressContract = defineComponentContract({
  vocabularies: { variant: progressVariantValues },
  defaults: progressDefaults,
  policy: progressPolicy,
})
