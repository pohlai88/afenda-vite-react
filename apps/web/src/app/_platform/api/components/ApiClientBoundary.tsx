import type { ReactNode } from "react"

import { useApiClient } from "../hooks/use-api-client"

export interface ApiClientBoundaryProps {
  readonly children: ReactNode
}

/**
 * Optional composition wrapper: exposes the resolved API base URL for debugging and a11y tree context.
 * Does not fetch; use TanStack Query or direct `useApiClient()` calls inside features.
 */
export function ApiClientBoundary({ children }: ApiClientBoundaryProps) {
  const client = useApiClient()
  const label =
    client.config.baseUrl === ""
      ? "Afenda API (same origin)"
      : `Afenda API (${client.config.baseUrl})`

  return (
    <section
      aria-label={label}
      className="contents"
      data-platform-capability="api"
      data-api-base={client.config.baseUrl || "same-origin"}
    >
      {children}
    </section>
  )
}
