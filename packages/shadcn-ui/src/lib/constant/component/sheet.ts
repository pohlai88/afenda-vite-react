/**
 * SEMANTIC CONTRACT — sheet
 * Source: `src/components/ui/sheet.tsx` — `side?: "top" | "right" | "bottom" | "left"`.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const sheetSideValues = defineTuple(["top", "right", "bottom", "left"])
export const sheetSideSchema = z.enum(sheetSideValues)
export type SheetSide = z.infer<typeof sheetSideSchema>

const sheetDefaultsSchema = z
  .object({ side: sheetSideSchema })
  .strict()

export const sheetDefaults = defineConstMap(
  sheetDefaultsSchema.parse({ side: "right" })
)

const sheetPolicySchema = z
  .object({
    allowFeatureLevelSideExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const sheetPolicy = defineConstMap(
  sheetPolicySchema.parse({
    allowFeatureLevelSideExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const sheetContract = defineComponentContract({
  vocabularies: { side: sheetSideValues },
  defaults: sheetDefaults,
  policy: sheetPolicy,
})
