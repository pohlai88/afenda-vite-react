/**
 * SEMANTIC CONTRACT — alert-dialog
 * Source: `src/components/ui/alert-dialog.tsx` — `size?: "default" | "sm"` on content.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const alertDialogContentSizeValues = defineTuple(["default", "sm"])
export const alertDialogContentSizeSchema = z.enum(alertDialogContentSizeValues)
export type AlertDialogContentSize = z.infer<
  typeof alertDialogContentSizeSchema
>

const alertDialogDefaultsSchema = z
  .object({ contentSize: alertDialogContentSizeSchema })
  .strict()

export const alertDialogDefaults = defineConstMap(
  alertDialogDefaultsSchema.parse({ contentSize: "default" })
)

const alertDialogPolicySchema = z
  .object({
    allowFeatureLevelContentSizeExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const alertDialogPolicy = defineConstMap(
  alertDialogPolicySchema.parse({
    allowFeatureLevelContentSizeExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const alertDialogContract = defineComponentContract({
  vocabularies: { contentSize: alertDialogContentSizeValues },
  defaults: alertDialogDefaults,
  policy: alertDialogPolicy,
})
