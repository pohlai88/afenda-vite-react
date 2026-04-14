import { shellAppChildPath } from "./shell-route-definitions"

/** Public docs base; override with `VITE_DOCS_BASE_URL` (no trailing slash). */
export function shellUserMenuDocsBase(): string {
  const raw = import.meta.env.VITE_DOCS_BASE_URL
  if (typeof raw === "string" && raw.length > 0) {
    return raw.replace(/\/$/, "")
  }
  return "https://docs.afenda.local"
}

/**
 * Default `NavLink` / anchor targets for shell user menu rows until dedicated surfaces exist.
 * External URLs use `https?:` so the menu can render `<a target="_blank">`.
 */
export const shellUserMenuFallbackLinks = {
  account: shellAppChildPath("events"),
  billing: shellAppChildPath("partners"),
  notifications: shellAppChildPath("audit"),
  notification_settings: shellAppChildPath("audit"),
  help: `${shellUserMenuDocsBase()}/`,
  changelog: `${shellUserMenuDocsBase()}/changelog`,
  keyboard_shortcuts: `${shellUserMenuDocsBase()}/keyboard-shortcuts`,
} as const

export type ShellUserMenuLinkKey = keyof typeof shellUserMenuFallbackLinks
