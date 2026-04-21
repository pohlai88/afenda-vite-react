/**
 * SHELL HEADER ACTIONS HOOK
 *
 * Runtime integration hook for resolved shell header actions.
 * Consumes governed shell metadata and resolves translated, render-ready actions.
 */

import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import type { ShellHeaderActionResolvedItem } from "../contract/shell-header-action-contract"
import { resolveShellHeaderActions } from "../services/resolve-shell-header-actions"
import { translateShellNamespaceKey } from "../translate-shell-namespace-key"
import { useShellMetadata } from "./use-shell-metadata"

export function useShellHeaderActions(): ShellHeaderActionResolvedItem[] {
  const { t } = useTranslation("shell")
  const metadata = useShellMetadata()

  return useMemo(
    () =>
      resolveShellHeaderActions({
        actions: metadata.headerActions ?? [],
        translate: (labelKey) => translateShellNamespaceKey(t, labelKey),
      }),
    [metadata, t]
  )
}
