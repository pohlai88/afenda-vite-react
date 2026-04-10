import {
  type ShellMetadata,
  shellMetadataDefaults,
} from "../contract/shell-metadata-contract"
import * as ShellProvider from "./shell-provider"

/**
 * GOVERNANCE HOOKS — use-shell-metadata
 * Canonical shell metadata hook surface for governed runtime consumption.
 * Scope: provides strict and optional accessors over the shell provider boundary.
 * Authority: use these hooks instead of direct useContext on shell-related contexts.
 * Purpose: keep shell metadata consumption explicit, typed, and non-fragmented.
 *
 * @example Direct imports (preferred for tree-shaking)
 * ```tsx
 * import {
 *   useShellMetadata,
 *   useOptionalShellMetadata,
 *   getShellMetadataDefaults,
 * } from "./use-shell-metadata"
 *
 * function StrictChild() {
 *   const metadata = useShellMetadata()
 *   return <span>{metadata.zone}</span>
 * }
 * ```
 *
 * @example Namespace-style access (autocomplete / discoverability)
 * ```tsx
 * import { ShellMetadataHooks } from "./use-shell-metadata"
 *
 * function StrictChild() {
 *   const metadata = ShellMetadataHooks.useStrict()
 *   return <span>{metadata.zone}</span>
 * }
 * ```
 */

/**
 * Strict accessor — throws if `ShellProvider` is not mounted.
 * Use when shell metadata is required for correct behavior.
 */
export { useShellMetadata } from "./shell-provider"

/**
 * Optional accessor — returns `null` if `ShellProvider` is not mounted.
 * Use when shell metadata is helpful but not required.
 */
export function useOptionalShellMetadata(): ShellMetadata | null {
  return ShellProvider.useShellMetadataContextValue()
}

/**
 * Returns the canonical default shell metadata values.
 * Use for initialization or fallback scenarios.
 */
export function getShellMetadataDefaults(): ShellMetadata {
  return shellMetadataDefaults
}

/** Namespace-style bundle for the hook surface (same behavior as named exports). */
export type ShellMetadataHooksApi = Readonly<{
  useStrict: () => ShellMetadata
  useOptional: () => ShellMetadata | null
  getDefaults: () => ShellMetadata
}>

/**
 * Frozen alias for discoverability and autocomplete (`ShellMetadataHooks.useStrict`, etc.).
 * Named exports remain preferred for clarity and tree-shaking.
 */
export const ShellMetadataHooks: ShellMetadataHooksApi = Object.freeze({
  useStrict: ShellProvider.useShellMetadata as ShellMetadataHooksApi["useStrict"],
  useOptional: useOptionalShellMetadata,
  getDefaults: getShellMetadataDefaults,
})
