/**
 * GOVERNANCE POLICY — shell-tenant-context-policy
 * Tenant binding, resolution, switching semantics, and invalidation for multi-tenant shell correctness.
 * Scope: when tenant may be unresolved; what resets on switch; stale/revoked handling at doctrine level.
 * Consumption: tenant providers, switcher components, data caches, validators.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellTenantContextPolicy, parseShellTenantContextPolicy, shellTenantContextPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellTenantContextUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellTenantContextUtils.defaults`, `ShellTenantContextUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

export const shellTenantResolutionModeValues = defineTuple([
  "strict",
  "allow_unbound_preview",
])
export const shellTenantResolutionModeSchema = z
  .enum(shellTenantResolutionModeValues)
  .describe("Tenant resolution mode: strict binding or allow unbound preview.")
export type ShellTenantResolutionMode = (typeof shellTenantResolutionModeValues)[number]

export const shellTenantContextPolicySchema = z
  .object({
    resolutionMode: shellTenantResolutionModeSchema
      .default("strict")
      .describe("Tenant resolution mode: strict or allow unbound preview."),
    blockTenantRequiredChromeWhenUnresolved: z
      .boolean()
      .default(true)
      .describe("Shell surfaces that require a resolved tenant must not render in unbound mode when true."),
    invalidateClientCachesOnTenantSwitch: z
      .boolean()
      .default(true)
      .describe("Invalidate client caches and navigation scope on tenant switch."),
    resetWorkspaceOnTenantSwitch: z
      .boolean()
      .default(true)
      .describe("Reset workspace selection when tenant changes if workspace is tenant-scoped."),
    allowTenantSwitcherWhenStrict: z
      .boolean()
      .default(true)
      .describe("Allow tenant switcher UI even in strict mode."),
    declaredResetTargetsOnTenantSwitch: z
      .array(z.string().trim().min(1))
      .min(1)
      .default(["queryClient", "navigation_scope", "workspace_selection", "shell_metadata_cache"])
      .describe("Documented reset targets on tenant switch (validator may assert implementations)."),
  })
  .strict()
  .describe("Doctrine for tenant binding, switching, and invalidation in the shell.")

export type ShellTenantContextPolicy = z.infer<typeof shellTenantContextPolicySchema>
export type ShellTenantContextPolicyInput = z.input<typeof shellTenantContextPolicySchema>

export const shellTenantContextPolicy = defineConstMap(shellTenantContextPolicySchema.parse({}))

export function parseShellTenantContextPolicy(value: unknown): ShellTenantContextPolicy {
  return shellTenantContextPolicySchema.parse(value)
}

export function assertShellTenantContextPolicy(input: unknown): ShellTenantContextPolicy {
  try {
    return shellTenantContextPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellTenantContextPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellTenantContextPolicy(
  input: unknown
):
  | { success: true; data: ShellTenantContextPolicy }
  | { success: false; error: string } {
  const result = shellTenantContextPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellTenantContextPolicy(input: unknown): input is ShellTenantContextPolicy {
  return shellTenantContextPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellTenantContextUtils = Object.freeze({
  schema: shellTenantContextPolicySchema,
  assert: assertShellTenantContextPolicy,
  is: isShellTenantContextPolicy,
  parse: parseShellTenantContextPolicy,
  safeParse: safeParseShellTenantContextPolicy,
  defaults: shellTenantContextPolicy,
})
