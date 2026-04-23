import { useTranslation } from "react-i18next"

import { useShellPermissions } from "../hooks/use-shell-permissions"
import { useShellTitle } from "../hooks/use-shell-title"
import { resolveShellHomeHref } from "../services/resolve-shell-home-href"
import { AppShellRouteState } from "./app-shell-route-state"

/**
 * Shell-scoped not-found page for `/app/*`.
 *
 * Drift control:
 * - fallback return destination is centralized
 * - resolved page title is computed once
 * - page remains presentational; route ownership stays outside this file
 */
export function AppShellNotFound() {
  const { t } = useTranslation("shell")
  const shellTitle = useShellTitle()
  const permissions = useShellPermissions()

  const stateTitle = shellTitle ?? t("error.not_found.title")
  const homeHref = resolveShellHomeHref(permissions) ?? "/app"

  return (
    <AppShellRouteState
      stateKind="failure"
      stateLabel="Route not found"
      stateTitle={stateTitle}
      stateDescription={t("error.not_found.description")}
      homeHref={homeHref}
      homeLabel={t("error.not_found.link_dashboard")}
    />
  )
}
