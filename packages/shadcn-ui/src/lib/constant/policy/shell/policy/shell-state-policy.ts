/**
 * GOVERNANCE POLICY — shell-state-policy
 * Canonical shell state doctrine: keys, persistence class, isolation boundaries, reset behavior, and metadata.
 * Vocabulary: state **keys** are defined in `../shell-state-key-vocabulary.ts`; this file constrains and maps them only.
 * Scope: tenant/workspace isolation, reset matrices, persistence governance, shell runtime safety.
 * Consumption: shell state hooks, storage adapters, validators, orchestration.
 * Validation: schema-validated; `declaredStateKeys` must cover every `shellStateKeyValues` entry exactly once.
 *
 * **Consumption patterns**
 *
 * - Named imports: `import { shellStatePolicy, parseShellStatePolicy, shellStatePolicySchema } from "@afenda/shadcn-ui/lib/constant"`
 * - Namespace: `import { ShellStateUtils } from "@afenda/shadcn-ui/lib/constant"` → `ShellStateUtils.defaults`, `ShellStateUtils.parse(...)`.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../../../schema/shared"

import {
  shellStateKeySchema,
  shellStateKeyValues,
} from "../shell-state-key-vocabulary"

// --- Reset triggers (behavioral events; not key vocabulary)

export const shellStateResetTriggerValues = defineTuple([
  "tenant_switch",
  "workspace_switch",
  "logout",
  "shell_bootstrap",
  "route_change",
  "overlay_close",
  "search_close",
])
export const shellStateResetTriggerSchema = z
  .enum(shellStateResetTriggerValues)
  .describe("Behavioral event that may reset governed shell state.")
export type ShellStateResetTrigger = (typeof shellStateResetTriggerValues)[number]

// --- Classifications

export const shellStateDomainValues = defineTuple([
  "layout",
  "navigation",
  "search",
  "overlay",
  "tenant",
  "workspace",
  "metadata",
])
export const shellStateDomainSchema = z
  .enum(shellStateDomainValues)
  .describe("Domain classification for a shell state key.")
export type ShellStateDomain = (typeof shellStateDomainValues)[number]

/** How durable the value is intended to be (no storage engine details). */
export const shellStatePersistenceValues = defineTuple([
  "persisted",
  "session",
  "ephemeral",
])
export const shellStatePersistenceSchema = z
  .enum(shellStatePersistenceValues)
  .describe("Persistence class for the value (no storage engine details).")
export type ShellStatePersistence = (typeof shellStatePersistenceValues)[number]

/** Multi-tenant / workspace boundary for the value. */
export const shellStateIsolationValues = defineTuple([
  "global",
  "tenant",
  "workspace",
])
export const shellStateIsolationSchema = z
  .enum(shellStateIsolationValues)
  .describe("Isolation boundary for the value (global, tenant, or workspace).")
export type ShellStateIsolation = (typeof shellStateIsolationValues)[number]

/** Initialization category for runtime normalization (no concrete values in policy). */
export const shellStateDefaultValueKindValues = defineTuple([
  "boolean_false",
  "boolean_true",
  "null",
  "empty_string",
  "empty_array",
  "derived",
])
export const shellStateDefaultValueKindSchema = z
  .enum(shellStateDefaultValueKindValues)
  .describe("Initialization category for runtime normalization (no concrete defaults in policy).")
export type ShellStateDefaultValueKind = (typeof shellStateDefaultValueKindValues)[number]

export const shellStateDeclarationSchema = z
  .object({
    key: shellStateKeySchema.describe("Governed shell state key."),
    domain: shellStateDomainSchema.describe("Domain classification."),
    persistence: shellStatePersistenceSchema.describe("Persistence class."),
    isolation: shellStateIsolationSchema.describe("Isolation boundary."),
    defaultValueKind: shellStateDefaultValueKindSchema.describe("Initialization category."),
    required: z.boolean().describe("Whether this state key is required at runtime."),
    resetTriggers: z
      .array(shellStateResetTriggerSchema)
      .min(1)
      .describe("Events that reset this state."),
    description: z
      .string()
      .trim()
      .min(1)
      .describe("Human-readable description of the state key."),
  })
  .strict()
  .describe("Single governed declaration for one shell state key.")

