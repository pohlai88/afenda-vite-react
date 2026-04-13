/**
 * Named chrome extension points — v1 may render empty placeholders.
 */
export const shellSlotIds = [
  "shell.header.leading",
  "shell.header.trailing",
  "shell.sidebar.footer",
  "shell.content.top",
  "shell.overlay.global",
] as const

export type ShellSlotId = (typeof shellSlotIds)[number]
