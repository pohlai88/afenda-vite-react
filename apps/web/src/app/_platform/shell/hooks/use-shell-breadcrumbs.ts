/**
 * SHELL BREADCRUMB HOOK
 *
 * Runtime wiring only: pathname, `shell` i18n, and governed `ShellMetadata`.
 * Policy stays in `resolveShellBreadcrumbs()`.
 *
 * Flow: route metadata → `useShellMetadata()` → segments → resolver → items.
 */

import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"

import type { ShellBreadcrumbResolvedItem } from "../contract/shell-breadcrumb-contract"
import type { ShellMetadata } from "../contract/shell-metadata-contract"
import { resolveShellBreadcrumbs } from "../services/resolve-shell-breadcrumbs"
import { translateShellNamespaceKey } from "../translate-shell-namespace-key"
import { useShellMetadata } from "./use-shell-metadata"

export function useShellBreadcrumbs(): ShellBreadcrumbResolvedItem[] {
  const { t } = useTranslation("shell")
  const { pathname } = useLocation()
  const shellMetadata: ShellMetadata = useShellMetadata()

  const segments = shellMetadata.breadcrumbs ?? []

  return useMemo(
    () =>
      resolveShellBreadcrumbs({
        pathname,
        segments,
        translate: (labelKey: string) =>
          translateShellNamespaceKey(t, labelKey),
      }),
    [pathname, segments, t]
  )
}
