import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { AppBootstrapLoading } from "@/app/_components/app-states/app-bootstrap-loading"

import { authClient } from "../auth-client"
import { authPostLoginPath } from "../auth-redirect-urls"
import {
  authReturnTargetToPath,
  normalizeAuthReturnTarget,
} from "../contracts/auth-return-target"

type RequireGuestProps = {
  readonly children: ReactNode
}

export function RequireGuest(props: RequireGuestProps) {
  const { children } = props
  const { data, isPending } = authClient.useSession()
  const location = useLocation()

  if (isPending) {
    return <AppBootstrapLoading />
  }

  if (data?.session) {
    const target = normalizeAuthReturnTarget(
      location.state,
      authPostLoginPath(undefined)
    )

    return <Navigate to={authReturnTargetToPath(target)} replace />
  }

  return <>{children}</>
}
