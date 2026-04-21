"use client"

import type { SettingsView } from "@better-auth-ui/react/core"

import "../../_platform/auth/auth.css"

import { Settings } from "@/share/components/settings/settings"

export type BetterAuthSettingsViewProps = {
  readonly view: SettingsView
}

/**
 * Authenticated Better Auth UI settings shell (account + security tabs), matching
 * [start-shadcn-example `/settings/$path`](https://github.com/better-auth-ui/better-auth-ui/tree/main/examples/start-shadcn-example).
 */
export function BetterAuthSettingsView({ view }: BetterAuthSettingsViewProps) {
  return <Settings view={view} className="auth-settings-page" />
}
