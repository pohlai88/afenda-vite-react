/**
 * RESPONSIBILITY ENVELOPE
 * File role: **not** a React provider — pure **selector / util** used by `action-bar-provider.tsx`.
 * Owns: `resolveEffectiveActionBarTabs` (catalog + saved keys → visible tabs).
 * Lives under `providers/` only as a co-located helper next to `ActionBarProvider`.
 * Related: `action-bar-provider.tsx`, `__test__/action-bar-effective-tabs.test.ts`.
 */
import type { TruthActionBarTab } from '@afenda/core/truth-ui'

/**
 * Builds the tab list actually shown in the top action bar.
 * No entry for `scopeKey` → use full `available` order (user default: all actions).
 */
export function resolveEffectiveActionBarTabs(
  available: readonly TruthActionBarTab[],
  scopeKey: string,
  selectedKeysByScope: Record<string, string[]>,
): TruthActionBarTab[] {
  const keys = selectedKeysByScope[scopeKey]
  if (keys === undefined) {
    return [...available]
  }
  const byKey = new Map(available.map((t) => [t.key, t] as const))
  return keys
    .map((k) => byKey.get(k))
    .filter((t): t is TruthActionBarTab => t !== undefined)
}
