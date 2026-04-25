import type { OperatorPluginManifest } from "../../core/contracts.js"
import { assertSafeGovernedCommand } from "./guards/safe-command-policy.js"
import { governedOperatorTools } from "./tools/index.js"

export const featuresSdkOperatorPlugin: OperatorPluginManifest = {
  id: "features-sdk",
  name: "Feature SDK plugin",
  version: "0.0.0",
  tools: governedOperatorTools.map((tool) => ({
    id: tool.name,
    capability: tool.capability,
    summary: tool.summary,
    usage: tool.usage,
    mutating: tool.mutating,
    execute: tool.execute,
  })),
  safetyPolicies: [
    {
      id: "features-sdk-governed-command-policy",
      summary:
        "Only governed pnpm feature-sync commands may appear in explanations and next actions.",
      assertAllowed: ({ command }) =>
        assertSafeGovernedCommand(command, "Feature SDK plugin safety policy"),
    },
  ],
}
