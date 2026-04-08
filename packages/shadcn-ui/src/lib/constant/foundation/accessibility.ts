/**
 * SEMANTIC SYSTEM — accessibility
 * Canonical governed system for accessibility conformance and keyboard requirements.
 * Tier: Tier 2: governed system.
 * Authoring: tuple -> union -> typed definitions -> `as const satisfies`.
 * Runtime: exported Zod schemas are for boundary parsing or validation, not primary authoring.
 * Policy: this file defines accessibility doctrine that restricts invalid compliance drift.
 * Consumption: use exported defaults and policy; do not recreate conformance targets inline.
 * Standards: project targets and keyboard requirements must stay inside reviewed governed mappings.
 * Changes: update this file first, then validate docs, tests, and enforcement expectations.
 * Purpose: keep accessibility-critical behavior deterministic, reviewable, and shared.
 */
import { z } from "zod/v4"

import { booleanFlagSchema, defineConstList, defineConstMap, defineTuple } from "../schema/shared"

export const accessibilityConformanceValues = defineTuple(["A", "AA", "AAA"])
export const accessibilityConformanceSchema = z.enum(accessibilityConformanceValues)
export type AccessibilityConformance = (typeof accessibilityConformanceValues)[number]

export const DEFAULT_ACCESSIBILITY_CONFORMANCE: AccessibilityConformance = "AA"

export const keyboardRequirementValues = defineTuple([
  "tab-order",
  "enter-space-activation",
  "escape-dismiss",
  "focus-visible",
])
export const keyboardRequirementSchema = z.enum(keyboardRequirementValues)
export type KeyboardRequirement = (typeof keyboardRequirementValues)[number]

export const keyboardRequirementList = defineConstList(keyboardRequirementValues)

export type AccessibilityPolicy = {
  allowFeatureLevelConformanceDowngrade: boolean
  requireKeyboardNavigation: boolean
  requireFocusVisible: boolean
  requireReducedMotionSupport: boolean
  requireAccessibleNamesForIconOnlyControls: boolean
}

export const accessibilityPolicySchema = z
  .object({
    allowFeatureLevelConformanceDowngrade: booleanFlagSchema,
    requireKeyboardNavigation: booleanFlagSchema,
    requireFocusVisible: booleanFlagSchema,
    requireReducedMotionSupport: booleanFlagSchema,
    requireAccessibleNamesForIconOnlyControls: booleanFlagSchema,
  })
  .strict()

const accessibilityPolicyDefinition = {
  allowFeatureLevelConformanceDowngrade: false,
  requireKeyboardNavigation: true,
  requireFocusVisible: true,
  requireReducedMotionSupport: true,
  requireAccessibleNamesForIconOnlyControls: true,
} as const satisfies AccessibilityPolicy

export const accessibilityPolicy = defineConstMap(
  accessibilityPolicySchema.parse(accessibilityPolicyDefinition)
)
