# Global stylesheet entrypoints (web app)

`@afenda/ui` ships package-level styles (see `globals.css` in this folder). The **Vite web client** (`apps/web`) additionally maintains **two governed filenames** under `apps/web/src/` for the same design system:

- **`index.css`** — primary bootstrap entry (imported from `main.tsx`).
- **`globals.css`** — secondary filename for Next-style / tooling parity; forwards to `index.css` so token and theme logic stay single-sourced.

Authoritative explanation, governance pointers, and the rules of thumb live in:

**[`apps/web/README.md`](../../../../apps/web/README.md)** (section *Global stylesheet architecture (dual entrypoint)*).

Policy source: `packages/shadcn-ui/src/lib/constant/policy/style-binding.ts` (`allowedGlobalStyleOwners`, `styleBindingPolicy`).
