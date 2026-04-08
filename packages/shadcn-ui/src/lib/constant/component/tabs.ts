/**
 * SEMANTIC CONTRACT — tabs
 * Source: `src/components/ui/tabs.tsx` — `tabsListVariants` `variant` on `TabsList`.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const tabsListVariantValues = defineTuple(["default", "line"])
export const tabsListVariantSchema = z.enum(tabsListVariantValues)
export type TabsListVariant = z.infer<typeof tabsListVariantSchema>

const tabsDefaultsSchema = z
  .object({ listVariant: tabsListVariantSchema })
  .strict()

export const tabsDefaults = defineConstMap(
  tabsDefaultsSchema.parse({ listVariant: "default" })
)

const tabsPolicySchema = z
  .object({
    allowFeatureLevelListVariantExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const tabsPolicy = defineConstMap(
  tabsPolicySchema.parse({
    allowFeatureLevelListVariantExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const tabsContract = defineComponentContract({
  vocabularies: { listVariant: tabsListVariantValues },
  defaults: tabsDefaults,
  policy: tabsPolicy,
})
