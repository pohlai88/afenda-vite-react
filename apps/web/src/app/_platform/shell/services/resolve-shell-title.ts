/**
 * RESOLVE SHELL TITLE
 *
 * Pure shell title resolver.
 * Converts shell metadata title keys into final display text through the
 * supplied translation function.
 *
 * Rules:
 * - missing titleKey resolves to undefined
 * - blank titleKey resolves to undefined
 * - translation is delegated to the caller
 */

import type { ShellMetadata } from "../contract/shell-metadata-contract"

export interface ResolveShellTitleOptions {
  metadata: ShellMetadata
  translate: (labelKey: string) => string
}

export function resolveShellTitle(
  options: ResolveShellTitleOptions
): string | undefined {
  const titleKey = options.metadata.titleKey?.trim()

  if (!titleKey) {
    return undefined
  }

  return options.translate(titleKey)
}
