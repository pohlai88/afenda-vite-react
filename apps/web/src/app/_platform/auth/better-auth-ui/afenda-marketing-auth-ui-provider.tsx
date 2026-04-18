import { AuthProvider } from "@/share/components/auth/auth-provider"
import type { ReactNode } from "react"

import { useAfendaAuthUiProviderProps } from "./use-afenda-auth-ui-config"

/**
 * Better Auth UI context for public marketing routes (`/auth/*`).
 * Config matches [start-shadcn-example Providers](https://github.com/better-auth-ui/better-auth-ui/tree/main/examples/start-shadcn-example)
 * (appearance, plugins, deleteUser, optional OAuth). Requires {@link next-themes} (`MarketingThemeProvider`).
 */
export function AfendaMarketingAuthUiProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const config = useAfendaAuthUiProviderProps()

  return <AuthProvider {...config}>{children}</AuthProvider>
}
