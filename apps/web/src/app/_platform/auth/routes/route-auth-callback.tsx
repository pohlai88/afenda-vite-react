import { Navigate } from "react-router-dom"

import { authPostLoginPath } from "../auth-redirect-urls"

/**
 * OAuth / magic-link completion surface. Better Auth typically lands on `authAppCallbackUrl()` (`/app`);
 * this route exists for explicit `/auth/callback` wiring when needed.
 */
export function RouteAuthCallback() {
  return <Navigate to={authPostLoginPath(undefined)} replace />
}
