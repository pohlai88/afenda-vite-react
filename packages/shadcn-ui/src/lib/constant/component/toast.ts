/**
 * SEMANTIC CONTRACT — toast
 * Source: `src/components/ui/toast.tsx` (toast primitives / composition).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const toastVariantValues = defineTuple(["default"])
export const toastVariantSchema = z.enum(toastVariantValues)
export type ToastVariant = z.infer<typeof toastVariantSchema>

const toastDefaultsSchema = z
  .object({ variant: toastVariantSchema })
  .strict()

export const toastDefaults = defineConstMap(
  toastDefaultsSchema.parse({ variant: "default" })
)

const toastPolicySchema = z
  .object({
    allowFeatureLevelToastSurfaceFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const toastPolicy = defineConstMap(
  toastPolicySchema.parse({
    allowFeatureLevelToastSurfaceFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const toastContract = defineComponentContract({
  vocabularies: { variant: toastVariantValues },
  defaults: toastDefaults,
  policy: toastPolicy,
})
