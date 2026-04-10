# Afenda — React + Vite monorepo

**Afenda** is an **ERP** product delivered as a **pnpm** + **Turborepo** workspace: the Vite web client lives under `apps/web`. This repo is the product source tree—follow [`docs/README.md`](docs/README.md) for the full doc index, [`docs/`](docs/) for sources, and [`AGENTS.md`](./AGENTS.md) for AI execution notes. Generated repo-level evidence and caches belong under [`.artifacts/`](docs/REPO_ARTIFACT_POLICY.md) per [`docs/REPO_ARTIFACT_POLICY.md`](docs/REPO_ARTIFACT_POLICY.md).

## Features

- ⚡️ **Instant HMR** — [Vite](https://vitejs.dev/) for fast local development
- ⚛️ **React** — [React](https://react.dev/) for UI
- 🦾 **TypeScript** — [TypeScript](https://www.typescriptlang.org/) for type safety
- 🏗️ **Feature-based architecture** — Scalable, maintainable organization
- 🔒 **Encapsulated features** — Self-contained modules with clear boundaries
- 🎯 **Domain-driven design** — Structure organized around business capabilities
- 📦 **Monorepo** — [Turborepo](https://turborepo.com/) and [pnpm](https://pnpm.io/) at the repo root

## Architecture

This layout uses feature-based organization inspired by Screaming Architecture and domain-driven design. That keeps the codebase:

- 📦 **Modular** — Each feature stays self-contained
- 🔄 **Maintainable** — Changes stay localized
- 🚀 **Scalable** — Add features without destabilizing the rest
- 🎨 **Clear** — Structure reflects capabilities, not only technical layers

For detailed structure and conventions, see repo-root [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) and [`apps/web/docs/`](apps/web/docs/) when present, plus [AGENTS.md](./AGENTS.md) for the documentation map.

## Extra documentation

- [Architecture](docs/ARCHITECTURE.md) — ERP monorepo and web client overview
- [Authentication](docs/AUTHENTICATION.md) — Vite SPA + backend auth (BFF, Auth0, route guards)
- [Roles and permissions](docs/ROLES_AND_PERMISSIONS.md) — RBAC (role assignment) + PBAC (permission-key checks), API vs UI
- [Integrations](docs/INTEGRATIONS.md) — OAuth to external APIs (e.g. GitHub), webhooks, sync patterns
- [Database](docs/DATABASE.md) — PostgreSQL, Drizzle ORM, migrations, tenant data
- [Deployment](docs/DEPLOYMENT.md) — Vercel (Turborepo build, env, SPA routing)
- [Glossary](docs/GLOSSARY.md) — ERP and platform vocabulary (Vite client vs API, tenant, GL, …)
- [Brand guidelines](docs/BRAND_GUIDELINES.md) — logo, colors, typography, gradient rules
- [Design system](docs/DESIGN_SYSTEM.md) — tokens, neutral scale, typography reference
- [shadcn/ui guide](docs/dependencies/shadcn-ui.md) — Radix + shadcn in `apps/web` (Vite paths, forms, theming)
- [Testing](docs/TESTING.md) — Vitest + React Testing Library + optional MSW (`apps/web`)
- Repo-wide AI and execution notes: [AGENTS.md](./AGENTS.md)
- Web app docs (as they are added): [apps/web/docs/](apps/web/docs/)

## Pre-packed

### Dev tools

- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/) — linting for JavaScript/TypeScript
- [Prettier](https://prettier.io/) — formatting
- [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks) — git hooks
- [lint-staged](https://www.npmjs.com/package/lint-staged) — run checks on staged files

## Quickstart

```sh
fnm use
pnpm install
pnpm dev
```

To run only the Vite web app:

```sh
pnpm --filter @afenda/web dev
```

## Development

Most day-to-day work uses `pnpm dev`. Other root scripts (via Turborepo):

| `pnpm <script>` | Description                                         |
| --------------- | --------------------------------------------------- |
| `dev`           | Dev tasks for the workspace (includes the Vite app) |
| `format`        | Format with Prettier                                |
| `format:check`  | Check formatting                                    |
| `lint`          | ESLint across workspace packages                    |
| `typecheck`     | TypeScript project references                       |
| `test`          | Vitest (watch, where configured)                    |
| `test:run`      | Vitest single run                                   |
| `check`         | `lint`, `typecheck`, `test:run`, and `build`        |
| `build`         | Production builds                                   |

Package-specific scripts (for example extra lint or test targets) live in each `package.json`; run them with `pnpm --filter <package-name> <script>`.

## Production

| `pnpm <script>` | Description                                                                             |
| --------------- | --------------------------------------------------------------------------------------- |
| `preview`       | Preview production builds (per package tasks)                                           |
| `build`         | Build applications and packages for production (e.g. web output under `apps/web/dist/`) |
