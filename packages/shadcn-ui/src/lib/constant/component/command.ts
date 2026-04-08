/**
 * SEMANTIC CONTRACT — command
 * Defines the approved contract for governed command roles, intents, defaults, and doctrine.
 * Semantics: roles and intents must come from canonical governed unions.
 * Styling: compose from approved registries and wrappers, not feature-level reinvention.
 * Runtime: exported schemas validate trusted shapes where boundary reuse is needed.
 * Consumption: use exported defaults and policy; do not create local command taxonomies.
 * Defaults: import canonical defaults instead of repeating inline literals.
 * Boundaries: feature code should not define raw command grouping or intent systems.
 * Constraints: no uncontrolled `string` props and no ad hoc semantic invention.
 * Changes: preserve compatibility where practical and validate governance behavior.
 * Purpose: keep command usage aligned with the semantic architecture.
 */
import { z } from "zod/v4"

import {
  defineComponentContract,
  defineConstMap,
  defineTuple,
  nonNegativeIntSchema,
} from "../schema/shared"

export const commandGroupRoleValues = defineTuple([
  "navigation",
  "action",
  "entity",
  "history",
  "system",
])
export const commandGroupRoleSchema = z.enum(commandGroupRoleValues)
export type CommandGroupRole = z.infer<typeof commandGroupRoleSchema>

export const commandItemIntentValues = defineTuple([
  "default",
  "destructive",
  "navigation",
  "create",
  "open",
])
export const commandItemIntentSchema = z.enum(commandItemIntentValues)
export type CommandItemIntent = z.infer<typeof commandItemIntentSchema>

const commandDefaultsSchema = z
  .object({
    role: commandGroupRoleSchema,
    intent: commandItemIntentSchema,
  })
  .strict()

export const commandDefaults = defineConstMap(
  commandDefaultsSchema.parse({
    role: "navigation",
    intent: "default",
  })
)

const commandPolicySchema = z
  .object({
    maxVisibleGroups: nonNegativeIntSchema,
    shortcutDisplay: z.boolean(),
    emptyStateRequired: z.boolean(),
    loadingStateRequired: z.boolean(),
    groupHeadingRequiredForGroupedLists: z.boolean(),
    allowInlineVisualStyleProps: z.boolean(),
  })
  .strict()

export const commandPolicy = defineConstMap(
  commandPolicySchema.parse({
    maxVisibleGroups: 6,
    shortcutDisplay: true,
    emptyStateRequired: true,
    loadingStateRequired: true,
    groupHeadingRequiredForGroupedLists: true,
    allowInlineVisualStyleProps: false,
  })
)

export const commandContract = defineComponentContract({
  vocabularies: {
    role: commandGroupRoleValues,
    intent: commandItemIntentValues,
  },
  defaults: commandDefaults,
  policy: commandPolicy,
})
