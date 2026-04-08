/**
 * SEMANTIC CONTRACT — drawer
 * Source: `src/components/ui/drawer.tsx` (Vaul) — `data-[vaul-drawer-direction=*]` values.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const drawerDirectionValues = defineTuple([
  "top",
  "bottom",
  "left",
  "right",
])
export const drawerDirectionSchema = z.enum(drawerDirectionValues)
export type DrawerDirection = z.infer<typeof drawerDirectionSchema>

const drawerDefaultsSchema = z
  .object({ direction: drawerDirectionSchema })
  .strict()

export const drawerDefaults = defineConstMap(
  drawerDefaultsSchema.parse({ direction: "bottom" })
)

const drawerPolicySchema = z
  .object({
    allowFeatureLevelDirectionExtension: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const drawerPolicy = defineConstMap(
  drawerPolicySchema.parse({
    allowFeatureLevelDirectionExtension: false,
    allowInlineVisualStyleProps: false,
  })
)

export const drawerContract = defineComponentContract({
  vocabularies: { direction: drawerDirectionValues },
  defaults: drawerDefaults,
  policy: drawerPolicy,
})
