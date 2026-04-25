import { describe, expect, it } from "vitest"

import { syncPackWorkflowCatalog } from "@afenda/features-sdk/sync-pack"

import { createDefaultClineRuntime } from "../src/runtime/create-default-cline-runtime.js"
import { CLINE_TOOL_NAMES } from "../src/runtime/contracts.js"
import { governedClineTools } from "../src/plugins/features-sdk/tools/index.js"

describe("ATC-CLINE-TOOLS-001 parity", () => {
  it("keeps canonical tool names, SDK workflows, and runtime registry in sync", () => {
    const runtime = createDefaultClineRuntime()
    const sdkTools = Object.keys(syncPackWorkflowCatalog)
    const runtimeTools = runtime.registry.tools.map((tool) => tool.id)
    const governedTools = governedClineTools.map((tool) => tool.name)

    expect([...CLINE_TOOL_NAMES]).toEqual(sdkTools)
    expect(governedTools).toEqual([...CLINE_TOOL_NAMES])
    expect(runtimeTools).toEqual([...CLINE_TOOL_NAMES])
  })
})
