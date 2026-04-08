# @afenda/design-system

Afenda **design tokens** (Style Dictionary), generated CSS themes, and a **canonical reference copy** of shadcn-style UI under `src/components/shadcn/`.

## Canonical surface (supported)

- **`src/components/shadcn/`** — reference primitives (`ui/`, `theme-provider.tsx`, hooks colocated here). This is the only component tree treated as current and aligned with governance tooling.
- **Token / style pipeline** — `internals/`, generated CSS, and related scripts (see `package.json` `generate-styles` and friends).

**Runtime app UI** should consume **`@afenda/shadcn-ui`** (or the app’s configured UI package), not deep imports from legacy folders in this package.

## Legacy components removed

Previous non-`shadcn` folders under `src/components/` (legacy `Button/`, `Typography/`, `TreeView/`, `__archived__/`, etc.) have been **deleted**. Only `src/components/shadcn/` remains.

## Historical note

Older README content referred to a Supabase/Figma-tokens template; token workflows are now driven by this monorepo’s `internals/tokens` scripts and `pnpm run generate-styles`.
