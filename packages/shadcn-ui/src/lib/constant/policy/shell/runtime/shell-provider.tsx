import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react"

import {
  parseShellMetadata,
  type ShellMetadata,
} from "../contract/shell-metadata-contract"

/**
 * GOVERNANCE CONTRACT — shell-provider
 * Canonical shell runtime provider for governed shell metadata consumption.
 * Scope: exposes the reviewed shell metadata contract through one approved provider boundary.
 * Authority: consumers should use this provider/hook surface instead of creating local shell providers.
 * Consumption: shell-aware components, selector hooks, and governance checks rely on this canonical entrypoint.
 * Changes: update deliberately; provider semantics and fallback behavior are platform-level decisions.
 * Constraints: keep behavior explicit and deterministic; avoid silent fallback drift in governed product UI.
 * Purpose: preserve one auditable shell runtime truth across the product.
 *
 * @example Direct hook imports (preferred for tree-shaking)
 * ```tsx
 * import { ShellProvider, useShellMetadata } from "./shell-provider"
 *
 * function ShellChild() {
 *   const metadata = useShellMetadata()
 *   return <span>{metadata.zone}</span>
 * }
 * ```
 *
 * @example Namespace-style access (autocomplete / discoverability)
 * ```tsx
 * import { ShellProvider, ShellProviderUtils } from "./shell-provider"
 *
 * function ShellChild() {
 *   const metadata = ShellProviderUtils.useNonNull()
 *   return <span>{metadata.zone}</span>
 * }
 * ```
 *
 * Runtime validation helpers for unknown input live on the metadata contract
 * (`assertShellMetadata`, `ShellMetadataUtils` in `shell-metadata-contract`).
 */

export const ShellMetadataContext = createContext<ShellMetadata | null>(null)

export interface ShellProviderProps extends PropsWithChildren {
  metadata: ShellMetadata
}

export type ShellMetadataContextValue = ShellMetadata | null

/**
 * Provides validated shell metadata to all shell-aware components.
 * Consumers must use this provider instead of creating local shell metadata providers.
 */
export function ShellProvider({ metadata, children }: ShellProviderProps) {
  const validatedMetadata = useMemo(
    () => parseShellMetadata(metadata),
    [metadata]
  )

  return (
    <ShellMetadataContext.Provider value={validatedMetadata}>
      {children}
    </ShellMetadataContext.Provider>
  )
}

/**
 * Internal-only context reader used by approved shell hooks.
 * Prefer {@link useShellMetadata} for shell-aware UI so missing-provider errors are explicit.
 */
export function useShellMetadataContextValue(): ShellMetadataContextValue {
  return useContext(ShellMetadataContext)
}

/**
 * Returns validated shell metadata from the canonical {@link ShellProvider}.
 * @throws When used outside `ShellProvider` (prevents silent `null` fallbacks in governed UI).
 */
export function useShellMetadata(): ShellMetadata {
  const ctx = useShellMetadataContextValue()
  if (!ctx) {
    throw new Error(
      "useShellMetadata must be used within the canonical ShellProvider boundary."
    )
  }
  return ctx
}

/**
 * Frozen alias for discoverability and autocomplete (`ShellProviderUtils.useNonNull`, etc.).
 * Named exports remain preferred for clarity and tree-shaking.
 */
export const ShellProviderUtils = Object.freeze({
  Context: ShellMetadataContext,
  useValue: useShellMetadataContextValue,
  useNonNull: useShellMetadata,
})
