/**
 * GOVERNANCE POLICY — shell-context-policy
 * Runtime shell scope governance.
 * Scope: declares legal shell scopes for rendering and governs whether
 *   authenticated / tenant / user / locale / theme context is required
 *   before governed UI is allowed to render.
 * Authority: supports shell and multitenant discipline without leaking
 *   runtime instance data (userId / tenantId stay runtime-only).
 * Consumption: CI, AST checkers, and shell providers read this policy.
 * Changes: adjust scope discipline deliberately; structural changes require migration planning.
 * Validation: schema-validated shape in validate-constants.
 * Purpose: keep shell-context requirements disciplined, auditable, and centrally governed.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellContextPolicy, parseShellContextPolicy, shellContextPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellContextUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellContextUtils.defaults`, `ShellContextUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

export const shellScopeValues = defineTuple([
  "public",
  "authenticated",
  "tenant",
  "operator",
])
export const shellScopeSchema = z
  .enum(shellScopeValues)
  .describe("Legal runtime shell scope for rendering and provider requirements.")
export type ShellScope = (typeof shellScopeValues)[number]

export const shellContextPolicySchema = z
  .object({
    defaultShellScope: shellScopeSchema
      .default("tenant")
      .describe("Default shell scope when the app does not override explicitly."),

    requireShellProvider: z
      .boolean()
      .default(true)
      .describe("Require a shell metadata provider before governed shell UI renders."),
    requireAuthProvider: z
      .boolean()
      .default(true)
      .describe("Require an authentication/session provider."),
    requireLocaleProvider: z
      .boolean()
      .default(true)
      .describe("Require a locale / i18n provider."),
    requireThemeProvider: z
      .boolean()
      .default(true)
      .describe("Require a theme provider."),

    requireTenantProviderInTenantScope: z
      .boolean()
      .default(true)
      .describe("In tenant scope, require a tenant context provider."),
    requireUserProviderInTenantScope: z
      .boolean()
      .default(true)
      .describe("In tenant scope, require a user context provider."),
    requireTenantIsolationBinding: z
      .boolean()
      .default(true)
      .describe("Enforce tenant isolation binding (no cross-tenant leakage)."),

    requireOperatorScopeSeparation: z
      .boolean()
      .default(true)
      .describe("Keep operator/admin scope separated from tenant surfaces."),
  })
  .strict()
  .describe("Runtime provider and scope requirements for governed shell composition.")

export type ShellContextPolicy = z.infer<typeof shellContextPolicySchema>
export type ShellContextPolicyInput = z.input<typeof shellContextPolicySchema>

export const shellContextPolicy = defineConstMap(
  shellContextPolicySchema.parse({})
)

export function parseShellContextPolicy(value: unknown): ShellContextPolicy {
  return shellContextPolicySchema.parse(value)
}

export function assertShellContextPolicy(input: unknown): ShellContextPolicy {
  try {
    return shellContextPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellContextPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellContextPolicy(
  input: unknown
):
  | { success: true; data: ShellContextPolicy }
  | { success: false; error: string } {
  const result = shellContextPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellContextPolicy(input: unknown): input is ShellContextPolicy {
  return shellContextPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellContextUtils = Object.freeze({
  schema: shellContextPolicySchema,
  assert: assertShellContextPolicy,
  is: isShellContextPolicy,
  parse: parseShellContextPolicy,
  safeParse: safeParseShellContextPolicy,
  defaults: shellContextPolicy,
})
