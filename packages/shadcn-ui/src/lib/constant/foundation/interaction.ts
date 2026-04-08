/**
 * SEMANTIC SYSTEM — interaction
 * Canonical governed system for focus and interaction-state semantics.
 * Tier: Tier 2: governed system.
 * Authoring: tuple -> union -> typed maps and policy -> `as const satisfies`.
 * Runtime: exported Zod enums support boundary reuse, not primary authoring.
 * Policy: this file defines interaction doctrine that restricts invalid visual-state patterns.
 * Consumption: use exported getters and defaults; do not recreate interaction strings inline.
 * Tokens: interaction classes must stay inside reviewed governed mappings.
 * Changes: update here first, then validate enforcement and CI expectations.
 * Purpose: prevent interaction drift and keep accessibility-critical behavior consistent.
 */
import { z } from "zod/v4"

import {
  booleanFlagSchema,
  classNameSchema,
  defineConstMap,
  defineTuple,
} from "../schema/shared"

export const focusRingValues = defineTuple(["default", "strong", "critical"])
export const focusRingSchema = z.enum(focusRingValues)
export type FocusRing = (typeof focusRingValues)[number]

export const DEFAULT_FOCUS_RING: FocusRing = "default"

export const focusRingClassMapSchema = z.record(
  focusRingSchema,
  classNameSchema
)

const focusRingClassMapDefinition = {
  default:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  strong:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  critical:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
} as const satisfies Record<FocusRing, string>

export const focusRingClassMap = defineConstMap(
  focusRingClassMapSchema.parse(focusRingClassMapDefinition)
)

export const interactionStateValues = defineTuple([
  "disabled",
  "invalid",
  "loading",
  "active",
])
export const interactionStateSchema = z.enum(interactionStateValues)
export type InteractionState = (typeof interactionStateValues)[number]

export const interactionStateClassMapSchema = z.record(
  interactionStateSchema,
  classNameSchema
)

const interactionStateClassMapDefinition = {
  disabled: "disabled:pointer-events-none disabled:opacity-50",
  invalid: "data-[invalid=true]:border-destructive",
  loading: "data-[loading=true]:cursor-wait",
  active: "data-[state=on]:ring-2 data-[state=on]:ring-ring",
} as const satisfies Record<InteractionState, string>

export const interactionStateClassMap = defineConstMap(
  interactionStateClassMapSchema.parse(interactionStateClassMapDefinition)
)

export type InteractionPolicy = {
  allowInlineStyleForVisualStates: boolean
  requireFocusVisibleStyling: boolean
  requireDisabledStyling: boolean
}

export const interactionPolicySchema = z
  .object({
    allowInlineStyleForVisualStates: booleanFlagSchema,
    requireFocusVisibleStyling: booleanFlagSchema,
    requireDisabledStyling: booleanFlagSchema,
  })
  .strict()

const interactionPolicyDefinition = {
  allowInlineStyleForVisualStates: false,
  requireFocusVisibleStyling: true,
  requireDisabledStyling: true,
} as const satisfies InteractionPolicy

export const interactionPolicy = defineConstMap(
  interactionPolicySchema.parse(interactionPolicyDefinition)
)

export function getFocusRingClass(focusRing: FocusRing): string {
  return focusRingClassMap[focusRing]
}

export function getInteractionStateClass(state: InteractionState): string {
  return interactionStateClassMap[state]
}
