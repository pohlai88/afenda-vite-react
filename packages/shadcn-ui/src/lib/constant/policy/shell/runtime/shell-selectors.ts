import type { ShellMetadata } from "../contract/shell-metadata-contract"

/**
 * GOVERNANCE HELPERS — shell-selectors
 * Approved selector helpers for canonical shell metadata consumption.
 * Scope: provides stable, typed accessors over the reviewed shell metadata contract.
 * Authority: shell-aware consumers should prefer these helpers over repeated local string comparisons.
 * Purpose: reduce vocabulary drift, improve readability, and centralize shell semantics.
 *
 * @example Direct imports (preferred for tree-shaking)
 * ```ts
 * import { isShellContent, isShellZone } from "./shell-selectors"
 *
 * const inContent = isShellContent(metadata)
 * const inSidebar = isShellZone(metadata, "sidebar")
 * ```
 *
 * @example Namespace-style access (autocomplete / discoverability)
 * ```ts
 * import { ShellSelectors } from "./shell-selectors"
 *
 * const inContent = ShellSelectors.isShellContent(metadata)
 * const inSidebar = ShellSelectors.isShellZone(metadata, "sidebar")
 * ```
 */

/** Returns true when `metadata.zone` strictly equals the given zone. */
export function isShellZone(
  metadata: ShellMetadata,
  zone: ShellMetadata["zone"]
): boolean {
  return metadata.zone === zone
}

/** Convenience: true when zone is `"root"`. */
export function isShellRoot(metadata: ShellMetadata): boolean {
  return isShellZone(metadata, "root")
}

/** Convenience: true when zone is `"header"`. */
export function isShellHeader(metadata: ShellMetadata): boolean {
  return isShellZone(metadata, "header")
}

/** Convenience: true when zone is `"sidebar"`. */
export function isShellSidebar(metadata: ShellMetadata): boolean {
  return isShellZone(metadata, "sidebar")
}

/** Convenience: true when zone is `"content"`. */
export function isShellContent(metadata: ShellMetadata): boolean {
  return isShellZone(metadata, "content")
}

/** Convenience: true when zone is `"panel"`. */
export function isShellPanel(metadata: ShellMetadata): boolean {
  return isShellZone(metadata, "panel")
}

/**
 * True when the surface is in the overlay zone or `inOverlay` is set
 * (overlay layer semantics; not only `zone === "overlay"`).
 */
export function isShellOverlay(metadata: ShellMetadata): boolean {
  return isShellZone(metadata, "overlay") || metadata.inOverlay
}

/** Convenience: true when zone is `"command"`. */
export function isShellCommandSurface(metadata: ShellMetadata): boolean {
  return isShellZone(metadata, "command")
}

/** Returns true when `metadata.density` equals the given density. */
export function isShellDensity(
  metadata: ShellMetadata,
  density: ShellMetadata["density"]
): boolean {
  return metadata.density === density
}

/** Convenience: density is `"compact"`. */
export function isCompactShellDensity(metadata: ShellMetadata): boolean {
  return isShellDensity(metadata, "compact")
}

/** Convenience: density is `"comfortable"`. */
export function isComfortableShellDensity(metadata: ShellMetadata): boolean {
  return isShellDensity(metadata, "comfortable")
}

/** Convenience: density is `"spacious"`. */
export function isSpaciousShellDensity(metadata: ShellMetadata): boolean {
  return isShellDensity(metadata, "spacious")
}

/** Returns true when `metadata.navigationState` equals the given state. */
export function isShellNavigationState(
  metadata: ShellMetadata,
  state: ShellMetadata["navigationState"]
): boolean {
  return metadata.navigationState === state
}

/** Convenience: navigation is expanded. */
export function isShellNavigationExpanded(metadata: ShellMetadata): boolean {
  return isShellNavigationState(metadata, "expanded")
}

/** Convenience: navigation is collapsed. */
export function isShellNavigationCollapsed(metadata: ShellMetadata): boolean {
  return isShellNavigationState(metadata, "collapsed")
}

/** Convenience: navigation is hidden. */
export function isShellNavigationHidden(metadata: ShellMetadata): boolean {
  return isShellNavigationState(metadata, "hidden")
}

/** True when global shell command infrastructure is available (`enabled`). */
export function isShellCommandEnabled(metadata: ShellMetadata): boolean {
  return metadata.commandAvailability === "enabled"
}

/** Returns true when `metadata.viewport` equals the given viewport bucket. */
export function isShellViewport(
  metadata: ShellMetadata,
  viewport: ShellMetadata["viewport"]
): boolean {
  return metadata.viewport === viewport
}

/** Convenience: viewport is `"mobile"`. */
export function isMobileShellViewport(metadata: ShellMetadata): boolean {
  return isShellViewport(metadata, "mobile")
}

/** Convenience: viewport is `"tablet"`. */
export function isTabletShellViewport(metadata: ShellMetadata): boolean {
  return isShellViewport(metadata, "tablet")
}

/** Convenience: viewport is `"desktop"`. */
export function isDesktopShellViewport(metadata: ShellMetadata): boolean {
  return isShellViewport(metadata, "desktop")
}

/** Convenience: viewport is `"wide"`. */
export function isWideShellViewport(metadata: ShellMetadata): boolean {
  return isShellViewport(metadata, "wide")
}

/**
 * Frozen alias for discoverability and autocomplete (`ShellSelectors.isShellZone`, etc.).
 * Named exports remain preferred for clarity and tree-shaking.
 */
export const ShellSelectors = Object.freeze({
  isShellZone,
  isShellRoot,
  isShellHeader,
  isShellSidebar,
  isShellContent,
  isShellPanel,
  isShellOverlay,
  isShellCommandSurface,
  isShellDensity,
  isCompactShellDensity,
  isComfortableShellDensity,
  isSpaciousShellDensity,
  isShellNavigationState,
  isShellNavigationExpanded,
  isShellNavigationCollapsed,
  isShellNavigationHidden,
  isShellCommandEnabled,
  isShellViewport,
  isMobileShellViewport,
  isTabletShellViewport,
  isDesktopShellViewport,
  isWideShellViewport,
})
