/**
 * SHELL HEADER ACTIONS HOOK
 *
 * Runtime integration hook for shell header actions.
 * Reads governed shell metadata, resolves action descriptors into render-ready
 * items, and keeps shell action policy out of JSX.
 */

import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import type { ShellHeaderActionResolvedItem } from "../contract/shell-header-action-contract"
import { resolveShellHeaderActions } from "../services/resolve-shell-header-actions"
import { translateShellNamespaceKey } from "../utils/translate-shell-namespace-key"
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
    [metadata.headerActions, t]
  )
}
