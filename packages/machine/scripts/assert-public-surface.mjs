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
  "LYNX_MACHINE_ID",
  "createMachineRegistry",
  "createLynxMachineRuntime",
  "createPreviewMachineProvider",
  "MachineExecuteInputSchema",
  "MachineMessageSchema",
  "MachineConversationContextSchema",
  "parseMachineExecuteInput",
  "lynxCoreManifest",
  "lynxGeneralSkill",
]

const missingExports = requiredExports.filter(
  (exportName) => !(exportName in publicSurface)
)

if (missingExports.length > 0) {
  console.error(
    `ATC-MACHINE-SURFACE-001: @afenda/machine public surface is missing exports: ${missingExports.join(", ")}.`
  )
  process.exit(1)
}

process.exit(0)
