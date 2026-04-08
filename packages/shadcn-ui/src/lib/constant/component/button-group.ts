/**
 * SEMANTIC CONTRACT — button-group
 * Source: `src/components/ui/button-group.tsx` — `buttonGroupVariants` orientation cva.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const buttonGroupOrientationValues = defineTuple([
  "horizontal",
  "vertical",
])
export const buttonGroupOrientationSchema = z.enum(buttonGroupOrientationValues)
export type ButtonGroupOrientation = z.infer<
  typeof buttonGroupOrientationSchema
>

const buttonGroupDefaultsSchema = z
  .object({ orientation: buttonGroupOrientationSchema })
  .strict()

export const buttonGroupDefaults = defineConstMap(
  buttonGroupDefaultsSchema.parse({ orientation: "horizontal" })
)

const buttonGroupPolicySchema = z
  .object({
    allowFeatureLevelOrientationExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const buttonGroupPolicy = defineConstMap(
  buttonGroupPolicySchema.parse({
    allowFeatureLevelOrientationExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const buttonGroupContract = defineComponentContract({
  vocabularies: { orientation: buttonGroupOrientationValues },
  defaults: buttonGroupDefaults,
  policy: buttonGroupPolicy,
})
