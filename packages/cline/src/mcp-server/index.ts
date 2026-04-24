import type { ClinePluginManifest } from "../core/contracts.js"
import {
  createClineOrchestrator,
  type ClineOrchestrator,
} from "../core/orchestrator.js"

export interface ClineMcpServerRuntime {
  readonly orchestrator: ClineOrchestrator
}

export function createClineMcpServerRuntime(
  plugins: readonly ClinePluginManifest[]
): ClineMcpServerRuntime {
  return {
    orchestrator: createClineOrchestrator(plugins),
  }
}
