/**
 * GOVERNANCE POLICY — shell-navigation-policy
 * Shell navigation structure ownership: nav types, active state, breadcrumbs, permission-filtered visibility.
 * Scope: doctrine for sidebar/header navigation truth; routes remain app-owned.
 * Consumption: navigation registry, shell sidebar, validators.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellNavigationPolicy, parseShellNavigationPolicy, shellNavigationPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellNavigationUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellNavigationUtils.defaults`, `ShellNavigationUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

export const shellNavNodeOwnerValues = defineTuple([
  "shell_registry",
  "feature",
  "hybrid",
])
export const shellNavNodeOwnerSchema = z
  .enum(shellNavNodeOwnerValues)
  .describe("Owner of primary navigation nodes: registry, feature, or hybrid.")
export type ShellNavNodeOwner = (typeof shellNavNodeOwnerValues)[number]

export const shellNavigationPolicySchema = z
  .object({
    primaryNavOwner: shellNavNodeOwnerSchema
      .default("shell_registry")
      .describe("Owner of primary navigation nodes."),
    requirePermissionFilteredNav: z
      .boolean()
      .default(true)
      .describe("Require permission-based filtering of navigation."),
    deriveBreadcrumbsFromShellMetadata: z
      .boolean()
      .default(true)
      .describe("Derive breadcrumbs from shell metadata."),
    maxVisibleNavDepth: z
      .number()
      .int()
      .min(1)
      .max(20)
      .default(8)
      .describe("Maximum depth of visible navigation tree."),
    allowFeatureOwnedNavNodes: z
      .boolean()
      .default(false)
      .describe("Allow features to own navigation nodes."),
  })
  .strict()
  .describe("Doctrine for shell navigation ownership, filtering, and breadcrumb derivation.")

export type ShellNavigationPolicy = z.infer<typeof shellNavigationPolicySchema>
export type ShellNavigationPolicyInput = z.input<typeof shellNavigationPolicySchema>

export const shellNavigationPolicy = defineConstMap(shellNavigationPolicySchema.parse({}))

export function parseShellNavigationPolicy(value: unknown): ShellNavigationPolicy {
  return shellNavigationPolicySchema.parse(value)
}

export function assertShellNavigationPolicy(input: unknown): ShellNavigationPolicy {
  try {
    return shellNavigationPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellNavigationPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellNavigationPolicy(
  input: unknown
):
  | { success: true; data: ShellNavigationPolicy }
  | { success: false; error: string } {
  const result = shellNavigationPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellNavigationPolicy(input: unknown): input is ShellNavigationPolicy {
  return shellNavigationPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellNavigationUtils = Object.freeze({
  schema: shellNavigationPolicySchema,
  assert: assertShellNavigationPolicy,
  is: isShellNavigationPolicy,
  parse: parseShellNavigationPolicy,
  safeParse: safeParseShellNavigationPolicy,
  defaults: shellNavigationPolicy,
})
