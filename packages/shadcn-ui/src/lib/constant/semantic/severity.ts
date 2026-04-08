/**
 * SEMANTIC SYSTEM — severity
 * Canonical governed system for severity semantics and severity-to-tone mapping.
 * Tier: Tier 2: governed system.
 * Authoring: tuple -> union -> typed mapping -> `as const satisfies` or schema-checked equivalents.
 * Runtime: exported schemas support boundary parsing or validation, not primary authoring.
 * Consumption: use governed severity values and mapping exports; do not recreate severity logic inline.
 * Mapping: severity-to-tone is reviewed semantic behavior, not a feature-level preference.
 * Defaults: add `DEFAULT_SEVERITY` only if the system adopts a true canonical default.
 * Changes: update this file first, then validate dependent semantic consumers and CI.
 * Purpose: prevent severity drift and keep semantic escalation behavior deterministic.
 */
import { z } from "zod/v4"

import { defineConstMap, defineTuple } from "../schema/shared"
import { toneSchema, type Tone } from "./tone"

export const severityValues = defineTuple([
  "none",
  "low",
  "medium",
  "high",
  "critical",
])
export const severitySchema = z.enum(severityValues)
export type Severity = (typeof severityValues)[number]

export const severityToToneSchema = z.record(severitySchema, toneSchema)

const severityToToneDefinition = {
  none: "neutral",
  low: "info",
  medium: "warning",
  high: "destructive",
  critical: "destructive",
} as const satisfies Record<Severity, Tone>

export const severityToTone = defineConstMap(
  severityToToneSchema.parse(severityToToneDefinition)
)

export function getSeverityTone(severity: Severity): Tone {
  return severityToTone[severity]
}
