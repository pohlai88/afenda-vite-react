/**
 * RESPONSIBILITY ENVELOPE
 * File role: `search` public API barrel.
 * Owns: command palette / global search UI (Cmd+K) and related types.
 * Standard: components + types; depends on `navigation/nav-model` for group shapes.
 * Must not own: nav chrome, triggers (`block-ui/trigger`), or route-only widgets.
 * Primitives: `@afenda/ui` Command (cmdk); see `command-palette.tsx` for composition notes.
 * Related: `navigation/top-nav-bar.tsx` (wires `GlobalSearchProvider` + `CommandPaletteTrigger` + shortcut hook).
 */
export { CommandPalette } from './command-palette'
export type { CommandPaletteProps } from './command-palette'
export type {
  PaletteCommand,
  PaletteCommandKind,
  PaletteGroup,
} from './command-palette.types'
export { PALETTE_GROUP_ORDER } from './command-palette.types'
export {
  usePaletteCommands,
  type UsePaletteCommandsResult,
} from './use-palette-commands'
export { SearchSuggestions } from './search-suggestions'
export type { SearchSuggestionsProps } from './search-suggestions'
export { SemanticSearchInput } from './semantic-search-input'
export type { SemanticSearchInputProps } from './semantic-search-input'
