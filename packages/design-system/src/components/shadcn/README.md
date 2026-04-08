# Canonical shadcn reference (`@afenda/design-system`)

This directory is the **only** supported UI component root inside `packages/design-system`.

- **`ui/`** — shadcn/Radix-style primitives (reference copy; may lag `@afenda/shadcn-ui` slightly).
- **`theme-provider.tsx`** — theme context for demos or local wiring.
- **`hooks/`** — hooks used only by this tree.

Governance and drift tooling treat **`packages/design-system/src/components/shadcn`** as the UI owner root for this package. No other component roots exist under `packages/design-system/src/components`.
