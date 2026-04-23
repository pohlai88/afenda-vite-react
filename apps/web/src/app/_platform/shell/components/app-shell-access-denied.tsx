import { useTranslation } from "react-i18next"

import { useShellPermissions } from "../hooks/use-shell-permissions"
import { resolveShellHomeHref } from "../services/resolve-shell-home-href"

import { AppShellRouteState } from "./app-shell-route-state"

export function AppShellAccessDenied() {
  const { t } = useTranslation("shell")
  const permissions = useShellPermissions()
  const homeHref = resolveShellHomeHref(permissions) ?? "/app"

  return (
    <AppShellRouteState
      stateKind="forbidden"
      stateLabel="Access denied"
      stateTitle={t("states.tenant_scope.forbidden.title")}
      stateDescription="You do not have access to this workspace route."
      homeHref={homeHref}
      homeLabel={t("states.route_error.home")}
    />
  )
}
