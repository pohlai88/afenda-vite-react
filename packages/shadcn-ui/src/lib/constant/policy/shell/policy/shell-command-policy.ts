/**
 * GOVERNANCE POLICY — shell-command-policy
 * Command palette action registration: grouping, priority, capability filtering, destructive discipline.
 * Scope: complements shell-search-policy for global command surfaces.
 * Consumption: command infrastructure, palette UI, validators.
 * Validation: schema-validated in validate-constants.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellCommandPolicy, parseShellCommandPolicy, shellCommandPolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellCommandUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellCommandUtils.defaults`, `ShellCommandUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap } from "../../../schema/shared"

export const shellCommandPolicySchema = z
  .object({
    requireCommandGroupRegistration: z
      .boolean()
      .default(true)
      .describe("Require every command to declare a group for palette organization."),
    maxCommandPriorityTiers: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum number of priority tiers allowed for command ordering."),
    blockDestructiveCommandsWithoutConfirmation: z
      .boolean()
      .default(true)
      .describe("Block destructive commands unless the user confirms."),
    requireAuditForSensitiveCommands: z
      .boolean()
      .default(true)
      .describe("Require audit logging for sensitive or high-risk commands."),
  })
  .strict()
  .describe(
    "Command palette doctrine: grouping, priority tiers, destructive and audit discipline."
  )

export type ShellCommandPolicy = z.infer<typeof shellCommandPolicySchema>
export type ShellCommandPolicyInput = z.input<typeof shellCommandPolicySchema>

export const shellCommandPolicy = defineConstMap(
  shellCommandPolicySchema.parse({})
)

export function parseShellCommandPolicy(value: unknown): ShellCommandPolicy {
  return shellCommandPolicySchema.parse(value)
}

export function assertShellCommandPolicy(input: unknown): ShellCommandPolicy {
  try {
    return shellCommandPolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellCommandPolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellCommandPolicy(
  input: unknown
):
  | { success: true; data: ShellCommandPolicy }
  | { success: false; error: string } {
  const result = shellCommandPolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellCommandPolicy(input: unknown): input is ShellCommandPolicy {
  return shellCommandPolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellCommandUtils = Object.freeze({
  schema: shellCommandPolicySchema,
  assert: assertShellCommandPolicy,
  is: isShellCommandPolicy,
  parse: parseShellCommandPolicy,
  safeParse: safeParseShellCommandPolicy,
  defaults: shellCommandPolicy,
})
