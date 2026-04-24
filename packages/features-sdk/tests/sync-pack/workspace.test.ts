import { mkdtemp, rm } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { findWorkspaceRoot } from "../../src/sync-pack/workspace.js"

describe("workspace discovery diagnostics", () => {
  it("explains missing workspace roots with searched markers", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "fsdk-workspace-"))

    try {
      expect(() => findWorkspaceRoot(directory)).toThrow(
        /expected marker: pnpm-workspace\.yaml/
      )
      expect(() => findWorkspaceRoot(directory)).toThrow(/remediation:/)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
