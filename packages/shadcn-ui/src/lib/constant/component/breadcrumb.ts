/**
 * SEMANTIC CONTRACT — breadcrumb
 * Source: `src/components/ui/breadcrumb.tsx` (composition / nav semantics).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const breadcrumbVariantValues = defineTuple(["default"])
export const breadcrumbVariantSchema = z.enum(breadcrumbVariantValues)
export type BreadcrumbVariant = z.infer<typeof breadcrumbVariantSchema>

const breadcrumbDefaultsSchema = z
  .object({ variant: breadcrumbVariantSchema })
  .strict()

export const breadcrumbDefaults = defineConstMap(
  breadcrumbDefaultsSchema.parse({ variant: "default" })
)

const breadcrumbPolicySchema = z
  .object({
    allowFeatureLevelStructureFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const breadcrumbPolicy = defineConstMap(
  breadcrumbPolicySchema.parse({
    allowFeatureLevelStructureFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const breadcrumbContract = defineComponentContract({
  vocabularies: { variant: breadcrumbVariantValues },
  defaults: breadcrumbDefaults,
  policy: breadcrumbPolicy,
})
