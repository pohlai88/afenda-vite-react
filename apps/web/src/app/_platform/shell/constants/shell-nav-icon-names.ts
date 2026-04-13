/**
 * Lucide export names from `@afenda/design-system/icons` (`IconLucide` `name` prop).
 * Keeps shell free of scattered direct icon-library imports.
 */
export const shellNavIconNames = ["ListIcon", "ShieldIcon", "LinkIcon"] as const

export type ShellNavIconName = (typeof shellNavIconNames)[number]
