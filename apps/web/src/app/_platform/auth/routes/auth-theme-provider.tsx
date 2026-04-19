import type { ReactNode } from "react"

import { PublicThemeProvider } from "../../theme/public-theme-provider"

export interface AuthThemeProviderProps {
  readonly children: ReactNode
}

/**
 * Theme boundary for the standalone auth surface.
 *
 * Auth remains separate from marketing composition while sharing the same
 * public theme persistence contract as other non-`/app` routes.
 */
export function AuthThemeProvider(props: AuthThemeProviderProps) {
  const { children } = props

  return <PublicThemeProvider>{children}</PublicThemeProvider>
}
