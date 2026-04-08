/**
 * DOMAIN MAPPING — allocation
 * Canonical domain-to-component mapping for allocation state presentation.
 * Semantics: allocation states must come from the governed domain vocabulary.
 * Mapping: outputs translate domain truth into governed component variants.
 * Runtime: schemas support validation, not feature-level remapping.
 * Consumption: use exported mappings instead of recreating allocation-style logic inline.
 * Changes: update this file when allocation truth or governed presentation changes.
 * Purpose: keep allocation rendering deterministic and semantically centralized.
 */
import { z } from "zod/v4"

import { badgeVariantSchema, type BadgeVariant } from "../component/badge"
import { defineConstMap, defineTuple } from "../schema/shared"

export const allocationStateValues = defineTuple([
  "unallocated",
  "partially_allocated",
  "allocated",
  "overblocked",
  "reversed",
])
export const allocationStateSchema = z.enum(allocationStateValues)
export type AllocationState = z.infer<typeof allocationStateSchema>

export const allocationStateToBadgeVariantSchema = z.record(
  allocationStateSchema,
  badgeVariantSchema
)

export const allocationStateToBadgeVariant = defineConstMap(
  allocationStateToBadgeVariantSchema.parse({
    unallocated: "secondary",
    partially_allocated: "warning",
    allocated: "success",
    overblocked: "destructive",
    reversed: "outline",
  } satisfies Record<AllocationState, BadgeVariant>)
)
