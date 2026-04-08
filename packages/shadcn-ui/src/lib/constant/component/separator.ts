/**
 * SEMANTIC CONTRACT — separator
 * Source: `src/components/ui/separator.tsx` — `orientation` prop default `horizontal`.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const separatorOrientationValues = defineTuple(["horizontal", "vertical"])
export const separatorOrientationSchema = z.enum(separatorOrientationValues)
export type SeparatorOrientation = z.infer<typeof separatorOrientationSchema>

const separatorDefaultsSchema = z
  .object({ orientation: separatorOrientationSchema })
  .strict()

export const separatorDefaults = defineConstMap(
  separatorDefaultsSchema.parse({ orientation: "horizontal" })
)

const separatorPolicySchema = z
  .object({
    allowFeatureLevelOrientationExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const separatorPolicy = defineConstMap(
  separatorPolicySchema.parse({
    allowFeatureLevelOrientationExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const separatorContract = defineComponentContract({
  vocabularies: { orientation: separatorOrientationValues },
  defaults: separatorDefaults,
  policy: separatorPolicy,
})
