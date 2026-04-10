/**
 * GOVERNANCE POLICY — shell-policy
 * Canonical shell runtime composition governance.
 * Scope: defines approved shell zones, default shell placement assumptions, required shell infrastructure,
 *   and whether feature code may fork shell contracts or shell vocabularies locally.
 * Authority: the shell is platform infrastructure; features consume it but do not redefine it.
 * Consumption: shell providers, hooks, AST rules, CI checks, and validation tooling read this file as reviewed truth.
 * Changes: update deliberately; provider-contract or shell-vocabulary changes require migration review.
 * Constraints: policy keys must map cleanly to enforceable runtime or static-analysis behavior.
 * Validation: schema-validated, strict, and centrally reviewable in the constant layer.
 * Purpose: preserve a disciplined, auditable, and non-fragmented shell runtime across the product.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellPolicy, parseShellPolicy, shellPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellPolicyUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellPolicyUtils.defaults`, `ShellPolicyUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

export const shellZoneValues = defineTuple([
  "root",
  "header",
  "sidebar",
  "content",
  "panel",
  "overlay",
  "command",
  "footer",
])

export const shellZoneSchema = z
  .enum(shellZoneValues)
  .describe("Approved shell layout zone for component placement and governance.")
export type ShellZone = (typeof shellZoneValues)[number]

export const shellPolicySchema = z
  .object({
    defaultComponentZone: shellZoneSchema
      .default("content")
      .describe("Fallback shell zone when a governed surface does not declare one explicitly."),

    requireShellMetadataProvider: z
      .boolean()
      .default(true)
      .describe("Shell runtime must provide canonical shell metadata."),
    requireNavigationContext: z
      .boolean()
      .default(true)
      .describe("Shell runtime must expose canonical navigation context."),
    requireCommandInfrastructure: z
      .boolean()
      .default(true)
      .describe("Shell runtime must provide global command infrastructure."),

    requireLayoutDensityContext: z
      .boolean()
      .default(true)
      .describe("Shell runtime must expose canonical layout density context."),
    requireResponsiveShellLayout: z
      .boolean()
      .default(true)
      .describe("Shell runtime must provide responsive shell layout behavior."),

    allowFeatureLevelShellZoneFork: z
      .boolean()
      .default(false)
      .describe("Allow features to fork shell zones locally."),
    allowFeatureLevelShellMetadataFork: z
      .boolean()
      .default(false)
      .describe("Allow features to fork shell metadata locally."),
    allowFeatureLevelNavigationContextFork: z
      .boolean()
      .default(false)
      .describe("Allow features to fork navigation context locally."),
    allowFeatureLevelCommandInfrastructureFork: z
      .boolean()
      .default(false)
      .describe("Allow features to fork command infrastructure locally."),
    allowFeatureLevelDensityVocabularyFork: z
      .boolean()
      .default(false)
      .describe("Allow features to fork density vocabulary locally."),
    allowFeatureLevelViewportVocabularyFork: z
      .boolean()
      .default(false)
      .describe("Allow features to fork viewport vocabulary locally."),
  })
  .strict()
  .describe("Canonical doctrine for shell zones, required infrastructure, and feature fork allowances.")

export type ShellPolicy = z.infer<typeof shellPolicySchema>
export type ShellPolicyInput = z.input<typeof shellPolicySchema>

export const shellPolicy = defineConstMap(shellPolicySchema.parse({}))

export function parseShellPolicy(value: unknown): ShellPolicy {
  return shellPolicySchema.parse(value)
}

export function assertShellPolicy(input: unknown): ShellPolicy {
  try {
    return shellPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellPolicy(
  input: unknown
): { success: true; data: ShellPolicy } | { success: false; error: string } {
  const result = shellPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellPolicy(input: unknown): input is ShellPolicy {
  return shellPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellPolicyUtils = Object.freeze({
  schema: shellPolicySchema,
  assert: assertShellPolicy,
  is: isShellPolicy,
  parse: parseShellPolicy,
  safeParse: safeParseShellPolicy,
  defaults: shellPolicy,
})
