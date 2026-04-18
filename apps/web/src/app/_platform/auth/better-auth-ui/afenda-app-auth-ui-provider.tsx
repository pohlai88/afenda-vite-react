import { AuthProvider } from "@/share/components/auth/auth-provider"
import type { ReactNode } from "react"

import { useAfendaAuthUiProviderProps } from "./use-afenda-auth-ui-config"

/**
 * Same Better Auth UI context as marketing, for `/app/*` so hooks and future settings views work
 * inside the signed-in shell (see start-shadcn-example dashboard + settings).
 */
export function AfendaAppAuthUiProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const config = useAfendaAuthUiProviderProps()

  return <AuthProvider {...config}>{children}</AuthProvider>
}
