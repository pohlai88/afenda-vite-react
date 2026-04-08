/**
 * RESPONSIBILITY ENVELOPE
 * File role: shared shell `providers` public API barrel.
 * Owns: React providers and hooks for shell metadata, action bar, global search,
 * and TanStack `QueryProvider` (client singleton: `@/share/query`).
 * Must not own: presentational components (those live under `components/*` slices).
 */
export { QueryProvider } from './query-provider'

export {
  ShellMetadataProvider,
  useShellMetadata,
  useShellMetadataContext,
} from './shell-metadata-provider'

export type * from './shell-metadata-provider.types'

export {
  ActionBarProvider,
  useActionBar,
  useActionBarContext,
} from './action-bar-provider'

export type * from './action-bar-provider.types'

export {
  GlobalSearchProvider,
  useGlobalSearch,
  useGlobalSearchOptional,
} from './global-search-provider'

export type * from './global-search-provider.types'
