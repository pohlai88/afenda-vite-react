/**
 * App-level React hooks (DOM, media queries, shortcuts).
 * Not Zustand store modules — see `share/client-store/` (`use*Store` = Zustand). See `RULES.md`.
 */
export {
  isTypingInEditableField,
  matchDefaultHelpShortcut,
  useGlobalKeydownShortcut,
} from './use-global-keydown-shortcut'
export type { UseGlobalKeydownShortcutOptions } from './use-global-keydown-shortcut'
export { useIsMobile } from './use-is-mobile'
