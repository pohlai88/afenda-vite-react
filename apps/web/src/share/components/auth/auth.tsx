import { useAuth } from "@better-auth-ui/react"
import type { AuthView } from "@better-auth-ui/react/core"

import { AuthExperienceShell } from "./auth-experience-shell"
import { ForgotPassword } from "./forgot-password"
import { MagicLink } from "./magic-link"
import type { SocialLayout } from "./provider-buttons"
import { ResetPassword } from "./reset-password"
import { SignIn } from "./sign-in"
import { SignOut } from "./sign-out"
import { SignUp } from "./sign-up"

export type AuthProps = {
  className?: string
  path?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  /** @remarks `AuthView` */
  view?: AuthView
}

/**
 * Render the selected authentication view component.
 *
 * The view is determined by the explicit `view` prop or, if absent, resolved from `path` using the application's auth view paths.
 *
 * @param path - Route path used to resolve an auth view when `view` is not provided
 * @param socialLayout - Social layout to apply to the component
 * @param socialPosition - Social position to apply to the component
 * @param view - Explicit auth view to render (e.g., "signIn", "signUp")
 * @returns The rendered authentication view element
 * @throws Error if neither `view` nor `path` is provided
 * @throws Error if the resolved view is not a valid auth view
 */
export function Auth({
  className,
  view,
  path,
  socialLayout,
  socialPosition,
}: AuthProps) {
  const { viewPaths } = useAuth()

  if (!view && !path) {
    throw new Error("[Better Auth UI] Either `view` or `path` must be provided")
  }

  const authPathViews = Object.fromEntries(
    Object.entries(viewPaths.auth).map(([k, v]) => [v, k])
  ) as Record<string, AuthView>

  const currentView = view || (path ? authPathViews[path] : undefined)

  let content: React.ReactNode

  switch (currentView) {
    case "signIn":
      content = (
        <SignIn
          className={className}
          socialLayout={socialLayout}
          socialPosition={socialPosition}
        />
      )
      break
    case "signUp":
      content = (
        <SignUp
          className={className}
          socialLayout={socialLayout}
          socialPosition={socialPosition}
        />
      )
      break
    case "magicLink":
      content = (
        <MagicLink
          className={className}
          socialLayout={socialLayout}
          socialPosition={socialPosition}
        />
      )
      break
    case "forgotPassword":
      content = <ForgotPassword className={className} />
      break
    case "resetPassword":
      content = <ResetPassword className={className} />
      break
    case "signOut":
      content = <SignOut className={className} />
      break
    default:
      throw new Error(
        `[Better Auth UI] Valid views are: ${Object.keys(viewPaths.auth).join(", ")}`
      )
  }

  return <AuthExperienceShell view={currentView}>{content}</AuthExperienceShell>
}
