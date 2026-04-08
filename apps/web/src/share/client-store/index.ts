/**
 * Client-side Zustand stores and store-adjacent keys for the Vite SPA.
 * Server / cache state: TanStack Query and API layers — not here.
 * React local/DOM hooks: `share/react-hooks/`.
 * Naming: files are `*-store.ts` or descriptive kebab (no `use-` prefix); exports use `useXxxStore` / `useXxx`. See `RULES.md`.
 */
export { useAppShellStore, type SidebarMode } from './app-shell-store'
export {
  useTruthScopeStore,
  type ScopeOrg,
  type ScopeSubsidiary,
  type ScopeAccountingPeriod,
} from './truth-scope-store'
export { useTruthHealthStore } from './truth-health-store'
export { useTruthNavProps, type TruthNavProps } from './truth-nav-props'
export { useTruthShellBootstrap } from './truth-shell-bootstrap'
export {
  LEGACY_ACTION_BAR_PREFS_KEY,
  buildActionBarPrefsContextKey,
  buildActionBarPrefsStorageKey,
} from './action-bar-prefs-key'
export {
  selectActiveActionBarPrefs,
  useActionBarPrefsStore,
  type ActionBarPrefsState,
} from './action-bar-prefs-store'
export { useSyncActionBarPrefsContext } from './sync-action-bar-prefs-context'
