import { AuthProvider } from "@/share/components/auth/auth-provider"
import type { ReactNode } from "react"

import { useAfendaAuthUiProviderProps } from "./use-afenda-auth-ui-config"

/**
 * Better Auth UI context for the standalone public auth surface (`/auth/*`).
 */
export function AfendaPublicAuthUiProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const config = useAfendaAuthUiProviderProps()

  return <AuthProvider {...config}>{children}</AuthProvider>
}
