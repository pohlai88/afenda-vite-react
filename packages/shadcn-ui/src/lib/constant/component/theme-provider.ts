/**
 * SEMANTIC CONTRACT — theme-provider
 * Source: `src/components/theme-provider.tsx` — persisted `Theme` union.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const themeProviderThemeValues = defineTuple(["dark", "light", "system"])
export const themeProviderThemeSchema = z.enum(themeProviderThemeValues)
export type ThemeProviderTheme = z.infer<typeof themeProviderThemeSchema>

const themeProviderDefaultsSchema = z
  .object({ defaultTheme: themeProviderThemeSchema })
  .strict()

export const themeProviderDefaults = defineConstMap(
  themeProviderDefaultsSchema.parse({ defaultTheme: "system" })
)

const themeProviderPolicySchema = z
  .object({
    allowFeatureLevelStorageKeyFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const themeProviderPolicy = defineConstMap(
  themeProviderPolicySchema.parse({
    allowFeatureLevelStorageKeyFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const themeProviderContract = defineComponentContract({
  vocabularies: { theme: themeProviderThemeValues },
  defaults: themeProviderDefaults,
  policy: themeProviderPolicy,
})
