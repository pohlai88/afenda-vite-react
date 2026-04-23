"use client"

import type { SettingsView } from "@better-auth-ui/react/core"
import { useMemo } from "react"

import "../../_platform/auth/auth.css"

import {
  AppSurface,
  type AppSurfaceContract,
  StateSurface,
} from "@/app/_platform/app-surface"
import { useAfendaSession } from "@/app/_platform/auth"
import { useOptionalTenantScope } from "@/app/_platform/tenant"
import { Settings } from "@/share/components/settings/settings"

export type BetterAuthSettingsViewProps = {
  readonly view: SettingsView
}

function createSettingsSurfaceContract(input: {
  readonly view: SettingsView
  readonly tenantName?: string
  readonly email?: string
}): AppSurfaceContract {
  const isSecurity = input.view === "security"

  return {
    kind: "workspace",
    header: {
      kicker: isSecurity ? "Security settings" : "Account settings",
      title: isSecurity ? "Security & sessions" : "Account preferences",
      description: isSecurity
        ? "Review passwords, linked providers, passkeys, active sessions, and destructive controls without leaving the authenticated shell."
        : "Manage identity details, sign-in address, workspace-facing profile state, and linked account continuity from one governed surface.",
    },
    metaRow:
      input.tenantName || input.email
        ? {
            items: [
              ...(input.tenantName
                ? [
                    {
                      id: "tenant",
                      label: "Tenant",
                      value: input.tenantName,
                    },
                  ]
                : []),
              ...(input.email
                ? [
                    {
                      id: "identity",
                      label: "Identity",
                      value: input.email,
                    },
                  ]
                : []),
            ],
          }
        : undefined,
    content: {
      sections: [{ id: "settings-navigation" }, { id: "settings-content" }],
    },
    stateSurface: {
      loading: {
        title: isSecurity
          ? "Loading security settings"
          : "Loading account settings",
        description:
          "Please wait while Afenda verifies session state and assembles this settings surface.",
      },
      empty: {
        title: "Settings surface unavailable",
        description:
          "This settings surface is available, but no governed content was returned.",
      },
      failure: {
        title: isSecurity
          ? "Security settings unavailable"
          : "Account settings unavailable",
        description:
          "Afenda could not load this authenticated settings surface right now.",
      },
      forbidden: {
        title: "Settings unavailable",
        description:
          "This authenticated settings surface is not available in the current session context.",
      },
    },
  }
}

/**
 * Authenticated Better Auth UI settings shell (account + security tabs), matching
 * [start-shadcn-example `/settings/$path`](https://github.com/better-auth-ui/better-auth-ui/tree/main/examples/start-shadcn-example).
 */
export function BetterAuthSettingsView({ view }: BetterAuthSettingsViewProps) {
  const session = useAfendaSession()
  const scope = useOptionalTenantScope()
  const tenantName =
    scope?.status === "ready"
      ? (scope.me.tenant?.memberships.find(
          (membership) => membership.tenantId === scope.selectedTenantId
        )?.tenantName ?? scope.me.tenant?.memberships[0]?.tenantName)
      : undefined
  const contract = useMemo(
    () =>
      createSettingsSurfaceContract({
        view,
        tenantName,
        email: session.data?.user.email,
      }),
    [tenantName, session.data?.user.email, view]
  )

  if (session.isPending) {
    return (
      <StateSurface
        surfaceKind="workspace"
        kind="loading"
        title={contract.stateSurface.loading.title}
        description={contract.stateSurface.loading.description}
      />
    )
  }

  if (!session.data?.session) {
    return (
      <StateSurface
        surfaceKind="workspace"
        kind="forbidden"
        title={contract.stateSurface.forbidden.title}
        description={contract.stateSurface.forbidden.description}
      />
    )
  }

  return (
    <AppSurface contract={contract}>
      <Settings view={view} embedded className="auth-settings-page" />
    </AppSurface>
  )
}
