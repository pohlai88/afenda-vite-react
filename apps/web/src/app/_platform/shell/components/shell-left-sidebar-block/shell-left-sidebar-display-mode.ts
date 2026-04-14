"use client"

export const SHELL_LEFT_SIDEBAR_DISPLAY_MODE_STORAGE_KEY =
  "afenda:shell-left-sidebar:display-mode"

export const shellLeftSidebarDisplayModeList = [
  "expanded",
  "collapsed",
  "hover",
] as const

export type ShellLeftSidebarDisplayMode =
  (typeof shellLeftSidebarDisplayModeList)[number]

export function parseShellLeftSidebarDisplayMode(
  value: unknown
): ShellLeftSidebarDisplayMode | null {
  if (
    typeof value === "string" &&
    shellLeftSidebarDisplayModeList.includes(
      value as ShellLeftSidebarDisplayMode
    )
  ) {
    return value as ShellLeftSidebarDisplayMode
  }

  return null
}
