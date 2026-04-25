import { describe, expect, it } from "vitest"

import {
  GovernedOperatorToolNameSchema,
  OperatorExecuteInputSchema,
  OperatorModeSchema,
  parseOperatorExecuteInput,
} from "../src/runtime/contracts.js"

describe("Operator Kernel runtime input contracts", () => {
  it("accepts governed tool execution input", () => {
    expect(
      parseOperatorExecuteInput({
        tool: "verify",
        mode: "guided_operator",
        workspaceRoot: process.cwd(),
        input: {},
      })
    ).toMatchObject({
      tool: "verify",
      mode: "guided_operator",
    })
  })

  it("rejects unknown tools and modes", () => {
    expect(() => OperatorModeSchema.parse("unsupported")).toThrow()
    expect(() => GovernedOperatorToolNameSchema.parse("publish")).toThrow()
    expect(() =>
      OperatorExecuteInputSchema.parse({
        tool: "verify",
        mode: "guided_operator",
        workspaceRoot: "",
        input: {},
      })
    ).toThrow()
  })
})
