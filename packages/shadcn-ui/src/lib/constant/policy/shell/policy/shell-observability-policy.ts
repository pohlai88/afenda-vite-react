/**
 * GOVERNANCE POLICY — shell-observability-policy
 * Shell lifecycle and diagnostic events vocabulary (policy-first; emitters may ship later).
 * Scope: named event types for tenant/workspace switch, overlay, search, shell readiness.
 * Consumption: analytics, diagnostics, validators.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellObservabilityPolicy, parseShellObservabilityPolicy, shellObservabilityPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellObservabilityUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellObservabilityUtils.defaults`, `ShellObservabilityUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

export const shellDiagnosticEventValues = defineTuple([
  "shell_ready",
  "tenant_switch",
  "workspace_switch",
  "search_open",
  "search_submit",
  "overlay_open",
  "overlay_close",
  "shell_metadata_failure",
])
export const shellDiagnosticEventSchema = z
  .enum(shellDiagnosticEventValues)
  .describe("Approved shell diagnostic / lifecycle event identifier.")
export type ShellDiagnosticEvent = (typeof shellDiagnosticEventValues)[number]

export const shellObservabilityPolicySchema = z
  .object({
    approvedDiagnosticEvents: z
      .array(shellDiagnosticEventSchema)
      .min(1)
      .default([...shellDiagnosticEventValues])
      .describe("Allowlisted diagnostic events the shell may emit or accept."),
    requireStructuredPayloadForShellEvents: z
      .boolean()
      .default(true)
      .describe("Require structured payloads for shell observability events."),
  })
  .strict()
  .describe("Doctrine for shell diagnostic events and telemetry payload shape.")

export type ShellObservabilityPolicy = z.infer<typeof shellObservabilityPolicySchema>
export type ShellObservabilityPolicyInput = z.input<typeof shellObservabilityPolicySchema>

export const shellObservabilityPolicy = defineConstMap(shellObservabilityPolicySchema.parse({}))

export function parseShellObservabilityPolicy(value: unknown): ShellObservabilityPolicy {
  return shellObservabilityPolicySchema.parse(value)
}

export function assertShellObservabilityPolicy(input: unknown): ShellObservabilityPolicy {
  try {
    return shellObservabilityPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellObservabilityPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellObservabilityPolicy(
  input: unknown
):
  | { success: true; data: ShellObservabilityPolicy }
  | { success: false; error: string } {
  const result = shellObservabilityPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellObservabilityPolicy(input: unknown): input is ShellObservabilityPolicy {
  return shellObservabilityPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellObservabilityUtils = Object.freeze({
  schema: shellObservabilityPolicySchema,
  assert: assertShellObservabilityPolicy,
  is: isShellObservabilityPolicy,
  parse: parseShellObservabilityPolicy,
  safeParse: safeParseShellObservabilityPolicy,
  defaults: shellObservabilityPolicy,
})
