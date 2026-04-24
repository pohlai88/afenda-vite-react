import type { ClinePluginManifest } from "../../core/contracts.js"
import { governedClineTools } from "./tools/index.js"

export const featuresSdkClinePlugin: ClinePluginManifest = {
  id: "features-sdk",
  name: "Feature SDK plugin",
  version: "0.0.0",
  tools: governedClineTools.map((tool) => ({
    id: tool.name,
    capability: tool.capability,
    summary: tool.summary,
    usage: tool.usage,
    mutating: tool.mutating,
  })),
}
