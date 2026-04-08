/**
 * SEMANTIC CONTRACT — chart
 * Source: `src/components/ui/chart.tsx` — `THEMES = { light, dark }` for chart styling bridge.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const chartThemeKeyValues = defineTuple(["light", "dark"])
export const chartThemeKeySchema = z.enum(chartThemeKeyValues)
export type ChartThemeKey = z.infer<typeof chartThemeKeySchema>

const chartDefaultsSchema = z
  .object({ themeKey: chartThemeKeySchema })
  .strict()

export const chartDefaults = defineConstMap(
  chartDefaultsSchema.parse({ themeKey: "light" })
)

const chartPolicySchema = z
  .object({
    allowFeatureLevelChartConfigFork: z.boolean(),
    allowRawColorTokensInChartConfig: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const chartPolicy = defineConstMap(
  chartPolicySchema.parse({
    allowFeatureLevelChartConfigFork: false,
    allowRawColorTokensInChartConfig: false,
    allowInlineVisualStyleProps: false,
  })
)

export const chartContract = defineComponentContract({
  vocabularies: { themeKey: chartThemeKeyValues },
  defaults: chartDefaults,
  policy: chartPolicy,
})
