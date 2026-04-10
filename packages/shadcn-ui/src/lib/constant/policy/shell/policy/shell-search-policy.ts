/**
 * GOVERNANCE POLICY — shell-search-policy
 * Canonical shell search governance for scope, result taxonomy, and registration discipline.
 * Scope: platform search behavior and its contract boundaries with command palette and runtime providers.
 * Authority: search behavior is shell infrastructure; feature code consumes it but does not redefine it.
 * Consumption: search providers, command infrastructure, registries, and validators.
 * Changes: update deliberately; search scope or result-class changes require migration review.
 * Constraints: policy keys must map cleanly to enforceable runtime or static-analysis behavior.
 * Validation: schema-validated, strict, and centrally reviewable in the constant layer.
 * Purpose: preserve a disciplined, auditable, and non-fragmented shell search surface.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellSearchPolicy, parseShellSearchPolicy, shellSearchPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellSearchPolicyUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellSearchPolicyUtils.defaults`, `ShellSearchPolicyUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

export const shellSearchScopeValues = defineTuple([
  "tenant",
  "workspace",
  "global_product",
  "navigation",
])
export const shellSearchScopeSchema = z.enum(shellSearchScopeValues)
export type ShellSearchScope = z.infer<typeof shellSearchScopeSchema>

export const shellSearchResultClassValues = defineTuple([
  "record",
  "action",
  "navigation",
  "help",
  "admin",
])
export const shellSearchResultClassSchema = z.enum(shellSearchResultClassValues)
export type ShellSearchResultClass = z.infer<typeof shellSearchResultClassSchema>

export const shellSearchPolicySchema = z
  .object({
    defaultScope: shellSearchScopeSchema,
    requirePermissionFilterForScopedSearch: z.boolean(),
    distinguishCommandPaletteFromSearch: z.boolean(),
    approvedResultClasses: z.array(shellSearchResultClassSchema).min(1),
    /** Providers register only through governed extension points (runtime enforced). */
    requireGovernedSearchRegistration: z.boolean(),
    allowDangerousActionsFromSearch: z.boolean(),
  })
  .strict()

export const shellSearchPolicy = defineConstMap(
  shellSearchPolicySchema.parse({
    defaultScope: "tenant",
    requirePermissionFilterForScopedSearch: true,
    distinguishCommandPaletteFromSearch: true,
    approvedResultClasses: ["record", "action", "navigation", "help", "admin"],
    requireGovernedSearchRegistration: true,
    allowDangerousActionsFromSearch: false,
  })
)

export type ShellSearchPolicy = typeof shellSearchPolicy
export type ShellSearchPolicyInput = z.input<typeof shellSearchPolicySchema>

export function parseShellSearchPolicy(value: unknown): ShellSearchPolicy {
  return shellSearchPolicySchema.parse(value)
}

export function assertShellSearchPolicy(input: unknown): ShellSearchPolicy {
  try {
    return shellSearchPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellSearchPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellSearchPolicy(
  input: unknown
): { success: true; data: ShellSearchPolicy } | { success: false; error: string } {
  const result = shellSearchPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellSearchPolicy(input: unknown): input is ShellSearchPolicy {
  return shellSearchPolicySchema.safeParse(input).success
}

export const ShellSearchPolicyUtils = Object.freeze({
  schema: shellSearchPolicySchema,
  assert: assertShellSearchPolicy,
  is: isShellSearchPolicy,
  parse: parseShellSearchPolicy,
  safeParse: safeParseShellSearchPolicy,
  defaults: shellSearchPolicy,
})
