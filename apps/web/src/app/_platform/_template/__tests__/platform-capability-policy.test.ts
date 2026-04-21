import { describe, expect, it } from "vitest"

import {
  platformCapabilityPolicy,
  platformCapabilityTemplateContract,
} from "../policy/platform-capability-policy"
import { createPlatformCapabilityTemplateReport } from "../scripts/platform-capability-template-report"
import { listPlatformCapabilityContracts } from "../services/platform-capability-service"
import { assertPlatformCapabilityId } from "../platform-capability-metadata"

describe("platform capability template", () => {
  it("keeps feature internals outside the platform boundary", () => {
    expect(platformCapabilityTemplateContract.mayImportFeatureRoots).toBe(true)
    expect(platformCapabilityTemplateContract.mayImportFeatureInternals).toBe(
      false
    )
    expect(platformCapabilityPolicy.featureInternalImportPattern).toBe(
      "app/_features/*/*"
    )
  })

  it("registers a copyable template contract", () => {
    expect(listPlatformCapabilityContracts()).toContain(
      platformCapabilityTemplateContract
    )
    expect(assertPlatformCapabilityId("shell")).toBe("shell")
  })

  it("reports required scripts and tests folders for onboarding checks", () => {
    const report = createPlatformCapabilityTemplateReport()

    expect(report.requiredFolders).toEqual(
      expect.arrayContaining(["__tests__", "scripts", "policy", "services"])
    )
    expect(report.publicImportsOnly).toBe(true)
  })
})
