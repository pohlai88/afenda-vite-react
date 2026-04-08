/**
 * SEMANTIC CONTRACT — direction
 * Source: `src/components/ui/direction.tsx` — Radix `DirectionProvider` `dir` / `direction`.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const directionDirValues = defineTuple(["ltr", "rtl"])
export const directionDirSchema = z.enum(directionDirValues)
export type DirectionDir = z.infer<typeof directionDirSchema>

const directionDefaultsSchema = z
  .object({ dir: directionDirSchema })
  .strict()

export const directionDefaults = defineConstMap(
  directionDefaultsSchema.parse({ dir: "ltr" })
)

const directionPolicySchema = z
  .object({
    allowFeatureLevelDirOverrideOutsideProvider: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const directionPolicy = defineConstMap(
  directionPolicySchema.parse({
    allowFeatureLevelDirOverrideOutsideProvider: false,
    allowInlineVisualStyleProps: false,
  })
)

export const directionContract = defineComponentContract({
  vocabularies: { dir: directionDirValues },
  defaults: directionDefaults,
  policy: directionPolicy,
})
