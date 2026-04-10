/**
 * GOVERNANCE POLICY — shell-overlay-policy
 * Overlay kinds, stacking, focus ownership, dismissal, and z-index discipline for shell overlays.
 * Scope: behavioral doctrine for ShellOverlayContainer and related surfaces.
 * Consumption: overlay host, modal systems, validators.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellOverlayPolicy, parseShellOverlayPolicy, shellOverlayPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellOverlayUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellOverlayUtils.defaults`, `ShellOverlayUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"
import { shellZoneSchema } from "./shell-policy"

export const shellOverlayKindValues = defineTuple([
  "modal",
  "drawer",
  "popover",
  "toast",
  "command_palette",
  "dialog",
])
export const shellOverlayKindSchema = z
  .enum(shellOverlayKindValues)
  .describe("Overlay surface kind for stacking and focus doctrine.")
export type ShellOverlayKind = (typeof shellOverlayKindValues)[number]

export const shellOverlayKindRuleSchema = z
  .object({
    kind: shellOverlayKindSchema.describe("Overlay kind for this rule."),
    stackPriority: z
      .number()
      .int()
      .min(0)
      .max(1000)
      .describe("Stacking priority for arbitration (higher wins when enforcing)."),
    allowConcurrentWith: z
      .array(shellOverlayKindSchema)
      .describe("Other overlay kinds allowed concurrently with this kind."),
    requiresFocusTrap: z.boolean().describe("Whether focus trap is required while open."),
    dismissOnEscape: z.boolean().describe("Dismiss overlay on Escape."),
    allowedMountZones: z
      .array(shellZoneSchema)
      .min(1)
      .describe("Shell zones where this overlay kind may mount."),
  })
  .strict()
  .describe("Governed rule for one overlay kind.")

export const shellOverlayPolicySchema = z
  .object({
    kindRules: z
      .array(shellOverlayKindRuleSchema)
      .min(1)
      .describe("Governed rules for each overlay kind."),
    enforceStackPriority: z
      .boolean()
      .default(true)
      .describe("Global modal arbitration: lower priority yields when higher is presented."),
  })
  .strict()
  .describe("Doctrine for overlay kinds, stacking, focus, dismissal, and mount zones.")

export type ShellOverlayPolicy = z.infer<typeof shellOverlayPolicySchema>
export type ShellOverlayPolicyInput = z.input<typeof shellOverlayPolicySchema>

export const shellOverlayPolicy = defineConstMap(
  shellOverlayPolicySchema.parse({
    kindRules: [
      {
        kind: "toast",
        stackPriority: 100,
        allowConcurrentWith: ["modal", "drawer", "popover", "command_palette", "dialog"],
        requiresFocusTrap: false,
        dismissOnEscape: false,
        allowedMountZones: ["overlay"],
      },
      {
        kind: "popover",
        stackPriority: 200,
        allowConcurrentWith: ["toast", "command_palette"],
        requiresFocusTrap: true,
        dismissOnEscape: true,
        allowedMountZones: ["overlay", "header", "content"],
      },
      {
        kind: "command_palette",
        stackPriority: 500,
        allowConcurrentWith: ["toast"],
        requiresFocusTrap: true,
        dismissOnEscape: true,
        allowedMountZones: ["overlay", "command"],
      },
      {
        kind: "modal",
        stackPriority: 610,
        allowConcurrentWith: ["toast"],
        requiresFocusTrap: true,
        dismissOnEscape: true,
        allowedMountZones: ["overlay"],
      },
      {
        kind: "drawer",
        stackPriority: 550,
        allowConcurrentWith: ["toast"],
        requiresFocusTrap: true,
        dismissOnEscape: true,
        allowedMountZones: ["overlay", "panel"],
      },
      {
        kind: "dialog",
        stackPriority: 600,
        allowConcurrentWith: ["toast"],
        requiresFocusTrap: true,
        dismissOnEscape: true,
        allowedMountZones: ["overlay"],
      },
    ],
  })
)

export function parseShellOverlayPolicy(value: unknown): ShellOverlayPolicy {
  return shellOverlayPolicySchema.parse(value)
}

export function assertShellOverlayPolicy(input: unknown): ShellOverlayPolicy {
  try {
    return shellOverlayPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellOverlayPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellOverlayPolicy(
  input: unknown
):
  | { success: true; data: ShellOverlayPolicy }
  | { success: false; error: string } {
  const result = shellOverlayPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellOverlayPolicy(input: unknown): input is ShellOverlayPolicy {
  return shellOverlayPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellOverlayUtils = Object.freeze({
  schema: shellOverlayPolicySchema,
  assert: assertShellOverlayPolicy,
  is: isShellOverlayPolicy,
  parse: parseShellOverlayPolicy,
  safeParse: safeParseShellOverlayPolicy,
  defaults: shellOverlayPolicy,
})
