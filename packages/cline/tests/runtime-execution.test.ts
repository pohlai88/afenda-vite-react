import { mkdtemp } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import type {
  SyncPackGenerateResult,
  WriteTechStackScaffoldResult,
} from "@afenda/features-sdk/sync-pack"
import { describe, expect, it } from "vitest"

import { createClineMcpServerRuntime } from "../src/mcp-server/index.js"
import { createDefaultClineRuntime } from "../src/runtime/create-default-cline-runtime.js"
import {
  createSyncPackWorkspaceFixture,
  removeWorkspaceFixture,
  repoRoot,
} from "./helpers/workspace-fixture.js"

describe("governed Cline runtime", () => {
  it("executes the safe governed tool surface end to end", async () => {
    const runtime = createDefaultClineRuntime()
    const cases = [
      {
        tool: "quickstart" as const,
        mode: "guided_operator" as const,
        input: {},
      },
      {
        tool: "verify" as const,
        mode: "guided_operator" as const,
        input: {},
      },
      {
        tool: "release-check" as const,
        mode: "guided_operator" as const,
        input: {},
      },
      {
        tool: "check" as const,
        mode: "guided_operator" as const,
        input: {},
      },
      {
        tool: "doctor" as const,
        mode: "guided_operator" as const,
        input: {
          targetPath: path.join(repoRoot, "packages", "features-sdk"),
        },
      },
      {
        tool: "validate" as const,
        mode: "guided_operator" as const,
        input: {},
      },
      {
        tool: "rank" as const,
        mode: "feature_devops" as const,
        input: {
          filters: {
            pack: "internal-support-crm",
          },
        },
      },
      {
        tool: "report" as const,
        mode: "feature_devops" as const,
        input: {
          filters: {
            pack: "internal-support-crm",
          },
        },
      },
    ]

    for (const testCase of cases) {
      const result = await runtime.execute({
        tool: testCase.tool,
        mode: testCase.mode,
        workspaceRoot: repoRoot,
        input: testCase.input,
      })

      expect(result.ok).toBe(true)
      expect(result.tool).toBe(testCase.tool)
      expect(result.nextActions.length).toBeGreaterThan(0)
    }
  })

  it("keeps verify responses bounded to one exact next action", async () => {
    const runtime = createDefaultClineRuntime()
    const result = await runtime.execute({
      tool: "verify",
      mode: "guided_operator",
      workspaceRoot: repoRoot,
      input: {},
    })

    expect(result.ok).toBe(true)
    expect(result.tool).toBe("verify")
    expect(result.nextActions).toHaveLength(1)
    expect(result.explanation).toContain("one exact next command")
  })

  it("blocks mutating tools outside architect commander", async () => {
    const runtime = createDefaultClineRuntime()
    const result = await runtime.execute({
      tool: "scaffold",
      mode: "guided_operator",
      workspaceRoot: repoRoot,
      input: {
        appId: "internal-support-crm",
        category: "business-saas",
      },
    })

    expect(result.ok).toBe(false)
    if (result.ok) {
      throw new Error("Expected scaffold to be blocked for guided_operator.")
    }
    expect(result.error.code).toBe("tool-not-allowed")
  })

  it("allows architect commander to run generate with an isolated output directory", async () => {
    const runtime = createDefaultClineRuntime()
    const outputDirectory = await mkdtemp(
      path.join(os.tmpdir(), "cline-generate-")
    )

    const result = await runtime.execute({
      tool: "generate",
      mode: "architect_commander",
      workspaceRoot: repoRoot,
      input: {
        filters: {
          pack: "internal-support-crm",
        },
        outputDirectory,
      },
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      throw new Error("Expected generate to succeed.")
    }

    const data = result.data as SyncPackGenerateResult
    expect(data.outputDirectory).toBe(outputDirectory)
    expect(data.generatedFileCount).toBeGreaterThan(0)
  })

  it("allows architect commander to run scaffold and preserves relative placement paths", async () => {
    const runtime = createDefaultClineRuntime()
    const workspaceRoot = await createSyncPackWorkspaceFixture()

    try {
      const outputDirectory = path.join(workspaceRoot, ".artifacts", "scaffold")
      const result = await runtime.execute({
        tool: "scaffold",
        mode: "architect_commander",
        workspaceRoot,
        input: {
          workspaceRoot,
          outputDirectory,
          appId: "internal-support-crm",
          category: "business-saas",
        },
      })

      expect(result.ok).toBe(true)
      if (!result.ok) {
        throw new Error("Expected scaffold to succeed.")
      }

      const data = result.data as WriteTechStackScaffoldResult
      expect(data.outputDirectory).toBe(outputDirectory)
      expect(data.manifest.placement.planningPackDirectory).toBe(
        "packages/features-sdk/docs/sync-pack/generated-packs/business-saas/internal-support-crm"
      )
      expect(data.manifest.placement.webFeatureDirectory).toBe(
        "apps/web/src/app/_features/internal-support-crm"
      )
    } finally {
      await removeWorkspaceFixture(workspaceRoot)
    }
  })
})

describe("MCP transport host", () => {
  it("delegates tool execution through the default runtime", async () => {
    const server = createClineMcpServerRuntime()
    const result = await server.executeTool({
      tool: "report",
      mode: "feature_devops",
      workspaceRoot: repoRoot,
      input: {
        filters: {
          pack: "internal-support-crm",
        },
      },
    })

    expect(result.ok).toBe(true)
    expect(server.runtime.getTool("report")).toBeDefined()
  })
})
