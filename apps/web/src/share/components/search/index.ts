/**
 * RESPONSIBILITY ENVELOPE
 * File role: `search` public API barrel.
 * Owns: command palette, shell launcher, semantic/global search UI, and related types.
 * Standard: components + types; depends on `navigation` barrel / `nav-catalog/nav-model` for group shapes.
 * Must not own: nav chrome, triggers (`block-ui/trigger`), or route-only widgets.
 * Primitives: `@afenda/shadcn-ui` Command (cmdk); see `command-palette.tsx` for composition notes.
 * Related: `navigation/top-nav/top-nav-bar.tsx` (wires `GlobalSearchProvider` + `CommandPaletteBar` + `useCommandPaletteShortcut`).
 *
 * Search vs cmdk (different jobs — do not conflate):
 * - **Command palette (cmdk)** — `CommandPaletteBar` + `CommandPalette`; commands and routes, not corpus search.
 * - **Global / semantic search** — `GlobalSearchBar` (shell), `SemanticSearchInput`, `SearchSuggestions`, `GlobalSearchProvider`.
 * - **In-page** — scoped fuzzy/filter on the current view; own module or local composition.
 */
export {
  buildNavGlobalSearchResults,
  GLOBAL_SEARCH_NAV_TYPE,
} from "./build-nav-global-search-results"
export { GLOBAL_COMMAND_PALETTE_CONTENT_ID } from "./command-palette-ids"
export { CommandPalette } from "./command-palette"
export type { CommandPaletteProps } from "./command-palette"
export { CommandPaletteBar } from "./command-palette-bar"
export type { CommandPaletteBarProps } from "./command-palette-bar"
export { GlobalSearchBar } from "./global-search-bar"
export type { GlobalSearchBarProps } from "./global-search-bar"
export { SearchOverlayShell } from "./search-overlay-shell"
export type { SearchOverlayShellProps } from "./search-overlay-shell"
export type {
  PaletteCommand,
  PaletteCommandKind,
  PaletteGroup,
} from "./command-palette.types"
export { PALETTE_GROUP_ORDER } from "./command-palette.types"
export {
  usePaletteCommands,
  type UsePaletteCommandsResult,
} from "./use-palette-commands"
export { useCommandPaletteShortcut } from "./use-command-palette-shortcut"
export { SearchSuggestions } from "./search-suggestions"
export type { SearchSuggestionsProps } from "./search-suggestions"
export { SemanticSearchInput } from "./semantic-search-input"
export type { SemanticSearchInputProps } from "./semantic-search-input"
