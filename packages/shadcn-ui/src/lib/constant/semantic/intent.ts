/**
 * SEMANTIC REGISTRY — intent
 * Canonical lookup registry for intent semantics.
 * Tier: Tier 1: simple registry.
 * Shape: tuple values, union type, Zod enum.
 * Runtime: schema exists for boundary reuse, not as the primary authoring model.
 * Consumption: import the canonical union or schema; do not invent local intent strings.
 * Defaults: add `DEFAULT_INTENT` only if the system adopts a true canonical default.
 * Constraints: no duplicate registries and no free-form semantic strings.
 * Changes: preserve deterministic vocabulary and exact value coverage.
 * Purpose: provide one stable intent vocabulary with minimal ceremony.
 */
import { z } from "zod/v4"

import { defineTuple } from "../schema/shared"

export const intentValues = defineTuple([
  "default",
  "primary",
  "secondary",
  "destructive",
  "success",
  "warning",
  "info",
  "ghost",
  "outline",
  "link",
])
export const intentSchema = z.enum(intentValues)
export type Intent = (typeof intentValues)[number]
