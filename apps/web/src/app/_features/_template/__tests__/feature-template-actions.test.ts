import { describe, expect, it } from "vitest"

import {
  executeFeatureTemplateCommand,
  featureTemplateCommands,
} from "../actions/feature-template-actions"
import type {
  FeatureTemplateCommandId,
  FeatureTemplateDefinition,
  FeatureTemplateMetric,
  FeatureTemplateRecord,
} from "../types/feature-template"

function createMetric(
  overrides: Partial<FeatureTemplateMetric> = {}
): FeatureTemplateMetric {
  return {
    id: "metric-001",
    label: "Queue health",
    value: "98%",
    helper: "Primary workspace scope",
    tone: "info",
    ...overrides,
  }
}

function createRecord(
  overrides: Partial<FeatureTemplateRecord> = {}
): FeatureTemplateRecord {
  return {
    id: "REC-001",
    title: "Investigate unmatched settlement",
    description: "Review the queued reconciliation exception.",
    status: "attention",
    owner: "Finance operations",
    updatedAt: "2026-04-20T10:30:00.000Z",
    severity: "high",
    category: "Reconciliation",
    slaLabel: "Due today",
    eventTimeLabel: "10:30 ICT",
    ...overrides,
  }
}

function createFeature(
  overrides: Partial<FeatureTemplateDefinition> = {}
): FeatureTemplateDefinition {
  return {
    slug: "audit",
    title: "Settlement Reconciliation",
    description: "Feature template for settlement review.",
    workspaceLabel: "Acme Treasury Ltd",
    scopeLabel: "Finance / Reconciliation",
    status: "attention",
    routePath: "/app/audit",
    metrics: [createMetric()],
    records: [
      createRecord(),
      createRecord({
        id: "REC-002",
        title: "Confirm allocation exception",
        severity: "medium",
      }),
    ],
    ...overrides,
  }
}

describe("featureTemplateCommands", () => {
  it("exposes a stable command catalog", () => {
    expect(featureTemplateCommands.map((command) => command.id)).toEqual([
      "refresh-view",
      "open-primary-record",
      "review-queue",
      "export-audit-pack",
    ])
  })
})

describe("executeFeatureTemplateCommand", () => {
  it.each(featureTemplateCommands.map((command) => command.id))(
    "returns a normalized result for %s",
    (commandId) => {
      const feature = createFeature()

      const result = executeFeatureTemplateCommand(
        feature,
        commandId as FeatureTemplateCommandId
      )

      expect(result.commandId).toBe(commandId)
      expect(result.featureSlug).toBe(feature.slug)
      expect(typeof result.message).toBe("string")
      expect(result.message.length).toBeGreaterThan(0)
    }
  )

  it("returns the refresh message", () => {
    const feature = createFeature({
      title: "Inventory Close",
    })

    const result = executeFeatureTemplateCommand(feature, "refresh-view")

    expect(result.message).toBe(
      "Inventory Close refreshed for the active workspace scope."
    )
  })

  it("returns the primary record message when a record exists", () => {
    const feature = createFeature({
      records: [
        createRecord({
          id: "REC-100",
          title: "Review blocked invoice",
        }),
      ],
    })

    const result = executeFeatureTemplateCommand(feature, "open-primary-record")

    expect(result.message).toBe(
      "Ready to open REC-100: Review blocked invoice."
    )
  })

  it("returns the empty-state message when no records exist", () => {
    const feature = createFeature({
      title: "Audit Workbench",
      records: [],
    })

    const result = executeFeatureTemplateCommand(feature, "open-primary-record")

    expect(result.message).toBe("No records are waiting in Audit Workbench.")
  })

  it("pluralizes review queue copy correctly", () => {
    const oneRecordFeature = createFeature({
      title: "Allocation Review",
      records: [
        createRecord({
          title: "Single queue item",
          severity: "low",
        }),
      ],
    })

    const manyRecordsFeature = createFeature({
      title: "Allocation Review",
      records: [
        createRecord({
          id: "REC-001",
          title: "Single queue item",
          severity: "low",
        }),
        createRecord({
          id: "REC-002",
          title: "Second queue item",
          severity: "medium",
        }),
      ],
    })

    expect(
      executeFeatureTemplateCommand(oneRecordFeature, "review-queue").message
    ).toBe("1 record queued for Allocation Review.")

    expect(
      executeFeatureTemplateCommand(manyRecordsFeature, "review-queue").message
    ).toBe("2 records queued for Allocation Review.")
  })

  it("pluralizes export copy correctly", () => {
    const feature = createFeature({
      title: "Evidence Pack",
      records: [
        createRecord({
          id: "REC-001",
          title: "Export item",
          severity: "low",
        }),
        createRecord({
          id: "REC-002",
          title: "Export item 2",
          severity: "medium",
        }),
      ],
    })

    const result = executeFeatureTemplateCommand(feature, "export-audit-pack")

    expect(result.message).toBe(
      "Prepared 2 records from Evidence Pack for export."
    )
  })
})
