/**
 * DOCTRINE MANIFEST — shell
 * JSON-serializable snapshot of governed shell vocabulary boundaries (not a second source of truth).
 * Scope: CI baselines, governance scripts, drift comparison; values are derived from policy/registry modules.
 */
import { shellComponentRegistryKeyValues } from "./registry/shell-component-registry"
import { shellSlotIdValues } from "./policy/shell-slot-policy"
import { shellStateKeyValues } from "./shell-state-key-vocabulary"

/** Bump when manifest shape or semantics change (tooling / baselines). */
export const SHELL_DOCTRINE_MANIFEST_VERSION = "1" as const

export interface ShellDoctrineManifest {
  manifestVersion: typeof SHELL_DOCTRINE_MANIFEST_VERSION
  /** Stable shell component registry keys (`shell-*`). */
  componentRegistryKeys: readonly string[]
  /** Canonical slot ids from slot policy. */
  slotIds: readonly string[]
  /** Governed shell UI state keys. */
  stateKeys: readonly string[]
  /**
   * Validation order aligned with `validate-constants.ts` shell phase (names only).
   * `validateShellStatePolicy` is doctrine-only unless callers pass `{ scanRepo: true }`.
   */
  validationPipeline: readonly string[]
}

let cachedManifest: ShellDoctrineManifest | undefined

export function getShellDoctrineManifest(): ShellDoctrineManifest {
  if (cachedManifest) return cachedManifest
  cachedManifest = {
    manifestVersion: SHELL_DOCTRINE_MANIFEST_VERSION,
    componentRegistryKeys: [...shellComponentRegistryKeyValues],
    slotIds: [...shellSlotIdValues],
    stateKeys: [...shellStateKeyValues],
    validationPipeline: [
      "validateShellRegistry",
      "validateShellPolicyConsistency",
      "validateShellStatePolicy",
      "validateShellRuntimeContracts",
    ],
  }
  return cachedManifest
}

/** Stable JSON for scripts (`pnpm` governance, snapshot tests). */
export function serializeShellDoctrineManifest(pretty = false): string {
  const m = getShellDoctrineManifest()
  return pretty ? JSON.stringify(m, null, 2) : JSON.stringify(m)
}
