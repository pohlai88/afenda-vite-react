/**
 * DOMAIN MAPPING — settlement
 * Canonical domain-to-component mapping for settlement state presentation.
 * Semantics: settlement states must come from the governed domain vocabulary.
 * Mapping: outputs translate domain truth into governed component variants.
 * Runtime: schemas support validation, not feature-level remapping.
 * Consumption: use exported mappings instead of recreating settlement-style logic inline.
 * Changes: update this file when settlement truth or governed presentation changes.
 * Purpose: keep settlement rendering deterministic and semantically centralized.
 */
import { z } from "zod/v4"

import type { BadgeVariant } from "../component/badge"
import { defineConstMap, defineTuple } from "../schema/shared"

export const settlementStateValues = defineTuple([
  "draft",
  "pending",
  "settled",
  "partially_settled",
  "failed",
  "reversed",
])
export const settlementStateSchema = z.enum(settlementStateValues)
export type SettlementState = z.infer<typeof settlementStateSchema>

export const settlementStateToBadgeVariant = defineConstMap({
  draft: "secondary",
  pending: "warning",
  settled: "success",
  partially_settled: "warning",
  failed: "destructive",
  reversed: "outline",
} satisfies Record<SettlementState, BadgeVariant>)
