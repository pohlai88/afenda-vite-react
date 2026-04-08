/**
 * RESPONSIBILITY ENVELOPE
 * File role: **state** — storage key helpers for action-bar prefs (Zustand persist).
 * Owns: stable composite key `tenantId:userId` for `prefsByContext`.
 * Must not own: React Context (see `ActionBarProvider` in `components/providers`).
 * Related: `action-bar-prefs-store.ts`.
 */

/** Stable key for namespacing persisted prefs (tenant + user). */
export function buildActionBarPrefsStorageKey(
  tenantId: string | null,
  userId: string | null,
): string {
  const t = tenantId?.trim() || '_no_tenant'
  const u = userId?.trim() || '_no_user'
  return `${t}:${u}`
}

/** One-time migration bucket from pre–per-context localStorage shape. */
export const LEGACY_ACTION_BAR_PREFS_KEY = '__legacy__' as const

/** @deprecated Use {@link buildActionBarPrefsStorageKey}. */
export const buildActionBarPrefsContextKey = buildActionBarPrefsStorageKey
