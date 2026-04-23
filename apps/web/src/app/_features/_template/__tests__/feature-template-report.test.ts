import { describe, expect, it } from "vitest"

import {
  createFeatureTemplateReport,
  featureTemplateRequiredFolders,
} from "../scripts/generate-feature-template-report"

describe("createFeatureTemplateReport", () => {
  it("separates structure policy from unverified structure evidence", async () => {
    const report = await createFeatureTemplateReport("events")

    expect(report.featureSlug).toBe("events")
    expect(report.commandCount).toBeGreaterThan(0)
    expect(report.metricCount).toBeGreaterThan(0)
    expect(report.recordCount).toBeGreaterThan(0)

    expect(report.structurePolicy).toEqual({
      expectedFolders: featureTemplateRequiredFolders,
    })

    expect(report.structureEvidence).toEqual({
      detectedFolders: {
        value: null,
        status: "unverified",
      },
      missingFolders: {
        value: null,
        status: "unverified",
      },
      hasPublicApi: {
        value: null,
        status: "unverified",
      },
    })
  })
})
