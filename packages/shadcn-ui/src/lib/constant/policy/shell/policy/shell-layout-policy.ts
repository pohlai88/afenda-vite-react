/**
 * GOVERNANCE POLICY — shell-layout-policy
 * Structural layout guarantees for shell regions (scroll, sticky, density, insets, responsive shell).
 * Scope: layout truth per zone; complements shell zones in shell-policy.
 * Consumption: shell runtime, layout composition, validators.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellLayoutPolicy, parseShellLayoutPolicy, shellLayoutPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellLayoutUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellLayoutUtils.defaults`, `ShellLayoutUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"
import { shellZoneSchema } from "./shell-policy"

export const shellRegionScrollModeValues = defineTuple([
  "fixed",
  "sticky",
  "scroll",
  "auto",
])
export const shellRegionScrollModeSchema = z
  .enum(shellRegionScrollModeValues)
  .describe("Scroll behavior for a shell region: fixed, sticky, scroll, or auto.")
export type ShellRegionScrollMode = (typeof shellRegionScrollModeValues)[number]

export const shellLayoutRegionSchema = z
  .object({
    zone: shellZoneSchema.describe("Shell zone for this region."),
    scrollMode: shellRegionScrollModeSchema.describe("Scroll behavior for this region."),
    allowDensityInteraction: z
      .boolean()
      .describe("Whether density settings affect this region."),
    enforceContentMaxWidth: z
      .boolean()
      .describe("When true, shell guarantees max readable width for primary content."),
  })
  .strict()
  .describe("Layout rules for a single governed shell region.")

export const shellLayoutPolicySchema = z
  .object({
    regions: z
      .array(shellLayoutRegionSchema)
      .min(1)
      .describe("Ordered list of governed shell regions."),
    allowSidebarCollapse: z.boolean().default(true).describe("Allow the sidebar to collapse."),
    requireStableOverlayMountRegion: z
      .boolean()
      .default(true)
      .describe("Overlay host must remain a stable mount node for portals."),
    allowFeatureLevelMobileShellFork: z
      .boolean()
      .default(false)
      .describe("Mobile adaptation must not fork shell zone vocabulary at feature level."),
  })
  .strict()
  .describe("Structural layout doctrine for shell regions (scroll, sticky, density, responsive).")

export type ShellLayoutPolicy = z.infer<typeof shellLayoutPolicySchema>
export type ShellLayoutPolicyInput = z.input<typeof shellLayoutPolicySchema>

export const shellLayoutPolicy = defineConstMap(
  shellLayoutPolicySchema.parse({
    regions: [
      { zone: "root", scrollMode: "auto", allowDensityInteraction: true, enforceContentMaxWidth: false },
      { zone: "header", scrollMode: "sticky", allowDensityInteraction: true, enforceContentMaxWidth: false },
      { zone: "sidebar", scrollMode: "scroll", allowDensityInteraction: true, enforceContentMaxWidth: false },
      { zone: "content", scrollMode: "scroll", allowDensityInteraction: true, enforceContentMaxWidth: true },
      { zone: "panel", scrollMode: "scroll", allowDensityInteraction: true, enforceContentMaxWidth: true },
      { zone: "overlay", scrollMode: "fixed", allowDensityInteraction: false, enforceContentMaxWidth: false },
      { zone: "command", scrollMode: "fixed", allowDensityInteraction: false, enforceContentMaxWidth: false },
      { zone: "footer", scrollMode: "sticky", allowDensityInteraction: true, enforceContentMaxWidth: true },
    ],
  })
)

export function parseShellLayoutPolicy(value: unknown): ShellLayoutPolicy {
  return shellLayoutPolicySchema.parse(value)
}

export function assertShellLayoutPolicy(input: unknown): ShellLayoutPolicy {
  try {
    return shellLayoutPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellLayoutPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellLayoutPolicy(
  input: unknown
):
  | { success: true; data: ShellLayoutPolicy }
  | { success: false; error: string } {
  const result = shellLayoutPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellLayoutPolicy(input: unknown): input is ShellLayoutPolicy {
  return shellLayoutPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellLayoutUtils = Object.freeze({
  schema: shellLayoutPolicySchema,
  assert: assertShellLayoutPolicy,
  is: isShellLayoutPolicy,
  parse: parseShellLayoutPolicy,
  safeParse: safeParseShellLayoutPolicy,
  defaults: shellLayoutPolicy,
})
