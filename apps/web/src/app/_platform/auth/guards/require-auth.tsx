import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { AppBootstrapLoading } from "@/app/_components/app-states/app-bootstrap-loading"

import { AUTH_ROUTES } from "../auth-paths"
import { useAfendaSession } from "../auth-client"
import { createAuthReturnTarget } from "../contracts/auth-return-target"

type RequireAuthProps = {
  readonly children: ReactNode
}

/**
 * Protects `/app/*`: waits for Better Auth session, redirects to sign-in
 * with a structured return target when unauthenticated.
 */
export function RequireAuth(props: RequireAuthProps) {
  const { children } = props
  const { data, isPending } = useAfendaSession()
  const location = useLocation()

  if (isPending) {
    return <AppBootstrapLoading />
  }

  if (!data?.session) {
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

  return <>{children}</>
}
