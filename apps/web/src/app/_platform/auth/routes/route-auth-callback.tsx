import { Navigate } from "react-router-dom"

import { authPostLoginPath } from "../auth-redirect-urls"

/**
 * OAuth completion surface. Magic-link sign-in uses the `callbackURL` passed to
 * `signIn.magicLink` (we use `authAppCallbackUrl()` → `/app`), not this path unless you configure it.
 * This route exists for explicit `/auth/callback` wiring when needed.
 */
export function RouteAuthCallback() {
  return <Navigate to={authPostLoginPath(undefined)} replace />
}
