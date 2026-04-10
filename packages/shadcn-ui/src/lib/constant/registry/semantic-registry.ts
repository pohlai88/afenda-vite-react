/**
 * SEMANTIC REGISTRY — semantic-registry
 * Canonical aggregate registry for exported semantic vocabularies.
 * Tier: Tier 1: simple registry aggregate.
 * Source of truth: this file aggregates canonical semantic sources; it does not replace them.
 * Runtime: exported schemas support aggregate validation and tooling boundaries.
 * Consumption: use this registry and schema for inspection, validation, or tooling, not as a duplicate authoring home.
 * Defaults: defaults belong in source files, not in this aggregate registry.
 * Constraints: registry entries must point only to canonical semantic exports.
 * Changes: update canonical source files first, then keep this aggregate synchronized.
 * Purpose: expose one reviewable semantic index for tooling and validation.
 */
import { type z } from "zod/v4"

import { emphasisValues } from "../semantic/emphasis"
import { intentValues } from "../semantic/intent"
import { lifecycleStatusValues } from "../semantic/status"
import { surfaceValues } from "../semantic/surface"
import { severityValues } from "../semantic/severity"
import { toneValues } from "../semantic/tone"
import {
  defineConstMap,
  flatRegistrySchemaFromDefinition,
  type RegistryTupleMapDefinition,
} from "../schema/shared"

type SemanticRegistryDefinition = RegistryTupleMapDefinition<{
  emphasis: typeof emphasisValues
  intent: typeof intentValues
  lifecycleStatus: typeof lifecycleStatusValues
  severity: typeof severityValues
  surface: typeof surfaceValues
  tone: typeof toneValues
}>

const semanticRegistryDefinition = {
  emphasis: emphasisValues,
  intent: intentValues,
  lifecycleStatus: lifecycleStatusValues,
  severity: severityValues,
  surface: surfaceValues,
  tone: toneValues,
} as const satisfies SemanticRegistryDefinition

export const semanticRegistrySchema =
  flatRegistrySchemaFromDefinition(semanticRegistryDefinition)
export type SemanticRegistrySnapshot = z.infer<typeof semanticRegistrySchema>

export const semanticRegistry = defineConstMap(
  semanticRegistrySchema.parse(semanticRegistryDefinition),
)
