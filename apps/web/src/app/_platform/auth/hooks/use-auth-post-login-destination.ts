import { useLocation } from "react-router-dom"

import { authPostLoginPath } from "../auth-redirect-urls"

/**
 * Resolves the in-app destination after auth or setup using the structured return target
 * captured by the auth guards when present.
 */
export function useAuthPostLoginDestination(): string {
  const location = useLocation()
  return authPostLoginPath(location.state)
}
