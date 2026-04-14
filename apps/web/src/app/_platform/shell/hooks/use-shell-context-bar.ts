import { useMemo } from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"

import type { ShellContextBarResolvedModel } from "../contract/shell-context-bar-contract"
import { resolveShellContextBar } from "../services/resolve-shell-context-bar"
import { translateShellNamespaceKey } from "../utils/translate-shell-namespace-key"
import { useShellMetadata } from "./use-shell-metadata"

export function useShellContextBar(): ShellContextBarResolvedModel | undefined {
  const metadata = useShellMetadata()
  const { pathname } = useLocation()
  const { t } = useTranslation("shell")

  return useMemo(() => {
    if (metadata.contextBar === undefined) {
      return undefined
    }

    return resolveShellContextBar({
      contextBar: metadata.contextBar,
      pathname,
      translate: (labelKey) => translateShellNamespaceKey(t, labelKey),
    })
  }, [metadata.contextBar, pathname, t])
}
