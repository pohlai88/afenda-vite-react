import { describe, expect, it } from "vitest"

import {
  allocationUiStateValues,
  getAllocationUiModel,
} from "../domain/allocation"
import { evidenceUiStateValues, getEvidenceUiModel } from "../domain/evidence"
import {
  getInvariantUiModel,
  invariantSeverityValues,
} from "../domain/invariant"
import {
  getReconciliationUiModel,
  reconciliationUiStateValues,
} from "../domain/reconciliation"
import {
  getSettlementUiModel,
  settlementUiStateValues,
} from "../domain/settlement"
import {
  getIntegritySeverityUiModel,
  type ShellIntegritySeverity,
} from "../domain/integrity-severity"
import { semanticToneValues } from "../primitives/tone"
const toneSet = new Set<string>(semanticToneValues)
const integritySeverityValues: readonly ShellIntegritySeverity[] = [
  "valid",
  "warning",
  "broken",
  "pending",
  "neutral",
]

describe("semantic domain adapters", () => {
  it("maps every allocation state to a deterministic governed model", () => {
    for (const state of allocationUiStateValues) {
      const first = getAllocationUiModel(state)
      const second = getAllocationUiModel(state)

      expect(first).toBe(second)
      expect(toneSet.has(first.tone)).toBe(true)
      expect(first.badgeLabel.length).toBeGreaterThan(0)
    }
  })

  it("maps every settlement state to a deterministic governed model", () => {
    for (const state of settlementUiStateValues) {
      const first = getSettlementUiModel(state)
      const second = getSettlementUiModel(state)

      expect(first).toBe(second)
      expect(toneSet.has(first.tone)).toBe(true)
      expect(first.badgeLabel.length).toBeGreaterThan(0)
    }
  })

  it("maps every reconciliation state to a deterministic governed model", () => {
    for (const state of reconciliationUiStateValues) {
      const first = getReconciliationUiModel(state)
      const second = getReconciliationUiModel(state)

      expect(first).toBe(second)
      expect(toneSet.has(first.tone)).toBe(true)
      expect(first.badgeLabel.length).toBeGreaterThan(0)
    }
  })

  it("maps every evidence state to a deterministic governed model", () => {
    for (const state of evidenceUiStateValues) {
      const first = getEvidenceUiModel(state)
      const second = getEvidenceUiModel(state)

      expect(first).toBe(second)
      expect(toneSet.has(first.tone)).toBe(true)
      expect(first.badgeLabel.length).toBeGreaterThan(0)
    }
  })

  it("keeps invariant adapter alert role aligned with severity", () => {
    for (const severity of invariantSeverityValues) {
      const model = getInvariantUiModel(severity)

      if (severity === "high" || severity === "critical") {
        expect(model.alertRole).toBe("alert")
      } else {
        expect(model.alertRole).toBe("status")
      }
    }
  })

  it("maps every integrity severity to a deterministic governed model", () => {
    for (const severity of integritySeverityValues) {
      const first = getIntegritySeverityUiModel(severity)
      const second = getIntegritySeverityUiModel(severity)

      expect(first).toBe(second)
      expect(toneSet.has(first.tone)).toBe(true)
      expect(first.label.length).toBeGreaterThan(0)
    }
  })
})
