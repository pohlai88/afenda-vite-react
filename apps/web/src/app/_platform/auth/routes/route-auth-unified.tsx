import type { AuthView } from "@better-auth-ui/react/core"
import { Navigate, useLocation } from "react-router-dom"

import { Auth } from "@/share/components/auth/auth"

import { RequireGuest } from "../guards/require-guest"

const SEGMENT_TO_VIEW: Record<string, AuthView> = {
  login: "signIn",
  register: "signUp",
  "magic-link": "magicLink",
  "forgot-password": "forgotPassword",
  "reset-password": "resetPassword",
  "sign-out": "signOut",
}

function authViewFromPathname(pathname: string): AuthView | undefined {
  const normalized = pathname.replace(/\/+$/, "")
  const match = normalized.match(/\/auth\/([^/]+)\/?$/)
  const seg = match?.[1]
  return seg ? SEGMENT_TO_VIEW[seg] : undefined
}

/**
 * Better Auth UI — replaces the legacy Afenda command-center auth screens.
 * Resolves {@link AuthView} from `/auth/:segment` (e.g. `/auth/login` → sign-in).
 */
export function RouteAuthUnified() {
  const { pathname } = useLocation()
  const view = authViewFromPathname(pathname)

  if (!view) {
    return <Navigate to="/" replace />
  }

  return (
    <RequireGuest>
      {/* Center column: `container` without `mx-auto` was left-aligned; avoid opaque main bg (hides marketing-root gradient). */}
      <main className="relative flex min-h-dvh w-full flex-col justify-center px-4 py-10 text-foreground">
        <div className="mx-auto flex w-full max-w-lg justify-center">
          <Auth view={view} />
        </div>
      </main>
    </RequireGuest>
  )
}
