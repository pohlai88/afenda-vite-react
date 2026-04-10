# legacy-supabase (reference archive)

Supabase-aligned **reference material** kept next to `@afenda/shadcn-ui`. It is **not** part of the package build:

- **TypeScript:** `src/legacy-supabase` is listed in `packages/shadcn-ui/tsconfig.json` under `exclude` (not typechecked with the library).
- **Exports:** there is no `package.json` export for this path; do not import it from `@afenda/shadcn-ui`.
- **ESLint:** the tree is ignored in the root `eslint.config.js` so it does not participate in governed UI lint rules.

Use this folder as **documentation and copy-paste source** when migrating patterns into governed components. Any `.ts`/`.tsx` here may still use `@/` path aliases that assume `src/` layout—adjust imports if you move a file out.

### Contents

| Path | Role |
|------|------|
| `components/` | Legacy React examples (RHF form, toasts, textarea variant, AI icon). |
| `css/` | Generated theme CSS (`theme/`, `source/global.css`, `shadcn-base.css`). |
| `docs/tailwind-theming.md` | Token / primitive naming notes. |
| `lib/` | Utilities and Tailwind class inventories (`tailwind-demo-classes.ts`). |

The Tailwind **`tw-extend/color.js`** map was removed as redundant build/config noise; semantic colors remain in the CSS files under `css/`.
