/**
 * GOVERNANCE POLICY — shell-access-policy
 * Hidden vs disabled vs forbidden semantics for shell affordances under RBAC/PBAC.
 * Scope: doctrine for consistent access UX; enforcement remains in providers.
 * Consumption: permission gates, shell components, validators.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellAccessPolicy, parseShellAccessPolicy, shellAccessPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellAccessUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellAccessUtils.defaults`, `ShellAccessUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

export const shellAccessOutcomeValues = defineTuple([
  "visible",
  "hidden",
  "disabled",
  "forbidden",
])
export const shellAccessOutcomeSchema = z
  .enum(shellAccessOutcomeValues)
  .describe("Coarse access outcome for shell affordances and navigation.")
export type ShellAccessOutcome = (typeof shellAccessOutcomeValues)[number]

export const shellAccessPolicySchema = z
  .object({
    preferHiddenOverDisabledForMissingAccess: z
      .boolean()
      .default(true)
      .describe(
        "Prefer hiding over disabling when user lacks coarse access (product default)."
      ),
    showForbiddenAffordanceForSensitiveActions: z
      .boolean()
      .default(true)
      .describe(
        "Show explicit forbidden affordance for sensitive shell actions when blocked."
      ),
    defaultOutcomeForUnauthorizedNav: shellAccessOutcomeSchema
      .default("hidden")
      .describe("Default outcome for unauthorized navigation attempts."),
  })
  .strict()
  .describe("Shell access UX doctrine under RBAC/PBAC (enforcement lives in providers).")

export type ShellAccessPolicy = z.infer<typeof shellAccessPolicySchema>
export type ShellAccessPolicyInput = z.input<typeof shellAccessPolicySchema>

export const shellAccessPolicy = defineConstMap(
  shellAccessPolicySchema.parse({})
)

export function parseShellAccessPolicy(value: unknown): ShellAccessPolicy {
  return shellAccessPolicySchema.parse(value)
}

export function assertShellAccessPolicy(input: unknown): ShellAccessPolicy {
  try {
    return shellAccessPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellAccessPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellAccessPolicy(
  input: unknown
):
  | { success: true; data: ShellAccessPolicy }
  | { success: false; error: string } {
  const result = shellAccessPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellAccessPolicy(input: unknown): input is ShellAccessPolicy {
  return shellAccessPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellAccessUtils = Object.freeze({
  schema: shellAccessPolicySchema,
  assert: assertShellAccessPolicy,
  is: isShellAccessPolicy,
  parse: parseShellAccessPolicy,
  safeParse: safeParseShellAccessPolicy,
  defaults: shellAccessPolicy,
})
