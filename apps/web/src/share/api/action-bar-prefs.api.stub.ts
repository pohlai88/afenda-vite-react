/**
 * Stub / reminder for server-backed Row-2 action bar visibility.
 * Wire to real HTTP per `docs/API.md` (tenant-scoped, user-authenticated).
 *
 * Client merge point: `useActionBarPrefsStore.getState().hydrateFromServer(tenantId, userId, map)`
 * where `map` is `Record<registrationScopeKey, orderedTabKey[]>`.
 */

import type { TruthActionBarTab } from '@afenda/core/truth-ui'

/** Payload aligned with persisted `prefsByContext[storageKey]`. */
export type ActionBarPrefsScopeMap = Record<string, string[]>

export interface FetchActionBarPrefsParams {
  readonly tenantId: string
  readonly userId: string
}

export interface SaveActionBarPrefsParams extends FetchActionBarPrefsParams {
  /** Same shape as `selectActiveActionBarPrefs` output for one tenant+user bucket. */
  readonly scopes: ActionBarPrefsScopeMap
}

/** @todo Replace with GET …/ui-preferences/action-bar (or equivalent). */
export function fetchActionBarPrefsStub(
  _params: FetchActionBarPrefsParams,
): Promise<ActionBarPrefsScopeMap | null> {
  return Promise.resolve(null)
}

/** @todo Replace with PUT/PATCH …/ui-preferences/action-bar (or equivalent). */
export function saveActionBarPrefsStub(
  _params: SaveActionBarPrefsParams,
): Promise<void> {
  return Promise.resolve()
}

/**
 * Optional future: server returns full tab definitions instead of static catalogs.
 * Not used by the shell today — modules still register `TruthActionBarTab[]` locally.
 */
export type RemoteActionBarCatalogStub = Record<
  string,
  readonly TruthActionBarTab[]
>
