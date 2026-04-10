import type { ShellMetadata } from "../contract/shell-metadata-contract"
import {
  isCompactShellDensity,
  isDesktopShellViewport,
  isMobileShellViewport,
  isShellCommandEnabled,
  isShellContent,
  isShellNavigationCollapsed,
  isShellOverlay,
  isWideShellViewport,
} from "./shell-selectors"
import {
  useShellMetadata,
  useShellMetadataContextValue,
} from "./shell-provider"

/** Typed hook refs — typed-eslint can lose `ShellMetadata` when resolving hooks from `.tsx` into `.ts`. */
const useShellMetadataStrict: () => ShellMetadata =
  useShellMetadata as () => ShellMetadata
const useShellMetadataContextValueTyped: () => ShellMetadata | null =
  useShellMetadataContextValue as () => ShellMetadata | null

/**
 * GOVERNANCE HOOKS — use-shell-selectors
 * Approved shell-aware convenience hooks built on the canonical shell provider boundary.
 * Scope: exposes stable derived shell-state helpers for governed feature consumption.
 * Authority: prefer these hooks to feature-local shell derivation when meaning is already canonical.
 * Purpose: keep shell consumption simple while preventing repeated local reinvention.
 *
 * @example Direct hook imports (preferred for tree-shaking)
 * ```tsx
 * import { useIsShellContent, useOptionalIsShellContent } from "./use-shell-selectors"
 *
 * function ShellChild() {
 *   const inContent = useIsShellContent()
 *   return inContent ? <span>In content</span> : null
 * }
 * ```
 *
 * @example Namespace-style access (autocomplete / discoverability)
 * ```tsx
 * import { ShellSelectorHooks } from "./use-shell-selectors"
 *
 * function ShellChild() {
 *   const inContent = ShellSelectorHooks.useIsShellContent()
 *   return inContent ? <span>In content</span> : null
 * }
 * ```
 *
 * @example Optional hooks when `ShellProvider` may be absent (`null` metadata)
 * ```tsx
 * import { ShellSelectorHooksOptional } from "./use-shell-selectors"
 *
 * function MaybeShellChild() {
 *   const inContent = ShellSelectorHooksOptional.useOptionalIsShellContent()
 *   if (inContent === null) return null
 *   return inContent ? <span>In content</span> : null
 * }
 * ```
 */

/**
 * Applies a canonical selector to strict shell metadata from {@link useShellMetadata}.
 * Prefer the named hooks below for a stable public API; use this when composing a custom selector.
 */
export function useShellSelector<T>(selector: (m: ShellMetadata) => T): T {
  return selector(useShellMetadataStrict())
}

/**
 * Applies a canonical selector to optional shell metadata (same boundary as {@link useOptionalShellMetadata}).
 * Returns `null` when `ShellProvider` is not mounted (no throw).
 */
export function useOptionalShellSelector<T>(
  selector: (m: ShellMetadata) => T
): T | null {
  const metadata = useShellMetadataContextValueTyped()
  if (metadata === null) return null
  return selector(metadata)
}

/** True when the active shell zone is content. */
export function useIsShellContent(): boolean {
  return useShellSelector(isShellContent)
}

/**
 * True when the surface is in overlay mode: overlay zone or `inOverlay` on metadata
 * (see {@link isShellOverlay}).
 */
export function useIsShellOverlay(): boolean {
  return useShellSelector(isShellOverlay)
}

/** True when shell navigation chrome is collapsed. */
export function useIsShellNavigationCollapsed(): boolean {
  return useShellSelector(isShellNavigationCollapsed)
}

/** True when global shell command infrastructure is available. */
export function useIsShellCommandEnabled(): boolean {
  return useShellSelector(isShellCommandEnabled)
}

/** True when shell density is compact. */
export function useIsCompactShellDensity(): boolean {
  return useShellSelector(isCompactShellDensity)
}

/** True when the viewport bucket is mobile. */
export function useIsMobileShellViewport(): boolean {
  return useShellSelector(isMobileShellViewport)
}

/** True when the viewport bucket is desktop. */
export function useIsDesktopShellViewport(): boolean {
  return useShellSelector(isDesktopShellViewport)
}

/** True when the viewport bucket is wide. */
export function useIsWideShellViewport(): boolean {
  return useShellSelector(isWideShellViewport)
}

