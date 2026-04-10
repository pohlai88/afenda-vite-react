/**
 * GOVERNANCE REGISTRY — shell-component-registry
 * Canonical registry for shell-aware component participation declarations.
 * Scope: maps stable registry keys to reviewed shell component contracts.
 * Authority: shell-aware components must be represented here for auditability and enforcement.
 * Consumption: validation tooling, AST checks, and CI rely on this registry.
 * Purpose: make shell participation explicit and enforceable.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellComponentRegistry, parseShellComponentRegistry, shellComponentRegistrySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellComponentRegistryUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellComponentRegistryUtils.defaults`, `ShellComponentRegistryUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap } from "../../../schema/shared"
import {
  shellComponentContract,
  shellComponentContractEntrySchema,
  shellComponentContractKeyValues,
} from "../contract/shell-component-contract"

/** Same string union as {@link shellComponentContractKeyValues} — registry keys must not drift from the contract map. */
export const shellComponentRegistryKeyValues = shellComponentContractKeyValues
export const shellComponentRegistryKeySchema = z
  .enum(shellComponentRegistryKeyValues)
  .describe("Stable registry key for a shell-aware component.")
export type ShellComponentRegistryKey = z.infer<typeof shellComponentRegistryKeySchema>

export const shellComponentRegistrySchema = z
  .record(
    shellComponentRegistryKeySchema,
    shellComponentContractEntrySchema.describe("Reviewed shell component contract entry for this registry key.")
  )
  .describe("Canonical map of registry keys to governed shell component contract entries.")

export type ShellComponentRegistry = z.infer<typeof shellComponentRegistrySchema>
export type ShellComponentRegistryInput = z.input<typeof shellComponentRegistrySchema>

export const shellComponentRegistry = defineConstMap(
  shellComponentRegistrySchema.parse({
    "shell-action-slot": shellComponentContract["shell-action-slot"],
    "shell-breadcrumbs": shellComponentContract["shell-breadcrumbs"],
    "shell-content": shellComponentContract["shell-content"],
    "shell-degraded-frame": shellComponentContract["shell-degraded-frame"],
    "shell-empty-state-frame": shellComponentContract["shell-empty-state-frame"],
    "shell-header": shellComponentContract["shell-header"],
    "shell-loading-frame": shellComponentContract["shell-loading-frame"],
    "shell-overlay-container": shellComponentContract["shell-overlay-container"],
    "shell-popover-content": shellComponentContract["shell-popover-content"],
    "shell-root": shellComponentContract["shell-root"],
    "shell-search-bar": shellComponentContract["shell-search-bar"],
    "shell-sidebar": shellComponentContract["shell-sidebar"],
    "shell-tenant-switcher": shellComponentContract["shell-tenant-switcher"],
    "shell-title": shellComponentContract["shell-title"],
    "shell-workspace-switcher": shellComponentContract["shell-workspace-switcher"],
  })
)

export function parseShellComponentRegistry(value: unknown): ShellComponentRegistry {
  return shellComponentRegistrySchema.parse(value)
}

export function assertShellComponentRegistry(input: unknown): ShellComponentRegistry {
  try {
    return shellComponentRegistrySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellComponentRegistry: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellComponentRegistry(
  input: unknown
):
  | { success: true; data: ShellComponentRegistry }
  | { success: false; error: string } {
  const result = shellComponentRegistrySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellComponentRegistry(input: unknown): input is ShellComponentRegistry {
  return shellComponentRegistrySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellComponentRegistryUtils = Object.freeze({
  schema: shellComponentRegistrySchema,
  assert: assertShellComponentRegistry,
  is: isShellComponentRegistry,
  parse: parseShellComponentRegistry,
  safeParse: safeParseShellComponentRegistry,
  defaults: shellComponentRegistry,
})
