# Search rules

## Purpose

`search` owns global find / command-palette UX (Cmd+K style), not navigation chrome.

## What belongs here

- `command-palette.tsx` (global palette UI; render-only, cmdk composition).
- `command-palette.types.ts` (normalized `PaletteCommand` model + group order).
- `use-palette-commands.ts` (build / dedupe / rank / scope-filter hook for the palette).
- `search-suggestions.tsx` (scoped keyboard, caller-owned type presentation).
- `semantic-search-input.tsx` (debounced search field; `InputGroup` composition).
- Coordination with `providers/global-search-provider` for shared query, search recents, palette recents/pins, and cache.

## What does not belong here

- Top nav, breadcrumbs, mobile drawer (`navigation/`)
- Trigger buttons (`block-ui/trigger/`)
- Raw shadcn primitives (`packages/ui`)

## Dependencies

- May import types from `navigation/nav-model` for nav group shapes consumed by the palette.
- May import search result types from `providers/global-search-provider.types` for suggestion rows.
