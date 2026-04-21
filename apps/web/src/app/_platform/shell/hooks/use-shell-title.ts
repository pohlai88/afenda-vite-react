/**
 * SHELL TITLE HOOK
 *
 * Runtime shell title hook.
 * Reads governed shell metadata and resolves the current shell title through
 * the `shell` translation namespace.
 */

import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { resolveShellTitle } from "../services/resolve-shell-title"
import { translateShellNamespaceKey } from "../translate-shell-namespace-key"
import { useShellMetadata } from "./use-shell-metadata"

export function useShellTitle(): string | undefined {
  const { t } = useTranslation("shell")
  const metadata = useShellMetadata()

  return useMemo(
    () =>
      resolveShellTitle({
        metadata,
        translate: (labelKey) => translateShellNamespaceKey(t, labelKey),
      }),
    [metadata, t]
  )
}
