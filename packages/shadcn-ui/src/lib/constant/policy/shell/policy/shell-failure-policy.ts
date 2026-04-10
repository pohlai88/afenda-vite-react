/**
 * GOVERNANCE POLICY — shell-failure-policy
 * Deterministic fallback behavior when shell services or providers fail (metadata, tenant, nav, search).
 * Scope: doctrine-level defaults; UI copy and telemetry are implementation details.
 * Consumption: error boundaries, providers, validators.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellFailurePolicy, parseShellFailurePolicy, shellFailurePolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellFailureUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellFailureUtils.defaults`, `ShellFailureUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

export const shellFailureStrategyValues = defineTuple([
  "block_shell",
  "degraded_shell",
  "retry",
  "fallback_route",
])
export const shellFailureStrategySchema = z
  .enum(shellFailureStrategyValues)
  .describe("How the shell responds when a required service or provider fails.")
export type ShellFailureStrategy = (typeof shellFailureStrategyValues)[number]

export const shellFailurePolicySchema = z
  .object({
    onShellMetadataProviderMissing: shellFailureStrategySchema
      .default("block_shell")
      .describe("Strategy when the shell metadata provider is missing."),
    onTenantResolutionFailure: shellFailureStrategySchema
      .default("degraded_shell")
      .describe("Strategy when tenant resolution fails."),
    onWorkspaceResolutionFailure: shellFailureStrategySchema
      .default("degraded_shell")
      .describe("Strategy when workspace resolution fails."),
    onNavigationRegistryFailure: shellFailureStrategySchema
      .default("degraded_shell")
      .describe("Strategy when the navigation registry fails."),
    onSearchProviderFailure: shellFailureStrategySchema
      .default("degraded_shell")
      .describe("Strategy when the search provider fails."),
    allowPartialShellDegradation: z
      .boolean()
      .default(true)
      .describe("Allow partial degradation of shell services instead of failing closed."),
  })
  .strict()
  .describe("Failure and degradation doctrine for shell runtime dependencies.")

export type ShellFailurePolicy = z.infer<typeof shellFailurePolicySchema>
export type ShellFailurePolicyInput = z.input<typeof shellFailurePolicySchema>

export const shellFailurePolicy = defineConstMap(
  shellFailurePolicySchema.parse({})
)

export function parseShellFailurePolicy(value: unknown): ShellFailurePolicy {
  return shellFailurePolicySchema.parse(value)
}

export function assertShellFailurePolicy(input: unknown): ShellFailurePolicy {
  try {
    return shellFailurePolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellFailurePolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellFailurePolicy(
  input: unknown
):
  | { success: true; data: ShellFailurePolicy }
  | { success: false; error: string } {
  const result = shellFailurePolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellFailurePolicy(input: unknown): input is ShellFailurePolicy {
  return shellFailurePolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellFailureUtils = Object.freeze({
  schema: shellFailurePolicySchema,
  assert: assertShellFailurePolicy,
  is: isShellFailurePolicy,
  parse: parseShellFailurePolicy,
  safeParse: safeParseShellFailurePolicy,
  defaults: shellFailurePolicy,
})