export type ShellStateDeclaration = z.infer<typeof shellStateDeclarationSchema>

export const shellStatePolicySchema = z
  .object({
    requireExplicitStateDeclarations: z
      .boolean()
      .default(true)
      .describe("Shell doctrine must list explicit declarations for governed keys."),
    forbidUndeclaredShellStateKeys: z
      .boolean()
      .default(true)
      .describe("Reject reads or writes for keys not declared in policy."),
    requireIsolationClassification: z
      .boolean()
      .default(true)
      .describe("Every declaration must include an isolation boundary."),
    requirePersistenceClassification: z
      .boolean()
      .default(true)
      .describe("Every declaration must include a persistence class."),
    declaredStateKeys: z
      .array(shellStateDeclarationSchema)
      .min(1)
      .describe("Authoritative declarations; must cover vocabulary exactly once."),
  })
  .strict()
  .superRefine((val, ctx) => {
    const keys = val.declaredStateKeys.map((d) => d.key)
    const seen = new Set<string>()
    for (const key of keys) {
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate shell state declaration for key "${key}".`,
        })
      }
      seen.add(key)
    }
    for (const requiredKey of shellStateKeyValues) {
      if (!seen.has(requiredKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Missing shell state declaration for governed key "${requiredKey}".`,
        })
      }
    }
  })

export type ShellStatePolicy = z.infer<typeof shellStatePolicySchema>
export type ShellStatePolicyInput = z.input<typeof shellStatePolicySchema>

export const shellStatePolicy = defineConstMap(
  shellStatePolicySchema.parse({
    declaredStateKeys: [
      {
        key: "sidebar.collapsed",
        domain: "layout",
        persistence: "persisted",
        isolation: "global",
        defaultValueKind: "boolean_false",
        required: true,
        resetTriggers: ["tenant_switch", "logout"],
        description:
          "Whether the canonical application sidebar region is collapsed versus expanded.",
      },
      {
        key: "overlay.stack",
        domain: "overlay",
        persistence: "ephemeral",
        isolation: "workspace",
        defaultValueKind: "empty_array",
        required: false,
        resetTriggers: [
          "tenant_switch",
          "workspace_switch",
          "logout",
          "route_change",
          "overlay_close",
          "shell_bootstrap",
        ],
        description: "Ordered stack of active overlay entries mounted in the shell overlay host.",
      },
      {
        key: "command.palette.open",
        domain: "navigation",
        persistence: "ephemeral",
        isolation: "workspace",
        defaultValueKind: "boolean_false",
        required: false,
        resetTriggers: [
          "tenant_switch",
          "workspace_switch",
          "logout",
          "route_change",
          "search_close",
          "shell_bootstrap",
        ],
        description: "Whether the governed command palette surface is open.",
      },
    ],
  })
)

export function parseShellStatePolicy(value: unknown): ShellStatePolicy {
  return shellStatePolicySchema.parse(value)
}

export function assertShellStatePolicy(input: unknown): ShellStatePolicy {
  try {
    return shellStatePolicySchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellStatePolicy: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellStatePolicy(
  input: unknown
): { success: true; data: ShellStatePolicy } | { success: false; error: string } {
  const result = shellStatePolicySchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

export function isShellStatePolicy(input: unknown): input is ShellStatePolicy {
  return shellStatePolicySchema.safeParse(input).success
}

/** Optional namespace-style bundle (same behavior as named exports). */
export const ShellStateUtils = Object.freeze({
  schema: shellStatePolicySchema,
  assert: assertShellStatePolicy,
  is: isShellStatePolicy,
  parse: parseShellStatePolicy,
  safeParse: safeParseShellStatePolicy,
  defaults: shellStatePolicy,
})
