import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { AppBootstrapLoading } from "@/app/_components/app-states/app-bootstrap-loading"

import { AUTH_ROUTES } from "../auth-paths"
import { createAuthReturnTarget } from "../contracts/auth-return-target"
import { useAuthSetupState } from "../hooks/use-auth-setup-state"
import { SETUP_ROUTES } from "../setup-paths"

type RequireAppReadyProps = {
  readonly children: ReactNode
}

/**
 * Blocks `/app/*` until the authenticated user has an active organization context.
 */
export function RequireAppReady(props: RequireAppReadyProps) {
  const { children } = props
  const location = useLocation()
  const { state, isPending } = useAuthSetupState()

  if (isPending) {
    return <AppBootstrapLoading />
  }

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
