import { readFile } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  findFeaturesSdkRoot,
  getSyncPackCommandDefinition,
  syncPackWorkflowCatalog,
} from "../../src/index.js"

describe("Sync-Pack Feature Factory parity", () => {
  it("keeps workflow catalog aligned with CLI command definitions", () => {
    const workflowNames = Object.keys(syncPackWorkflowCatalog)

    expect(
      workflowNames.every(
        (workflowName) =>
          getSyncPackCommandDefinition(workflowName)?.name === workflowName
      )
    ).toBe(true)
  })

  it("documents every governed workflow command in the Sync-Pack README", async () => {
    const packageRoot = findFeaturesSdkRoot()
    const syncPackReadme = await readFile(
      path.join(packageRoot, "docs", "sync-pack", "README.md"),
      "utf8"
    )

    for (const workflowName of Object.keys(syncPackWorkflowCatalog)) {
      const expectedCommand =
        workflowName === "quickstart"
          ? "pnpm run feature-sync"
          : `pnpm run feature-sync:${workflowName}`

      expect(syncPackReadme).toContain(expectedCommand)
    }
  })
})
