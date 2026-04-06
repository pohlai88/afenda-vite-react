import { useEffect } from 'react'

/**
 * Registers ⌘K / Ctrl+K to toggle command palette open state.
 * Only active when `enabled` is true (e.g. `showCommandPalette` on the shell).
 */
export function useCommandPaletteShortcut(
  enabled: boolean,
  isOpen: boolean,
  setOpen: (open: boolean) => void,
) {
  useEffect(() => {
    if (!enabled) return

    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(!isOpen)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [enabled, isOpen, setOpen])
}
