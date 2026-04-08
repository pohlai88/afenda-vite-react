# `design-css`

Canonical global CSS for `@afenda/shadcn-ui`.

## Layer order

1. `index.css`
   Standalone entry. Imports Tailwind, animation utilities, registers package
   source paths, and composes the rest of the stack.
2. `tokens.css`
   Owns light/dark CSS variables only. No `@theme inline` mappings here.
3. `prose.css`
   Optional typography-plugin variables that stay outside `@theme`.
4. `bridge.css`
   Registers CSS variables with Tailwind using `@theme inline`.
5. `base.css`
   Base rules, reduced-motion handling, and package-level semantic helpers.

## Maintenance method

- Add or change raw tokens and computed semantic aliases in `tokens.css`.
- Keep `bridge.css` as a pure serialization layer from CSS variables to
  Tailwind theme variables.
- Add package-generic helpers only in `base.css`.
- Keep app-specific layout chrome and product styling outside this folder.
- Prefer semantic variables (`--warning`, `--truth-valid`) over hard-coded
  colors in component files.

## Normalization rules

- `tokens.css` owns values and semantic derivations.
- `bridge.css` must not invent new values.
- `prose.css` owns typography plugin variables only.
- `base.css` may define helpers, but not palette values.
