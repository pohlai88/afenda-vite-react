import { useAuth } from "@better-auth-ui/react"

import { authOrganizationClient, useAfendaSession } from "../auth-client"
import {
  resolveSetupState,
  type SetupState,
} from "../contracts/auth-setup-state"

export interface UseAuthSetupStateResult {
  readonly state: SetupState
  readonly isPending: boolean
}

export function useAuthSetupState(): UseAuthSetupStateResult {
  const sessionQuery = useAfendaSession()
  const activeOrganizationQuery = authOrganizationClient.useActiveOrganization()
  const { username } = useAuth()

  const isAuthenticated = Boolean(sessionQuery.data?.session)
  const hasActiveOrganization = Boolean(activeOrganizationQuery.data)

  return {
    state: resolveSetupState(
      {
        isAuthenticated,
        hasActiveOrganization,
        user: sessionQuery.data?.user,
      },
      {
        requireUsername: username?.enabled,
        useDisplayUsername: username?.displayUsername,
      }
    ),
    isPending:
      sessionQuery.isPending ||
      (isAuthenticated && activeOrganizationQuery.isPending),
  }
}
