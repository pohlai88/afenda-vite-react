import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const publicSurface = await import(
  pathToFileURL(path.join(packageRoot, "dist", "index.js")).href
)

const requiredExports = [
  "createDefaultOperatorRuntime",
  "createOperatorMcpAdapterRuntime",
  "createOperatorRegistry",
  "createOperatorOrchestrator",
  "featuresSdkPlugin",
  "operatorModes",
  "OPERATOR_TOOL_NAMES",
  "OperatorExecuteInputSchema",
  "OperatorModeSchema",
  "GovernedOperatorToolNameSchema",
  "parseOperatorExecuteInput",
]

const missingExports = requiredExports.filter(
  (exportName) => !(exportName in publicSurface)
)

if (missingExports.length > 0) {
  console.error(
    `ATC-OPERATOR-TOOLS-001: @afenda/operator-kernel public surface is missing exports: ${missingExports.join(", ")}.`
  )
  process.exit(1)
}

process.exit(0)
