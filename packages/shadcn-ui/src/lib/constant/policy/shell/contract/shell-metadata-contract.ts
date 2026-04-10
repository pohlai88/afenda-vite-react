/**
 * GOVERNANCE CONTRACT — shell-metadata-contract
 * Canonical runtime metadata contract for shell-aware UI.
 * Scope: defines the reviewed metadata surface exposed by shell providers to governed components.
 * Authority: shell-aware features must consume this contract instead of inventing local shell metadata shapes.
 * Consumption: shell providers, hooks, AST rules, and governed components read this file as the canonical shell metadata model.
 * Changes: adjust deliberately; metadata vocabulary changes require migration review across shell consumers.
 * Constraints: keep the contract stable, explicit, and free of ambiguous or feature-local semantics.
 * Validation: schema-validated, strict, and suitable for runtime/provider boundary checks.
 * Purpose: keep shell runtime state consistent, explainable, and non-fragmented across the product.
 */
import { z } from "zod/v4"

import { defineConstMap } from "../../../schema/shared"
import { shellZoneSchema } from "../policy/shell-policy"

export const shellDensityValues = ["compact", "comfortable", "spacious"] as const
export const shellDensitySchema = z
  .enum(shellDensityValues)
  .describe("Global shell density setting exposed by platform shell runtime.")
export type ShellDensity = (typeof shellDensityValues)[number]

export const shellViewportValues = ["mobile", "tablet", "desktop", "wide"] as const
export const shellViewportSchema = z
  .enum(shellViewportValues)
  .describe("Responsive viewport bucket used by shell layout.")
export type ShellViewport = (typeof shellViewportValues)[number]

export const shellNavigationStateValues = [
  "expanded",
  "collapsed",
  "hidden",
] as const
export const shellNavigationStateSchema = z
  .enum(shellNavigationStateValues)
  .describe("Navigation chrome runtime state owned by shell infrastructure.")
export type ShellNavigationState = (typeof shellNavigationStateValues)[number]

export const shellCommandAvailabilityValues = ["enabled", "disabled"] as const
export const shellCommandAvailabilitySchema = z
  .enum(shellCommandAvailabilityValues)
  .describe("Whether global shell command infrastructure is available.")
export type ShellCommandAvailability = (typeof shellCommandAvailabilityValues)[number]

export const shellMetadataSchema = z
  .object({
    zone: shellZoneSchema.describe(
      "Canonical current shell zone for the active component surface."
    ),

    density: shellDensitySchema,

    viewport: shellViewportSchema,

    navigationState: shellNavigationStateSchema,

    commandAvailability: shellCommandAvailabilitySchema,

    inOverlay: z
      .boolean()
      .default(false)
      .describe(
        "Whether the current surface is rendered inside a shell overlay layer."
      ),

    navigationContextBound: z
      .boolean()
      .default(true)
      .describe(
        "Whether the current shell surface participates in navigation context."
      ),
  })
  .strict()
  .describe(
    "Canonical runtime metadata exposed by shell providers to governed components."
  )

export type ShellMetadata = z.infer<typeof shellMetadataSchema>

const shellMetadataDefaultsSource = {
  zone: "content",
  density: "comfortable",
  viewport: "desktop",
  navigationState: "expanded",
  commandAvailability: "enabled",
  inOverlay: false,
  navigationContextBound: true,
} as const satisfies z.input<typeof shellMetadataSchema>

export const shellMetadataDefaults = defineConstMap(
  shellMetadataSchema.parse(shellMetadataDefaultsSource)
)

/** Validates unknown input at provider or IO boundaries; throws `ZodError` on failure. */
export function parseShellMetadata(value: unknown): ShellMetadata {
  return shellMetadataSchema.parse(value)
}

/**
 * Like {@link parseShellMetadata}, but wraps `ZodError` in a plain `Error` for friendlier messages.
 * Use {@link parseShellMetadata} when you need the original Zod error shape.
 */
export function assertShellMetadata(input: unknown): ShellMetadata {
  try {
    return shellMetadataSchema.parse(input)
  } catch (err) {
    if (err instanceof z.ZodError) {
      throw new Error(`Invalid ShellMetadata: ${err.message}`, { cause: err })
    }
    throw err
  }
}

export function safeParseShellMetadata(
  input: unknown
):
  | { success: true; data: ShellMetadata }
  | { success: false; error: string } {
  const result = shellMetadataSchema.safeParse(input)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error.message }
}

/** Merges partial input over {@link shellMetadataDefaults}, then validates (throws on invalid partial keys). */
export function withShellMetadataDefaults(
  input: Partial<ShellMetadata>
): ShellMetadata {
  const merged = { ...shellMetadataDefaults, ...input }
  return parseShellMetadata(merged)
}

/**
 * Type guard: `true` when `value` satisfies {@link shellMetadataSchema} (no throw).
 * Use in `if` branches or `Array.prototype.filter` to narrow `unknown` to {@link ShellMetadata}.
 */
export function isShellMetadata(value: unknown): value is ShellMetadata {
  return shellMetadataSchema.safeParse(value).success
}

/**
 * Optional namespace-style bundle for discoverability (same functions as named exports).
 * Individual imports remain preferred for tree-shaking clarity; use this for `ShellMetadataUtils.*` autocomplete.
 */
export const ShellMetadataUtils = Object.freeze({
  schema: shellMetadataSchema,
  assert: assertShellMetadata,
  is: isShellMetadata,
  parse: parseShellMetadata,
  safeParse: safeParseShellMetadata,
  withDefaults: withShellMetadataDefaults,
})
