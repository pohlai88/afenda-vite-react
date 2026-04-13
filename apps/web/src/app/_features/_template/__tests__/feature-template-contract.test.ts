import { describe, expect, it } from "vitest"

import {
  executeFeatureTemplateCommand,
  featureTemplateCommands,
} from "../actions/feature-template-actions"
import { createFeatureTemplateReport } from "../scripts/feature-template-report"
import { fetchFeatureTemplate } from "../services/feature-template-service"
import { resolveFeatureTemplateSlug } from "../utils/feature-template-utils"

describe("feature template contract", () => {
  it("resolves route slugs to a known feature contract", async () => {
    const slug = resolveFeatureTemplateSlug("audit")
    const feature = await fetchFeatureTemplate(slug)

    expect(feature.slug).toBe("audit")
    expect(feature.metrics.length).toBeGreaterThan(0)
    expect(feature.records.length).toBeGreaterThan(0)
  })

  it("keeps commands executable through the action boundary", async () => {
    const feature = await fetchFeatureTemplate("events")
    const [command] = featureTemplateCommands

    expect(command).toBeDefined()

    const result = executeFeatureTemplateCommand(feature, command.id)

    expect(result.featureSlug).toBe("events")
    expect(result.message.length).toBeGreaterThan(0)
  })

  it("reports the required template folders for onboarding checks", async () => {
    const report = await createFeatureTemplateReport("partners")

    expect(report.requiredFolders).toEqual(
      expect.arrayContaining(["__tests__", "scripts", "services", "types"])
    )
    expect(report.commandCount).toBe(featureTemplateCommands.length)
  })
})
