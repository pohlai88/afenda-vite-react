/**
 * DOMAIN MAPPING — invariant
 * Canonical domain-to-component mapping for invariant outcomes and severity presentation.
 * Semantics: invariant outcomes and severities must come from governed vocabularies.
 * Mapping: outputs translate domain truth into governed badge and alert variants.
 * Runtime: schemas support validation, not feature-level remapping.
 * Consumption: use exported mappings instead of recreating invariant-style logic inline.
 * Changes: update this file when invariant truth or governed presentation changes.
 * Purpose: keep invariant rendering deterministic and semantically centralized.
 */
import { z } from "zod/v4"

import { alertVariantSchema, type AlertVariant } from "../component/alert"
import { badgeVariantSchema, type BadgeVariant } from "../component/badge"
import { defineConstMap, defineTuple } from "../schema/shared"
import { severitySchema, type Severity } from "../semantic/severity"

export const invariantOutcomeValues = defineTuple([
  "passed",
  "warning",
  "failed",
  "blocked",
])
export const invariantOutcomeSchema = z.enum(invariantOutcomeValues)
export type InvariantOutcome = z.infer<typeof invariantOutcomeSchema>

export const invariantOutcomeToBadgeVariantSchema = z.record(
  invariantOutcomeSchema,
  badgeVariantSchema
)

export const invariantOutcomeToBadgeVariant = defineConstMap(
  invariantOutcomeToBadgeVariantSchema.parse({
    passed: "success",
    warning: "warning",
    failed: "destructive",
    blocked: "destructive",
  } satisfies Record<InvariantOutcome, BadgeVariant>)
)

export const severityToInvariantAlertVariant = defineConstMap(
  z.record(severitySchema, alertVariantSchema).parse({
    none: "default",
    low: "info",
    medium: "warning",
    high: "destructive",
    critical: "destructive",
  } satisfies Record<Severity, AlertVariant>)
)
