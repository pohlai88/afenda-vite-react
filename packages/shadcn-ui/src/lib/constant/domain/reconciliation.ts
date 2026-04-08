/**
 * DOMAIN MAPPING — reconciliation
 * Canonical domain-to-component mapping for reconciliation state presentation.
 * Semantics: reconciliation states must come from the governed domain vocabulary.
 * Mapping: outputs translate domain truth into governed component variants.
 * Runtime: schemas support validation, not feature-level remapping.
 * Consumption: use exported mappings instead of recreating reconciliation-style logic inline.
 * Changes: update this file when reconciliation truth or governed presentation changes.
 * Purpose: keep reconciliation rendering deterministic and semantically centralized.
 */
import { z } from "zod/v4"

import type { BadgeVariant } from "../component/badge"
import { defineConstMap, defineTuple } from "../schema/shared"

export const reconciliationStateValues = defineTuple([
  "unmatched",
  "partially_matched",
  "matched",
  "exception",
])
export const reconciliationStateSchema = z.enum(reconciliationStateValues)
export type ReconciliationState = z.infer<typeof reconciliationStateSchema>

export const reconciliationStateToBadgeVariant = defineConstMap({
  unmatched: "secondary",
  partially_matched: "warning",
  matched: "success",
  exception: "destructive",
} satisfies Record<ReconciliationState, BadgeVariant>)
