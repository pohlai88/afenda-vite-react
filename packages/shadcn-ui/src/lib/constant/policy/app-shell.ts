/**
 * GOVERNANCE POLICY — app-shell
 * App-shell runtime composition governance.
 * Scope: defines canonical shell zones and governs whether shell metadata,
 *   navigation context, command palette context, and layout density can be
 *   assumed by components.
 * Authority: ensures the shell is treated as platform infrastructure, not ad hoc feature UI.
 * Consumption: CI, AST checkers, and shell providers read this policy.
 * Changes: adjust shell governance deliberately; structural changes require migration planning.
 * Validation: schema-validated shape in validate-constants.
 * Purpose: keep app-shell composition disciplined, auditable, and centrally governed.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"

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

export const shellZoneSchema = z.enum(shellZoneValues)
export type ShellZone = z.infer<typeof shellZoneSchema>

const appShellPolicySchema = z
  .object({
    defaultZone: shellZoneSchema,

    requireShellMetadataProvider: z.boolean(),
    requireNavigationContext: z.boolean(),
    requireCommandContext: z.boolean(),

    requireLayoutDensityContext: z.boolean(),
    requireViewportAwareness: z.boolean(),

    allowFeatureLevelShellZoneFork: z.boolean(),
    allowFeatureLevelShellMetadataFork: z.boolean(),
  })
  .strict()

export const appShellPolicy = defineConstMap(
  appShellPolicySchema.parse({
    defaultZone: "content",

    requireShellMetadataProvider: true,
    requireNavigationContext: true,
    requireCommandContext: true,

    requireLayoutDensityContext: true,
    requireViewportAwareness: true,

    allowFeatureLevelShellZoneFork: false,
    allowFeatureLevelShellMetadataFork: false,
  }),
)

export type AppShellPolicy = typeof appShellPolicy
