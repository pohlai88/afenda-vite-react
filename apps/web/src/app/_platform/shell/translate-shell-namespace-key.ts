/**
 * Single choke point for passing runtime `labelKey` strings from shell metadata
 * into react-i18next's typed `t` for the `shell` namespace.
 */

import type { TFunction } from "i18next"

export function translateShellNamespaceKey(
  t: TFunction<"shell">,
  labelKey: string
): string {
  return t(labelKey as never)
}
