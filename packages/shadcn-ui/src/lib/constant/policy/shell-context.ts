/**
 * GOVERNANCE POLICY — shell-context
 * Runtime shell scope governance.
 * Scope: declares legal shell scopes for rendering and governs whether
 *   authenticated / tenant / user / locale / theme context is required
 *   before governed UI is allowed to render.
 * Authority: supports app-shell and multitenant discipline without leaking
 *   runtime instance data (userId / tenantId stay runtime-only).
 * Consumption: CI, AST checkers, and shell providers read this policy.
 * Changes: adjust scope discipline deliberately; structural changes require migration planning.
 * Validation: schema-validated shape in validate-constants.
 * Purpose: keep shell-context requirements disciplined, auditable, and centrally governed.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"

export const shellScopeValues = defineTuple([
  "public",
  "authenticated",
  "tenant",
  "operator",
])

export const shellScopeSchema = z.enum(shellScopeValues)
export type ShellScope = z.infer<typeof shellScopeSchema>

const shellContextPolicySchema = z
  .object({
    defaultShellScope: shellScopeSchema,

    requireShellProvider: z.boolean(),
    requireAuthProvider: z.boolean(),
    requireLocaleProvider: z.boolean(),
    requireThemeProvider: z.boolean(),

    requireTenantProviderInTenantScope: z.boolean(),
    requireUserProviderInTenantScope: z.boolean(),
    requireTenantIsolationBinding: z.boolean(),

    requireOperatorScopeSeparation: z.boolean(),
  })
  .strict()

export const shellContextPolicy = defineConstMap(
  shellContextPolicySchema.parse({
    defaultShellScope: "tenant",

    requireShellProvider: true,
    requireAuthProvider: true,
    requireLocaleProvider: true,
    requireThemeProvider: true,

    requireTenantProviderInTenantScope: true,
    requireUserProviderInTenantScope: true,
    requireTenantIsolationBinding: true,

    requireOperatorScopeSeparation: true,
  }),
)

export type ShellContextPolicy = typeof shellContextPolicy
