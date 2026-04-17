/**
 * Allowed Lucide export names for `@afenda/design-system/icons` (`IconLucide` `name` prop).
 * Used anywhere shell chrome needs an icon (sidebar rows, top nav, secondary bars, etc.).
 */
export const shellIconNames = [
  "ListIcon",
  "ShieldIcon",
  "LinkIcon",
  "DatabaseIcon",
  "LayoutGridIcon",
  "UsersIcon",
  "FileBarChartIcon",
  "FileTextIcon",
] as const

export type ShellIconName = (typeof shellIconNames)[number]

/** Compatibility alias — same as {@link ShellIconName}. */
export type ShellNavIconName = ShellIconName

/** Compatibility alias — same as {@link shellIconNames}. */
export const shellNavIconNames = shellIconNames
