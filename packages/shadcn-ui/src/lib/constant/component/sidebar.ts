/**
 * SEMANTIC CONTRACT — sidebar
 * Source: `src/components/ui/sidebar.tsx` — `sidebarMenuButtonVariants` cva.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const sidebarMenuButtonVariantValues = defineTuple(["default", "outline"])
export const sidebarMenuButtonVariantSchema = z.enum(
  sidebarMenuButtonVariantValues
)
export type SidebarMenuButtonVariant = z.infer<
  typeof sidebarMenuButtonVariantSchema
>

export const sidebarMenuButtonSizeValues = defineTuple(["default", "sm", "lg"])
export const sidebarMenuButtonSizeSchema = z.enum(sidebarMenuButtonSizeValues)
export type SidebarMenuButtonSize = z.infer<
  typeof sidebarMenuButtonSizeSchema
>

const sidebarDefaultsSchema = z
  .object({
    menuButtonVariant: sidebarMenuButtonVariantSchema,
    menuButtonSize: sidebarMenuButtonSizeSchema,
  })
  .strict()

export const sidebarDefaults = defineConstMap(
  sidebarDefaultsSchema.parse({
    menuButtonVariant: "default",
    menuButtonSize: "default",
  })
)

const sidebarPolicySchema = z
  .object({
    allowFeatureLevelMenuButtonVariantExtension: z.boolean(),
    allowFeatureLevelMenuButtonSizeExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const sidebarPolicy = defineConstMap(
  sidebarPolicySchema.parse({
    allowFeatureLevelMenuButtonVariantExtension: false,
    allowFeatureLevelMenuButtonSizeExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const sidebarContract = defineComponentContract({
  vocabularies: {
    menuButtonVariant: sidebarMenuButtonVariantValues,
    menuButtonSize: sidebarMenuButtonSizeValues,
  },
  defaults: sidebarDefaults,
  policy: sidebarPolicy,
})
