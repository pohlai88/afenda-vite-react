/**
 * SEMANTIC CONTRACT — sonner
 * Source: `src/components/ui/sonner.tsx` — Sonner `theme` prop union.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const sonnerThemeValues = defineTuple(["light", "dark", "system"])
export const sonnerThemeSchema = z.enum(sonnerThemeValues)
export type SonnerTheme = z.infer<typeof sonnerThemeSchema>

const sonnerDefaultsSchema = z
  .object({ theme: sonnerThemeSchema })
  .strict()

export const sonnerDefaults = defineConstMap(
  sonnerDefaultsSchema.parse({ theme: "system" })
)

const sonnerPolicySchema = z
  .object({
    allowFeatureLevelToastIconFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const sonnerPolicy = defineConstMap(
  sonnerPolicySchema.parse({
    allowFeatureLevelToastIconFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const sonnerContract = defineComponentContract({
  vocabularies: { theme: sonnerThemeValues },
  defaults: sonnerDefaults,
  policy: sonnerPolicy,
})
