/**
 * Structural mapper regression: v1 contract entry → v2 blueprint projection.
 * Fails if `shellComponentContractEntrySchema` fields drift from the grouped shape.
 */
import { describe, expect, it } from "vitest"

import {
  shellComponentContract,
  shellComponentContractEntryToV2Blueprint,
} from "@afenda/shadcn-ui/lib/constant"

describe("shellComponentContractEntryToV2Blueprint", () => {
  it("maps a canonical v1 registry entry to the v2 blueprint without losing fields", () => {
    const entry = shellComponentContract["shell-title"]
    const blueprint = shellComponentContractEntryToV2Blueprint(entry)

    expect(blueprint.contractVersion).toBe(2)
    expect(blueprint).toMatchObject({
      contractVersion: 2,
      identity: {
        key: entry.key,
        componentName: entry.componentName,
        kind: entry.kind,
        priorityTier: entry.priorityTier,
      },
      boundary: {
        surfaceScope: entry.surfaceScope,
        isolation: entry.isolation,
      },
      participation: {
        shellMetadata: entry.participation.shellMetadata,
        navigationContext: entry.participation.navigationContext,
        commandInfrastructure: entry.participation.commandInfrastructure,
        layoutDensity: entry.participation.layoutDensity,
        responsiveShell: entry.participation.responsiveShell,
      },
      placement: {
        zone: entry.zone,
        shellAware: entry.shellAware,
      },
      policy: {
        allowOutsideShellProvider: entry.allowOutsideShellProvider,
        allowFeatureLevelShellRebinding: entry.allowFeatureLevelShellRebinding,
      },
    })
  })
})
