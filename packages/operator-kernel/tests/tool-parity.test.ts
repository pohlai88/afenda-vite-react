import { describe, expect, it } from "vitest"

import { syncPackWorkflowCatalog } from "@afenda/features-sdk/sync-pack"

import { createDefaultOperatorRuntime } from "../src/runtime/create-default-operator-runtime.js"
import { OPERATOR_TOOL_NAMES } from "../src/runtime/contracts.js"
import { governedOperatorTools } from "../src/plugins/features-sdk/tools/index.js"

describe("ATC-OPERATOR-TOOLS-001 parity", () => {
  it("keeps canonical tool names, SDK workflows, and runtime registry in sync", () => {
    const runtime = createDefaultOperatorRuntime()
    const sdkTools = Object.keys(syncPackWorkflowCatalog)
    const runtimeTools = runtime.registry.tools.map((tool) => tool.id)
    const governedTools = governedOperatorTools.map((tool) => tool.name)

    expect([...OPERATOR_TOOL_NAMES]).toEqual(sdkTools)
    expect(governedTools).toEqual([...OPERATOR_TOOL_NAMES])
    expect(runtimeTools).toEqual([...OPERATOR_TOOL_NAMES])
  })
})
