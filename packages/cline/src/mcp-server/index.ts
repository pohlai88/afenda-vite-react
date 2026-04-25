import {
  createDefaultClineRuntime,
  type ClineExecuteInput,
  type ClineExecuteOutput,
  type ClineRuntime,
} from "../runtime/index.js"

export interface ClineMcpServerRuntime {
  readonly runtime: ClineRuntime
  readonly executeTool: (
    input: ClineExecuteInput
  ) => Promise<ClineExecuteOutput>
}

export function createClineMcpServerRuntime(): ClineMcpServerRuntime {
  const runtime = createDefaultClineRuntime()

  return {
    runtime,
    executeTool: (input) => runtime.execute(input),
  }
}
