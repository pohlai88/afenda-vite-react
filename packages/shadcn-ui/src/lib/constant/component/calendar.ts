/**
 * SEMANTIC CONTRACT — calendar
 * Source: `src/components/ui/calendar.tsx` (react-day-picker composition).
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const calendarVariantValues = defineTuple(["default"])
export const calendarVariantSchema = z.enum(calendarVariantValues)
export type CalendarVariant = z.infer<typeof calendarVariantSchema>

const calendarDefaultsSchema = z
  .object({ variant: calendarVariantSchema })
  .strict()

export const calendarDefaults = defineConstMap(
  calendarDefaultsSchema.parse({ variant: "default" })
)

const calendarPolicySchema = z
  .object({
    allowFeatureLevelDayPickerFork: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const calendarPolicy = defineConstMap(
  calendarPolicySchema.parse({
    allowFeatureLevelDayPickerFork: false,
    allowInlineVisualStyleProps: false,
  })
)

export const calendarContract = defineComponentContract({
  vocabularies: { variant: calendarVariantValues },
  defaults: calendarDefaults,
  policy: calendarPolicy,
})
