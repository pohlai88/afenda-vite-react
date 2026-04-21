import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { AppBootstrapLoading } from "@/app/_components/app-states/app-bootstrap-loading"

import { AUTH_ROUTES } from "../auth-paths"
import { createAuthReturnTarget } from "../contracts/auth-return-target"
import { useAuthPostLoginDestination } from "../hooks/use-auth-post-login-destination"
import { useAuthSetupState } from "../hooks/use-auth-setup-state"
import { SETUP_ROUTES } from "../setup-paths"

type SetupRouteMode = "index" | "workspace" | "profile"

type RequireSetupRouteProps = {
  readonly children?: ReactNode
  readonly mode: SetupRouteMode
}

/**
 * Resolves the standalone `/setup/*` subtree from auth + workspace truth.
 */
export function RequireSetupRoute(props: RequireSetupRouteProps) {
  const { children = null, mode } = props
  const location = useLocation()
  const { state, isPending } = useAuthSetupState()
  const appDestination = useAuthPostLoginDestination()

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

  if (mode === "index") {
    if (state === "workspace_required") {
      return (
        <Navigate to={SETUP_ROUTES.workspace} replace state={location.state} />
      )
    }

    if (state === "profile_recommended") {
      return (
        <Navigate to={SETUP_ROUTES.profile} replace state={location.state} />
      )
    }

    return <Navigate to={appDestination} replace state={location.state} />
  }

  if (mode === "workspace") {
    if (state === "workspace_required") {
      return <>{children}</>
    }

    if (state === "profile_recommended") {
      return (
        <Navigate to={SETUP_ROUTES.profile} replace state={location.state} />
      )
    }

    return <Navigate to={appDestination} replace state={location.state} />
  }

  if (state === "workspace_required") {
    return (
      <Navigate to={SETUP_ROUTES.workspace} replace state={location.state} />
    )
  }

  return <>{children}</>
}
