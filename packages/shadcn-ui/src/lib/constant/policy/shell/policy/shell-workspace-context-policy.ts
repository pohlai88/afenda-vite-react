/**
 * GOVERNANCE POLICY — shell-workspace-context-policy
 * Workspace identity, optional vs mandatory workspace, rebinding on switch, and compatibility with tenant policy.
 * Scope: doctrine only; runtime ids remain in providers.
 * Consumption: workspace providers, switchers, search scope, validators.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellWorkspaceContextPolicy, parseShellWorkspaceContextPolicy, shellWorkspaceContextPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellWorkspaceContextUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellWorkspaceContextUtils.defaults`, `ShellWorkspaceContextUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

export const shellWorkspaceRequirementValues = defineTuple([
  "optional",
  "required",
])
export const shellWorkspaceRequirementSchema = z
  .enum(shellWorkspaceRequirementValues)
  .describe("Whether a resolved workspace is optional or required for shell correctness.")
export type ShellWorkspaceRequirement = (typeof shellWorkspaceRequirementValues)[number]

export const shellWorkspaceContextPolicySchema = z
  .object({
    workspaceRequirement: shellWorkspaceRequirementSchema
      .default("optional")
      .describe("Workspace requirement: optional or required."),
    allowUnboundWorkspaceInOptionalMode: z
      .boolean()
      .default(true)
      .describe("Allow workspace switcher without a resolved workspace when policy is optional."),
    rebindSearchScopeOnWorkspaceSwitch: z
      .boolean()
      .default(true)
      .describe("Rebind search scope when workspace changes."),
    rebindNavigationScopeOnWorkspaceSwitch: z
      .boolean()
      .default(true)
      .describe("Rebind navigation scope when workspace changes."),
    compatibleWithTenantPolicy: z
      .boolean()
      .default(true)
      .describe("Must align with tenant policy reset behavior when tenant changes."),
    declaredResetTargetsOnWorkspaceSwitch: z
      .array(z.string().trim().min(1))
      .min(1)
      .default(["workspace_capabilities", "shell_metadata_scope", "recent_items"])
      .describe("Documented reset targets on workspace switch (validator may assert implementations)."),
  })
  .strict()
  .describe("Doctrine for workspace identity, rebinding on switch, and tenant-policy alignment.")

export type ShellWorkspaceContextPolicy = z.infer<typeof shellWorkspaceContextPolicySchema>
export type ShellWorkspaceContextPolicyInput = z.input<typeof shellWorkspaceContextPolicySchema>

export const shellWorkspaceContextPolicy = defineConstMap(shellWorkspaceContextPolicySchema.parse({}))

export function parseShellWorkspaceContextPolicy(value: unknown): ShellWorkspaceContextPolicy {
  return shellWorkspaceContextPolicySchema.parse(value)
}

export function assertShellWorkspaceContextPolicy(input: unknown): ShellWorkspaceContextPolicy {
  try {
    return shellWorkspaceContextPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellWorkspaceContextPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellWorkspaceContextPolicy(
  input: unknown
):
  | { success: true; data: ShellWorkspaceContextPolicy }
  | { success: false; error: string } {
  const result = shellWorkspaceContextPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellWorkspaceContextPolicy(input: unknown): input is ShellWorkspaceContextPolicy {
  return shellWorkspaceContextPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellWorkspaceContextUtils = Object.freeze({
  schema: shellWorkspaceContextPolicySchema,
  assert: assertShellWorkspaceContextPolicy,
  is: isShellWorkspaceContextPolicy,
  parse: parseShellWorkspaceContextPolicy,
  safeParse: safeParseShellWorkspaceContextPolicy,
  defaults: shellWorkspaceContextPolicy,
})
