/**
 * GOVERNANCE POLICY — shell-metadata-policy
 * Ownership, lifecycle, and authority for shell metadata beyond the shell-metadata-contract shape.
 * Scope: required vs optional logical fields, shell-owned vs feature-owned keys, stale/error behavior.
 * Consumption: ShellProvider, feature pages, validators.
 * Validation: schema-validated in validate-constants; cross-checks with shell-metadata-contract.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellMetadataPolicy, parseShellMetadataPolicy, shellMetadataPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellMetadataPolicyUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellMetadataPolicyUtils.defaults`, `ShellMetadataPolicyUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

export const shellMetadataFieldKeyValues = defineTuple([
  "pageTitle",
  "pageSubtitle",
  "scopeLabel",
  "breadcrumb",
  "tenantBadge",
  "workspaceBadge",
])
export const shellMetadataFieldKeySchema = z
  .enum(shellMetadataFieldKeyValues)
  .describe("Logical metadata field key governed by this policy.")
export type ShellMetadataFieldKey = (typeof shellMetadataFieldKeyValues)[number]

export const shellMetadataOwnershipValues = defineTuple([
  "shell",
  "feature",
  "derived",
])
export const shellMetadataOwnershipSchema = z
  .enum(shellMetadataOwnershipValues)
  .describe("Ownership: shell runtime, feature, or derived composition.")
export type ShellMetadataOwnership = (typeof shellMetadataOwnershipValues)[number]

export const shellMetadataFieldRuleSchema = z
  .object({
    key: shellMetadataFieldKeySchema.describe("Logical metadata field key."),
    ownership: shellMetadataOwnershipSchema.describe("Ownership: shell, feature, or derived."),
    allowPartial: z.boolean().describe("Allow partial population of this field."),
    allowStaleRead: z.boolean().describe("Allow stale reads when fresh data is unavailable."),
  })
  .strict()
  .describe("Governed rule for one shell metadata field.")

export const shellMetadataPolicySchema = z
  .object({
    fieldRules: z
      .array(shellMetadataFieldRuleSchema)
      .min(1)
      .describe("Governed rules for each metadata field."),
    featureMetadataKeyPrefix: z
      .string()
      .trim()
      .min(1)
      .default("feature.shell.")
      .describe("Prefix required for feature-defined metadata keys."),
    requireExplicitProvenanceForFeatureFields: z
      .boolean()
      .default(true)
      .describe("Require provenance for feature-owned fields."),
    enforceShellOwnedFieldAuthority: z
      .boolean()
      .default(true)
      .describe("Reject silent overrides of shell-owned fields from feature code paths."),
  })
  .strict()
  .describe("Ownership and authority doctrine for shell metadata beyond the metadata contract shape.")

export type ShellMetadataPolicy = z.infer<typeof shellMetadataPolicySchema>
export type ShellMetadataPolicyInput = z.input<typeof shellMetadataPolicySchema>

export const shellMetadataPolicy = defineConstMap(
  shellMetadataPolicySchema.parse({
    fieldRules: [
      { key: "pageTitle", ownership: "shell", allowPartial: true, allowStaleRead: false },
      { key: "pageSubtitle", ownership: "derived", allowPartial: true, allowStaleRead: true },
      { key: "scopeLabel", ownership: "derived", allowPartial: true, allowStaleRead: true },
      { key: "breadcrumb", ownership: "feature", allowPartial: true, allowStaleRead: false },
      { key: "tenantBadge", ownership: "shell", allowPartial: false, allowStaleRead: false },
      { key: "workspaceBadge", ownership: "shell", allowPartial: false, allowStaleRead: false },
    ],
  })
)

export function parseShellMetadataPolicy(value: unknown): ShellMetadataPolicy {
  return shellMetadataPolicySchema.parse(value)
}

export function assertShellMetadataPolicy(input: unknown): ShellMetadataPolicy {
  try {
    return shellMetadataPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellMetadataPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellMetadataPolicy(
  input: unknown
):
  | { success: true; data: ShellMetadataPolicy }
  | { success: false; error: string } {
  const result = shellMetadataPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellMetadataPolicy(input: unknown): input is ShellMetadataPolicy {
  return shellMetadataPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). Distinct from contract `ShellMetadataUtils`. */
export const ShellMetadataPolicyUtils = Object.freeze({
  schema: shellMetadataPolicySchema,
  assert: assertShellMetadataPolicy,
  is: isShellMetadataPolicy,
  parse: parseShellMetadataPolicy,
  safeParse: safeParseShellMetadataPolicy,
  defaults: shellMetadataPolicy,
})
