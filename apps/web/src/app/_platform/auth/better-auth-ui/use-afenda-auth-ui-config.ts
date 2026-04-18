import {
  basePaths,
  defaultAuthConfig,
  viewPaths as bundledViewPaths,
} from "@better-auth-ui/core"
import type { AuthConfig } from "@better-auth-ui/react"
import type { SocialProvider } from "better-auth/social-providers"
import { useTheme } from "next-themes"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { authClient } from "../auth-client"

import { AfendaAuthLink } from "./afenda-auth-link"

function viteBasePath(): string {
  const b = import.meta.env.BASE_URL
  if (b === "/" || b === "") return ""
  return b.endsWith("/") ? b.slice(0, -1) : b
}

/** Afenda routes use `/auth/login` and `/auth/register` instead of `sign-in` / `sign-up`. */
const afendaViewPaths = {
  ...bundledViewPaths,
  auth: {
    ...bundledViewPaths.auth,
    signIn: "login",
    signUp: "register",
  },
}

/**
 * Mirrors the [better-auth-ui start-shadcn-example](https://github.com/better-auth-ui/better-auth-ui/tree/main/examples/start-shadcn-example)
 * `Providers` props: theme appearance, plugin flags aligned with `auth-client.ts`, optional OAuth IDs.
 */
export function useAfendaAuthUiProviderProps() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const allPlugins = import.meta.env.VITE_AFENDA_AUTH_ALL_PLUGINS !== "false"
  const googleId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
  const githubId = import.meta.env.VITE_GITHUB_CLIENT_ID?.trim()

  return useMemo((): AuthConfig => {
    const base = viteBasePath()

    const socialProviders: SocialProvider[] = []
    if (googleId) socialProviders.push("google")
    if (githubId) socialProviders.push("github")

    return {
      ...defaultAuthConfig,
      authClient,
      Link: AfendaAuthLink,
      navigate: (opts: { to: string; replace?: boolean }) => {
        void navigate(opts.to, { replace: opts.replace })
      },
      baseURL: "",
      appearance: {
        ...defaultAuthConfig.appearance,
        theme: theme ?? defaultAuthConfig.appearance.theme,
        setTheme,
      },
      basePaths: {
        ...basePaths,
        auth: `${base}/auth`,
        /** Signed-in settings live under `/app/settings/*` (not public `/settings`). */
        settings: `${base}/app/settings`,
        organization: `${base}/organization`,
      },
      viewPaths: afendaViewPaths,
      redirectTo: `${base}/app`,
      magicLink: allPlugins,
      passkey: allPlugins,
      multiSession: allPlugins,
      username: {
        ...defaultAuthConfig.username,
        enabled: allPlugins,
      },
      deleteUser: {
        enabled: true,
        sendDeleteAccountVerification: true,
      },
      ...(socialProviders.length > 0 ? { socialProviders } : {}),
    }
  }, [navigate, theme, setTheme, allPlugins, googleId, githubId])
}
