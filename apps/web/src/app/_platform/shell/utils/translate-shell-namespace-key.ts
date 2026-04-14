/**
 * Single choke point for passing runtime `labelKey` strings from shell metadata
 * into react-i18next's typed `t` for the `shell` namespace.
 */

import type { TFunction } from "i18next"

import type { ShellNavSidebarSubLabelKey } from "../types/shell-i18n-keys"

export function translateShellNamespaceKey(
  t: TFunction<"shell">,
  labelKey: string
): string {
  return t(labelKey as never)
}

/** Sub-nav labels from `shellSidebarFeatureSubNav` — typed keys, no render-time cast. */
export function translateShellSidebarSubNavLabel(
  t: TFunction<"shell">,
  labelKey: ShellNavSidebarSubLabelKey
): string {
  return t(labelKey)
}
