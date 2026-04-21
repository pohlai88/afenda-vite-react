import type { ReactNode } from "react"

import { AuthProvider } from "@/share/components/auth/auth-provider"

import { useAfendaAuthUiProviderProps } from "./use-afenda-auth-ui-config"

/**
 * Shared Better Auth UI boundary for all Afenda auth-aware surfaces.
 */
export function AfendaAuthUiProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const config = useAfendaAuthUiProviderProps()

  return <AuthProvider {...config}>{children}</AuthProvider>
}
