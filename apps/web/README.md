# @afenda/web (Vite client)

ERP-style web client for Afenda. Bootstraps from `src/main.tsx`, builds with Vite.

## Global stylesheet architecture (dual entrypoint)

The app keeps **two governed filenames** for the same global token/theme system. This matches common ecosystem habits and stays aligned with **style-binding** policy (`packages/shadcn-ui-deprecated/src/lib/constant/policy/style-binding.ts`).

| Entry                 | Role                                                                                                                | Typical stack association                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`src/index.css`**   | **Primary runtime entry** for this repo. Owns Tailwind bridge, tokens, `@theme inline`, base rules.                 | **Vite** — imported from `src/main.tsx` as the single bootstrap stylesheet.                                                                              |
| **`src/globals.css`** | **Secondary, policy-level entry** with the filename many stacks use for “global CSS” (e.g. **Next.js** app router). | Same token system; **must not** fork semantics. Here it forwards with `@import "./index.css"` so there is **one source of truth** for tokens and layers. |

**Rules of thumb**

- Prefer **`index.css`** for new app-level imports in this Vite app (already wired in `main.tsx`).
- Use **`globals.css`** when you need parity with Next-style paths, docs, or tooling that expects that filename — imports must resolve to the **canonical paths** listed in `styleBindingPolicy.allowedGlobalStyleOwners`.
- Do **not** add ad-hoc `globals.css` / `index.css` copies under feature trees; keep a single token/theme story via the app entry styles (`index.css` / `globals.css` as documented above).

**Fixtures** for import-policy examples (used by docs and manual review): `scripts/fixtures/import-policy-*.md`.

## Related

- HTTP API (`@afenda/api`): [`../api/README.md`](../api/README.md) — Hono stack, `hc` typed client, production hardening roadmap (Phase 1 / Phase 2)
- Monorepo docs: `docs/README.md`, `docs/COMPONENTS_AND_STYLING.md`
- UI package (`@afenda/shadcn-ui-deprecated`): `packages/shadcn-ui-deprecated/README.md` (if present) and `docs/COMPONENTS_AND_STYLING.md`
