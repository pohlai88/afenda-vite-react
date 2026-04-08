import { useEffect, useRef } from 'react'

/** True when the event target is (or is inside) a field where typing should not fire app shortcuts. */
export function isTypingInEditableField(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.closest('[role="combobox"]')) return true
  return false
}

/** US QWERTY-style: `?` or `Shift` + `/` (no Ctrl/Meta/Alt). */
export function matchDefaultHelpShortcut(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false
  if (event.key === '?') return true
  if (event.shiftKey && event.key === '/') return true
  return false
}

export interface UseGlobalKeydownShortcutOptions {
  enabled?: boolean
  disabled?: boolean
  match: (event: KeyboardEvent) => boolean
  onMatch: () => void
}

/**
 * Listens on `window` for `keydown`. Uses refs for `match` / `onMatch` so callers are not forced to memoize.
 * Skips when focus is in an editable field.
 */
export function useGlobalKeydownShortcut({
  enabled = true,
  disabled = false,
  match,
  onMatch,
}: UseGlobalKeydownShortcutOptions): void {
  const matchRef = useRef(match)
  const onMatchRef = useRef(onMatch)

  useEffect(() => {
    matchRef.current = match
    onMatchRef.current = onMatch
  }, [match, onMatch])

  useEffect(() => {
    if (!enabled || disabled) return

    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (isTypingInEditableField(event.target)) return
      if (!matchRef.current(event)) return
      event.preventDefault()
      onMatchRef.current()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, disabled])
}
