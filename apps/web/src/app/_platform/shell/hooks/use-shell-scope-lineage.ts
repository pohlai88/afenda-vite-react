/**
 * Resolves the **four positional scope filters** for the top bar.
 *
 * Each segment is `{ slot, dimensionLabel, label }`: tenant defines what each slot
 * means (same dimension can repeat, e.g. four “Company” filters for treasury). Replace
 * with `GET /me/scope` or session + tenant config.
 */

import { useMemo } from "react"

import type { ShellScopeLineageModel } from "../contract/shell-scope-lineage.contract"

/**
 * Demo: mixed dimensions (company → region → function → area).
 * Alternative tenant config: all four `dimensionLabel: "Company"` with different `label`s.
 */
const PLACEHOLDER_SCOPE_LINEAGE: ShellScopeLineageModel = {
  isPlaceholder: true,
  segments: [
    {
      id: "demo-l1",
      slot: "level_1",
      dimensionLabel: "Company",
      label: "Acme Holdings",
      switchable: true,
    },
    {
      id: "demo-l2",
      slot: "level_2",
      dimensionLabel: "Company",
      label: "Acme Treasury Ltd",
      switchable: true,
    },
    {
      id: "demo-l3",
      slot: "level_3",
      dimensionLabel: "Function",
      label: "Finance",
      switchable: true,
    },
    {
      id: "demo-l4",
      slot: "level_4",
      dimensionLabel: "Area",
      label: "Accounts payable",
      switchable: true,
    },
  ],
}

export function useShellScopeLineage(): ShellScopeLineageModel {
  return useMemo(() => PLACEHOLDER_SCOPE_LINEAGE, [])
}
