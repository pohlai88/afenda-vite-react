import {
  createDefaultOperatorRuntime,
  parseOperatorExecuteInput,
  type OperatorExecuteInput,
  type OperatorExecuteOutput,
  type OperatorRuntime,
} from "../runtime/index.js"

export interface OperatorMcpAdapterRuntime {
  readonly runtime: OperatorRuntime
  readonly executeTool: (
    input: OperatorExecuteInput
  ) => Promise<OperatorExecuteOutput>
}

export function createOperatorMcpAdapterRuntime(): OperatorMcpAdapterRuntime {
  const runtime = createDefaultOperatorRuntime()

  return {
    runtime,
    executeTool: (input) => runtime.execute(parseOperatorExecuteInput(input)),
  }
}