/** Like {@link useIsShellContent}, but returns `null` if `ShellProvider` is absent. */
export function useOptionalIsShellContent(): boolean | null {
  return useOptionalShellSelector(isShellContent)
}

/** Like {@link useIsShellOverlay}, but returns `null` if `ShellProvider` is absent. */
export function useOptionalIsShellOverlay(): boolean | null {
  return useOptionalShellSelector(isShellOverlay)
}

/** Like {@link useIsShellNavigationCollapsed}, but returns `null` if `ShellProvider` is absent. */
export function useOptionalIsShellNavigationCollapsed(): boolean | null {
  return useOptionalShellSelector(isShellNavigationCollapsed)
}

/** Like {@link useIsShellCommandEnabled}, but returns `null` if `ShellProvider` is absent. */
export function useOptionalIsShellCommandEnabled(): boolean | null {
  return useOptionalShellSelector(isShellCommandEnabled)
}

/** Like {@link useIsCompactShellDensity}, but returns `null` if `ShellProvider` is absent. */
export function useOptionalIsCompactShellDensity(): boolean | null {
  return useOptionalShellSelector(isCompactShellDensity)
}

/** Like {@link useIsMobileShellViewport}, but returns `null` if `ShellProvider` is absent. */
export function useOptionalIsMobileShellViewport(): boolean | null {
  return useOptionalShellSelector(isMobileShellViewport)
}

/** Like {@link useIsDesktopShellViewport}, but returns `null` if `ShellProvider` is absent. */
export function useOptionalIsDesktopShellViewport(): boolean | null {
  return useOptionalShellSelector(isDesktopShellViewport)
}

/** Like {@link useIsWideShellViewport}, but returns `null` if `ShellProvider` is absent. */
export function useOptionalIsWideShellViewport(): boolean | null {
  return useOptionalShellSelector(isWideShellViewport)
}

/** Namespace-style bundle for strict selector hooks (same behavior as named exports). */
export type ShellSelectorHooksApi = Readonly<{
  useIsShellContent: () => boolean
  useIsShellOverlay: () => boolean
  useIsShellNavigationCollapsed: () => boolean
  useIsShellCommandEnabled: () => boolean
  useIsCompactShellDensity: () => boolean
  useIsMobileShellViewport: () => boolean
  useIsDesktopShellViewport: () => boolean
  useIsWideShellViewport: () => boolean
}>

/**
 * Frozen alias for discoverability and autocomplete (`ShellSelectorHooks.useIsShellContent`, etc.).
 * Named exports remain preferred for clarity and tree-shaking.
 */
export const ShellSelectorHooks: ShellSelectorHooksApi = Object.freeze({
  useIsShellContent,
  useIsShellOverlay,
  useIsShellNavigationCollapsed,
  useIsShellCommandEnabled,
  useIsCompactShellDensity,
  useIsMobileShellViewport,
  useIsDesktopShellViewport,
  useIsWideShellViewport,
})

/** Namespace-style bundle for optional selector hooks (`null` when provider is missing). */
export type ShellSelectorOptionalHooksApi = Readonly<{
  useOptionalIsShellContent: () => boolean | null
  useOptionalIsShellOverlay: () => boolean | null
  useOptionalIsShellNavigationCollapsed: () => boolean | null
  useOptionalIsShellCommandEnabled: () => boolean | null
  useOptionalIsCompactShellDensity: () => boolean | null
  useOptionalIsMobileShellViewport: () => boolean | null
  useOptionalIsDesktopShellViewport: () => boolean | null
  useOptionalIsWideShellViewport: () => boolean | null
}>

/**
 * Frozen alias for optional selector hooks (safe when `ShellProvider` may be absent).
 * Named exports remain preferred for clarity and tree-shaking.
 */
export const ShellSelectorHooksOptional: ShellSelectorOptionalHooksApi =
  Object.freeze({
    useOptionalIsShellContent,
    useOptionalIsShellOverlay,
    useOptionalIsShellNavigationCollapsed,
    useOptionalIsShellCommandEnabled,
    useOptionalIsCompactShellDensity,
    useOptionalIsMobileShellViewport,
    useOptionalIsDesktopShellViewport,
    useOptionalIsWideShellViewport,
  })
