import type {
  GovernedClineToolDefinition,
  GovernedClineToolName,
} from "../mode/cline-mode-contract.js"
import { checkTool } from "./check.tool.js"
import { doctorTool } from "./doctor.tool.js"
import { quickstartTool } from "./quickstart.tool.js"
import { verifyTool } from "./verify.tool.js"

export const governedClineTools = [
  quickstartTool,
  verifyTool,
  checkTool,
  doctorTool,
] as const satisfies readonly GovernedClineToolDefinition[]

export function getGovernedClineTool(
  name: GovernedClineToolName
): GovernedClineToolDefinition | undefined {
  return governedClineTools.find((tool) => tool.name === name)
}
