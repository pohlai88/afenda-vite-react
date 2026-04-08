/**
 * SEMANTIC SYSTEM — status
 * Canonical governed system for lifecycle-status semantics and status-to-tone mapping.
 * Tier: Tier 2: governed system.
 * Authoring: tuple -> union -> typed mapping -> `as const satisfies` or schema-checked equivalents.
 * Runtime: exported schemas support boundary parsing or validation, not primary authoring.
 * Consumption: use governed lifecycle-status values and mapping exports; do not recreate status logic inline.
 * Mapping: status-to-tone is reviewed semantic behavior, not a feature-level preference.
 * Defaults: add `DEFAULT_LIFECYCLE_STATUS` only if the system adopts a true canonical default.
 * Changes: update this file first, then validate dependent semantic consumers and CI.
 * Purpose: prevent status drift and keep semantic workflow behavior deterministic.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"
import { toneSchema, type Tone } from "./tone"

export const lifecycleStatusValues = defineTuple([
  "idle",
  "pending",
  "running",
  "succeeded",
  "failed",
  "blocked",
  "cancelled",
])
export const lifecycleStatusSchema = z.enum(lifecycleStatusValues)
export type LifecycleStatus = (typeof lifecycleStatusValues)[number]

export const lifecycleStatusToToneSchema = z.record(
  lifecycleStatusSchema,
  toneSchema
)

const lifecycleStatusToToneDefinition = {
  idle: "neutral",
  pending: "warning",
  running: "info",
  succeeded: "success",
  failed: "destructive",
  blocked: "destructive",
  cancelled: "neutral",
} as const satisfies Record<LifecycleStatus, Tone>

export const lifecycleStatusToTone = defineConstMap(
  lifecycleStatusToToneSchema.parse(lifecycleStatusToToneDefinition)
)

export function getLifecycleStatusTone(status: LifecycleStatus): Tone {
  return lifecycleStatusToTone[status]
}
