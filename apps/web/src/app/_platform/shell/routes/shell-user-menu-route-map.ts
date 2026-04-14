import { shellAppChildPath } from "./shell-route-definitions"

/**
 * Default `NavLink` targets for shell user menu rows until dedicated account surfaces exist.
 * Paths are built with {@link shellAppChildPath} so they stay aligned with shell route definitions.
 */
export const shellUserMenuFallbackLinks = {
  account: shellAppChildPath("events"),
  billing: shellAppChildPath("partners"),
  notifications: shellAppChildPath("audit"),
} as const

export type ShellUserMenuLinkKey = keyof typeof shellUserMenuFallbackLinks
