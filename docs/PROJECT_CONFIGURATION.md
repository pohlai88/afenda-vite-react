# ⚙️ Project configuration

The **Afenda** monorepo is built for **type safety**, **consistent formatting**, and **fast feedback** in CI and on commit. This page summarizes **what we use** and **where it lives**; feature-specific auth and DB env vars are covered in [Authentication](./AUTHENTICATION.md), [Database](./DATABASE.md), and [Deployment](./DEPLOYMENT.md).

---

## Tech stack (summary)

| Area | Technology |
| --- | --- |
| Monorepo | [pnpm](https://pnpm.io/) workspaces + [Turborepo](https://turborepo.com/) |
| Web app | [Vite](https://vitejs.dev/) 8 + [React](https://react.dev/) 19 (`apps/web`) |
| Language | [TypeScript](https://www.typescriptlang.org/) ~5.9 (strict presets in [`packages/typescript-config/`](../packages/typescript-config/)) |
| Styling | Global / component CSS today; **Tailwind CSS v4** + shadcn/ui when you adopt them ([Components and styling](./COMPONENTS_AND_STYLING.md)) |
| Data (client) | [TanStack Query](https://tanstack.com/query) + [Zustand](https://github.com/pmndrs/zustand) where needed ([State management](./STATE_MANAGEMENT.md)) |
| Database | [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/) on the **server** when you add an API package—not inside the Vite bundle ([Database](./DATABASE.md)) |
| Auth (product) | IdP / BFF patterns in [Authentication](./AUTHENTICATION.md) (not Next.js Auth.js routes) |
| Testing | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) (`apps/web`) |
| Linting | [ESLint](https://eslint.org/) 9 **flat config** ([`eslint.config.js`](../eslint.config.js)) |
| Formatting | [Prettier](https://prettier.io/) ([`prettier.config.js`](../prettier.config.js)) |
| Git hooks | [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks) + [lint-staged](https://github.com/lint-staged/lint-staged) (root [`package.json`](../package.json)) |

---

## ESLint

ESLint analyzes JavaScript and TypeScript. Configuration lives in the **flat** config at the **repository root** so one policy applies across `apps/*` and `packages/*`.

- **Config:** [`eslint.config.js`](../eslint.config.js)
- **Stack:** `typescript-eslint`, React (core + hooks + refresh), **jsx-a11y**, and `eslint-config-prettier` so ESLint does not fight Prettier

Run from the root with `pnpm lint` (via Turborepo) or from `apps/web` with `pnpm lint` inside that package.

---

## Prettier

Prettier keeps formatting consistent. Configuration is in [`prettier.config.js`](../prettier.config.js) at the repo root. Ignore rules live in [`.prettierignore`](../.prettierignore).

Enable **Format on Save** in your editor. If Prettier cannot format a file, the syntax may be invalid—fix errors first.

Companion: [Prettier dependency guide](./dependencies/prettier.md).

---

## TypeScript

ESLint catches many issues; TypeScript adds **static typing** for safer refactors. Shared presets live in [`packages/typescript-config/`](../packages/typescript-config/); `apps/web` extends them via `tsconfig.app.json` / `tsconfig.node.json` and project references in [`apps/web/tsconfig.json`](../apps/web/tsconfig.json).

- React + app code: [`apps/web/tsconfig.app.json`](../apps/web/tsconfig.app.json) → extends `@afenda/tsconfig/react-app.json`
- Node-side config (e.g. Vite): [`apps/web/tsconfig.node.json`](../apps/web/tsconfig.node.json) → extends `@afenda/tsconfig/node.json`

Use `pnpm typecheck` at the root (Turborepo) or `pnpm typecheck` in `apps/web`.

TypeScript does **not** replace runtime validation for external data—use **Zod** (already used with forms) at API boundaries when relevant.

Companion resource: [TypeScript Cheatsheet (React)](https://react-typescript-cheatsheet.netlify.app/).

---

## Git hooks (pre-commit)

This repo uses [**simple-git-hooks**](https://github.com/toplenboren/simple-git-hooks) plus [**lint-staged**](https://github.com/lint-staged/lint-staged)—**not** Husky. On commit, staged files are formatted with Prettier and linted with ESLint per the root [`package.json`](../package.json).

To adjust hooks, edit the `simple-git-hooks` and `lint-staged` sections in the root `package.json`.

---

## Environment variables

### Vite client (`apps/web`)

[Vite](https://vitejs.dev/guide/env-and-mode.html) exposes only variables prefixed with **`VITE_`** to the client bundle. **Never** put secrets in `VITE_*`—they are visible in shipped JS.

- Copy [`apps/web/.env.example`](../apps/web/.env.example) to **`.env.local`** for local overrides (gitignored).
- Use `.env`, `.env.development`, `.env.production` as appropriate for non-secret defaults.

```env
# Example — exposed to client
VITE_APP_TITLE=Afenda
VITE_API_BASE_URL=https://api.example.com
```

### Server / API (when you add a backend package)

Database URLs, OAuth client secrets, session keys, and integration keys must live in **server-only** env (no `VITE_` prefix), loaded by Node or your host—not by Vite. See [Authentication](./AUTHENTICATION.md), [Database](./DATABASE.md), [Integrations](./INTEGRATIONS.md), [Deployment](./DEPLOYMENT.md).

### Type-safe env (optional)

This repo does **not** ship [`@t3-oss/env-core`](https://env.t3.gg/) or Next-specific env helpers. For a **server** package, a common pattern is **Zod**-parsed `process.env` in one module; for the **Vite** client, small `import.meta.env` wrappers with typed literals are enough until you add a generator.

### Optional: direnv

If your team uses [direnv](https://direnv.net/) to load env on `cd`, you can maintain a **local** `.envrc` (gitignored). There is no requirement in this repo—use Vite’s `.env*` files if you prefer.

---

## Tailwind CSS v4 (when adopted)

If you add **Tailwind v4**, theme tokens usually live in a **global CSS** entry (e.g. `apps/web/src/index.css`) with `@import "tailwindcss"` and `@theme { ... }`. See [Components and styling](./COMPONENTS_AND_STYLING.md) and [Design system](./DESIGN_SYSTEM.md). The web app does **not** ship Tailwind in `package.json` today.

---

## Absolute imports (`apps/web`)

Prefer **path aliases** so files can move without deep relative imports.

**Vite** — aliases in [`apps/web/vite.config.ts`](../apps/web/vite.config.ts) (e.g. `@` → `./src`).

**TypeScript** — [`apps/web/tsconfig.app.json`](../apps/web/tsconfig.app.json) sets `baseUrl` and `paths` so `@/*` maps to `./src/*`.

```typescript
// Prefer
import { Button } from '@afenda/shadcn-ui-deprecated/components/ui/button'

// Avoid
import { Button } from '../../../components/Button'
```

---

## Related docs

- [Architecture](./ARCHITECTURE.md) — monorepo and web client
- [Authentication](./AUTHENTICATION.md) — env split (`VITE_*` vs server)
- [Integrations](./INTEGRATIONS.md) — OAuth secrets for providers
- [Database](./DATABASE.md) — `DATABASE_URL`, Drizzle
- [Deployment](./DEPLOYMENT.md) — Vercel and production env
- [Brand guidelines](./BRAND_GUIDELINES.md) · [Design system](./DESIGN_SYSTEM.md)
- [Project structure](./PROJECT_STRUCTURE.md)
- [Components and styling](./COMPONENTS_AND_STYLING.md)
- [State management](./STATE_MANAGEMENT.md)
- [Testing](./TESTING.md) — Vitest, RTL, coverage (`apps/web`)
- [Performance](./PERFORMANCE.md)
- AI / contributor guide: [`AGENTS.md`](../AGENTS.md)
