"use client"

import { AlertCircle } from "lucide-react"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { AUTH_ROUTES, authClient } from "../../auth"
import { useOptionalTenantScope } from "../../tenant"

export type ShellTenantScopeBannerProps = {
  readonly focusMode?: boolean
}

/**
 * Surfaces `GET /v1/me` / tenant-scope failures above shell content (session exists but scope did not load).
 * Safe without {@link TenantScopeProvider}: renders nothing.
 */
export function ShellTenantScopeBanner(props: ShellTenantScopeBannerProps) {
  const { focusMode = false } = props
  const { t } = useTranslation("shell")
  const navigate = useNavigate()
  const scope = useOptionalTenantScope()

  const handleSignOut = useCallback(() => {
    void (async () => {
      await authClient.signOut()
      navigate(AUTH_ROUTES.login, { replace: true })
    })()
  }, [navigate])

  /**
   * Static `t("…")` references for the i18n policy scanner (keys are also composed at runtime from `kind`).
   * Dead branch — never executed.
   */
  if (false) {
    t("states.tenant_scope.hint_status", { status: "0" })
    t("states.tenant_scope.retry")
    t("states.tenant_scope.sign_out")
    t("states.tenant_scope.api_session.title")
    t("states.tenant_scope.api_session.body", { status: "0" })
    t("states.tenant_scope.identity_bridge.title")
    t("states.tenant_scope.identity_bridge.body", { status: "0" })
    t("states.tenant_scope.forbidden.title")
    t("states.tenant_scope.forbidden.body", { status: "0" })
    t("states.tenant_scope.api_unavailable.title")
    t("states.tenant_scope.api_unavailable.body", { status: "0" })
    t("states.tenant_scope.network.title")
    t("states.tenant_scope.network.body")
    t("states.tenant_scope.unknown.title")
    t("states.tenant_scope.unknown.body", { status: "0" })
  }

  if (scope === null || scope.status !== "error") {
    return null
  }

  const { kind, httpStatus, retry } = scope

  const titleKey = `states.tenant_scope.${kind}.title` as const
  const bodyKey = `states.tenant_scope.${kind}.body` as const
  const bodyParams =
    kind === "network"
      ? {}
      : { status: String(httpStatus ?? "—") }

  return (
    <div
      data-slot="shell.tenant-scope-banner"
      data-testid="shell-tenant-scope-banner"
      className={cn(
        "shrink-0 border-b border-destructive/30 bg-destructive/5 px-3 py-2 sm:px-4",
        focusMode && "px-3 py-1.5 sm:px-4"
      )}
    >
      <Alert variant="destructive" className="border-destructive/40">
        <AlertCircle className="size-4" aria-hidden />
        <AlertTitle>{t(titleKey)}</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{t(bodyKey, bodyParams)}</p>
          {import.meta.env.DEV && httpStatus !== undefined ? (
            <p
              className="font-mono text-xs text-muted-foreground"
              data-testid="shell-tenant-scope-http-hint"
            >
              {t("states.tenant_scope.hint_status", { status: httpStatus })}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-[0.5rem] pt-1">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => retry()}
            >
              {t("states.tenant_scope.retry")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSignOut}
            >
              {t("states.tenant_scope.sign_out")}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
