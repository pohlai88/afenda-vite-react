/** Dispatched on `window` so any shell surface can open the palette without prop drilling. */
export const SHELL_OPEN_COMMAND_PALETTE_EVENT =
  "afenda:open-command-palette" as const

export function dispatchOpenCommandPalette(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(SHELL_OPEN_COMMAND_PALETTE_EVENT))
}
