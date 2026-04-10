/**
 * GOVERNANCE POLICY — shell-responsiveness-policy
 * Breakpoint-level shell transformations aligned with shell metadata viewport vocabulary.
 * Scope: doctrine for responsive shell; values must stay consistent with shell-metadata-contract viewport enum.
 * Consumption: responsive shell layout, header/sidebar behavior, validators.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellResponsivenessPolicy, parseShellResponsivenessPolicy, shellResponsivenessPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellResponsivenessUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellResponsivenessUtils.defaults`, `ShellResponsivenessUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap } from "../../../schema/shared"
import { shellViewportSchema } from "../contract/shell-metadata-contract"

export const shellResponsivenessPolicySchema = z
  .object({
    autoCollapseSidebarViewports: z
      .array(shellViewportSchema)
      .min(1)
      .default(["mobile", "tablet"])
      .describe("Viewports where the sidebar may auto-collapse (subset of shell viewport enum)."),
    allowSearchCollapseOnSmallViewports: z
      .boolean()
      .default(true)
      .describe("Allow the search bar to collapse to icon or shortcut on small viewports."),
  })
  .strict()
  .describe("Doctrine for responsive shell layout and header or sidebar behavior.")

export type ShellResponsivenessPolicy = z.infer<typeof shellResponsivenessPolicySchema>
export type ShellResponsivenessPolicyInput = z.input<typeof shellResponsivenessPolicySchema>

export const shellResponsivenessPolicy = defineConstMap(shellResponsivenessPolicySchema.parse({}))

export function parseShellResponsivenessPolicy(value: unknown): ShellResponsivenessPolicy {
  return shellResponsivenessPolicySchema.parse(value)
}

export function assertShellResponsivenessPolicy(input: unknown): ShellResponsivenessPolicy {
  try {
    return shellResponsivenessPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellResponsivenessPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellResponsivenessPolicy(
  input: unknown
):
  | { success: true; data: ShellResponsivenessPolicy }
  | { success: false; error: string } {
  const result = shellResponsivenessPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellResponsivenessPolicy(input: unknown): input is ShellResponsivenessPolicy {
  return shellResponsivenessPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellResponsivenessUtils = Object.freeze({
  schema: shellResponsivenessPolicySchema,
  assert: assertShellResponsivenessPolicy,
  is: isShellResponsivenessPolicy,
  parse: parseShellResponsivenessPolicy,
  safeParse: safeParseShellResponsivenessPolicy,
  defaults: shellResponsivenessPolicy,
})
