/**
 * Label for the chord that opens the palette (footer / hints). Best-effort: SSR returns Ctrl+K.
 */
export function getCommandPaletteOpenChordLabel(): string {
  if (typeof navigator === 'undefined') return 'Ctrl+K'
  const ua = navigator.userAgent
  const platform = navigator.platform
  const isMac =
    /Mac|iPhone|iPod|iPad/i.test(platform) ||
    /Mac OS X/.test(ua) ||
    ua.includes('Mac')
  return isMac ? '⌘K' : 'Ctrl+K'
}
