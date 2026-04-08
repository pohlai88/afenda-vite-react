/**
 * SEMANTIC SYSTEM — motion
 * Canonical governed system for motion duration semantics and related doctrine.
 * Tier: Tier 2: governed system.
 * Authoring: tuple -> union -> typed maps and policy -> `as const satisfies`.
 * Runtime: exported Zod enums support boundary reuse, not primary authoring.
 * Policy: this file governs reduced-motion fallback and feature-level duration customization.
 * Consumption: use exported getters and defaults; do not invent duration strings inline.
 * Mapping: semantic milliseconds and utility classes are reviewed mappings, not strict 1:1 identity.
 * Changes: update here first, then validate policy consumers and CI.
 * Purpose: prevent motion drift and keep timing behavior deterministic and reviewable.
 */
import { z } from "zod/v4"

import {
  booleanFlagSchema,
  classNameSchema,
  defineConstMap,
  defineTuple,
  nonNegativeIntSchema,
} from "../schema/shared"

export const motionDurationValues = defineTuple([
  "instant",
  "fast",
  "normal",
  "slow",
])
export const motionDurationSchema = z.enum(motionDurationValues)
export type MotionDuration = (typeof motionDurationValues)[number]

export const DEFAULT_INTERACTIVE_MOTION_DURATION: MotionDuration = "normal"

export const motionDurationMsSchema = z.record(
  motionDurationSchema,
  nonNegativeIntSchema
)

const motionDurationMsDefinition = {
  instant: 0,
  fast: 120,
  normal: 180,
  slow: 280,
} as const satisfies Record<MotionDuration, number>

export const motionDurationMs = defineConstMap(
  motionDurationMsSchema.parse(motionDurationMsDefinition)
)

export const motionDurationClassMapSchema = z.record(
  motionDurationSchema,
  classNameSchema
)

const motionDurationClassMapDefinition = {
  instant: "duration-0",
  fast: "duration-150",
  normal: "duration-200",
  slow: "duration-300",
} as const satisfies Record<MotionDuration, string>

export const motionDurationClassMap = defineConstMap(
  motionDurationClassMapSchema.parse(motionDurationClassMapDefinition)
)

export type MotionPolicy = {
  allowReducedMotionFallback: boolean
  allowFeatureLevelCustomDuration: boolean
  defaultInteractiveDuration: MotionDuration
}

export const motionPolicySchema = z
  .object({
    allowReducedMotionFallback: booleanFlagSchema,
    allowFeatureLevelCustomDuration: booleanFlagSchema,
    defaultInteractiveDuration: motionDurationSchema,
  })
  .strict()

const motionPolicyDefinition = {
  allowReducedMotionFallback: true,
  allowFeatureLevelCustomDuration: false,
  defaultInteractiveDuration: DEFAULT_INTERACTIVE_MOTION_DURATION,
} as const satisfies MotionPolicy

export const motionPolicy = defineConstMap(
  motionPolicySchema.parse(motionPolicyDefinition)
)

export function getMotionDurationMs(duration: MotionDuration): number {
  return motionDurationMs[duration]
}

export function getMotionDurationClass(duration: MotionDuration): string {
  return motionDurationClassMap[duration]
}
