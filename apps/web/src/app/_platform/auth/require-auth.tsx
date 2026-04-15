import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { AppBootstrapLoading } from "../../_components/app-states/app-bootstrap-loading"

import { useAfendaSession } from "."

type RequireAuthProps = {
  readonly children: ReactNode
}

/**
 * Protects `/app/*`: waits for Better Auth session, redirects to `/login` when unauthenticated.
 */
export function RequireAuth(props: RequireAuthProps) {
  const { children } = props
  const { data, isPending } = useAfendaSession()
  const location = useLocation()

  if (isPending) {
    return <AppBootstrapLoading />
  }

  if (!data?.session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
