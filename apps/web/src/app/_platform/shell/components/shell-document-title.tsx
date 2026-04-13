import { useEffect } from "react"
import { useTranslation } from "react-i18next"

import { useShellTitle } from "../hooks/use-shell-title"

const DEFAULT_DOCUMENT_TITLE = "afenda-react-vite"

/**
 * Syncs `document.title` with `ShellMetadata.titleKey` via `useShellTitle()` (same contract as breadcrumbs).
 * Resets to the HTML default when the app shell layout unmounts (e.g. navigation to `/`).
 */
export function ShellDocumentTitle() {
  const shellTitle = useShellTitle()
  const { t } = useTranslation("shell")
  const brand = t("sidebar.brand")

  useEffect(() => {
    document.title = shellTitle ? `${shellTitle} · ${brand}` : brand
  }, [brand, shellTitle])

  useEffect(() => {
    return () => {
      document.title = DEFAULT_DOCUMENT_TITLE
    }
  }, [])

  return null
}
