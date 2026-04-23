import type { ReactNode } from "react"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, useLocation } from "react-router-dom"

import { AppBootstrapLoading } from "@/app/_components/app-states/app-bootstrap-loading"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "@afenda/design-system/ui-primitives"

import { AUTH_ROUTES } from "../auth-paths"
import { authClient } from "../auth-client"
import { createAuthReturnTarget } from "../contracts/auth-return-target"
import { SETUP_ROUTES } from "../setup-paths"
import { useTenantScope } from "../../tenant"

type RequireAppReadyProps = {
  readonly children: ReactNode
}

function AppTenantScopeFailure() {
  const { t } = useTranslation("shell")
  const scope = useTenantScope()

  const handleSignOut = useCallback(() => {
    void authClient.signOut()
  }, [])

  if (scope.status !== "error") {
    return <AppBootstrapLoading />
  }

  const titleKey = `states.tenant_scope.${scope.kind}.title` as const
  const bodyKey = `states.tenant_scope.${scope.kind}.body` as const
  const bodyParams =
    scope.kind === "network" ? {} : { status: String(scope.httpStatus ?? "—") }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 py-8">
      <section className="ui-page ui-stack-relaxed max-w-lg" role="alert">
        <Alert variant="destructive" className="border-destructive/40">
          <AlertTitle>{t(titleKey)}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{t(bodyKey, bodyParams)}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={scope.retry}>
                {t("states.tenant_scope.retry")}
              </Button>
              <Button type="button" variant="outline" onClick={handleSignOut}>
                {t("states.tenant_scope.sign_out")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </section>
    </div>
  )
}

/**
 * Blocks `/app/*` until the authenticated user has an active organization context.
 */
export function RequireAppReady(props: RequireAppReadyProps) {
  const { children } = props
  const location = useLocation()
  const scope = useTenantScope()

  if (scope.status === "idle" || scope.status === "loading") {
    return <AppBootstrapLoading />
  }

  if (scope.status === "error") {
    return <AppTenantScopeFailure />
  }

  const state = scope.me.setup?.state ?? "workspace_required"

  if (state === "auth") {
    return (
      <Navigate
        to={AUTH_ROUTES.login}
        replace
        state={{
          returnTarget: createAuthReturnTarget(
            location.pathname,
            location.search,
            location.hash
          ),
        }}
      />
    )
  }

  if (state === "workspace_required") {
    return (
      <Navigate
        to={SETUP_ROUTES.workspace}
        replace
        state={{
          returnTarget: createAuthReturnTarget(
            location.pathname,
            location.search,
            location.hash
          ),
        }}
      />
    )
  }

  return <>{children}</>
}
