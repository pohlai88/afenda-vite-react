# Architecture

This document explains **how the Afenda ERP workspace fits together** at a systems level: monorepo orchestration, the web client’s place in the tree, and how that supports **business-oriented features** (modules such as finance, inventory, HR, reporting, etc.) as they evolve in the codebase.

For **folder-by-folder layout inside the Vite app** (`apps/web/src`, features, pages, routes), use [**Project structure**](./PROJECT_STRUCTURE.md). That guide is authoritative for application structure; this page does not redefine those paths.

---

## 1. Afenda monorepo (ERP system)

Afenda is delivered as a **pnpm** + **Turborepo** monorepo. The **primary surface** is the **React + Vite** SPA under **`apps/web`**, which implements the **ERP web client**: shell, navigation, and **feature modules** aligned to business capabilities (see [Project structure](./PROJECT_STRUCTURE.md)).

### How it works

- **Package manager:** [pnpm](https://pnpm.io/) workspaces (`pnpm-workspace.yaml`) install dependencies and link local packages.
- **Task runner:** [Turborepo](https://turborepo.com/) (`turbo.json`) runs `build`, `lint`, `typecheck`, `test`, and other tasks across `apps/*` and `packages/*` with caching and dependency ordering.
- **Primary application:** the **React + Vite** app under **`apps/web`** (see [`apps/web/package.json`](../apps/web/package.json)). Production output is static assets under `apps/web/dist/` (served like any Vite build).
- **Shared TypeScript:** [`packages/typescript-config/`](../packages/typescript-config/) holds shared `tsconfig` presets consumed by apps and packages.
- **Workspace testing:** [`packages/testing/`](../packages/testing/) (`@afenda/testing`) holds **shared test infrastructure** (Vitest global setup today; reserved layout for E2E, Storybook, and UI test glue as the repo grows).
- **Persistent data:** ERP state belongs in **PostgreSQL** (and related services), accessed from **API or workers**—see [Database](./DATABASE.md). The Vite app talks to HTTP APIs, not the DB directly.

```text
afenda-monorepo/
├── apps/
│   └── web/              # ERP web client (Vite + React)
├── packages/
│   ├── typescript-config/   # Shared tsconfig presets
│   ├── testing/             # Workspace testing strategy (Vitest setup; E2E / Storybook stubs)
│   └── shared/              # Cross-app shared modules (public API via package root)
├── docs/                 # Repo-wide guides (including this file)
├── eslint.config.js      # Flat ESLint, workspace-wide
├── turbo.json
├── pnpm-workspace.yaml
└── scripts/
    ├── afenda.config.json         # Product/workspace path metadata
    └── afenda.config.schema.json  # Schema for the workspace manifest
```

### Development and build flow

1. **Install:** `pnpm install` at the repo root.
2. **Dev:** `pnpm dev` runs Turbo `dev` tasks (typically the Vite dev server for `apps/web` and any other configured apps).
3. **Quality gates:** `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, and `pnpm build` delegate to Turbo so each package’s scripts run in the right order.

This repository is the **live ERP product source tree**. Day-to-day architecture decisions for UI, workflows, and domain code belong under **`apps/web/src`** as described in [Project structure](./PROJECT_STRUCTURE.md).

---

## 2. Web application layering (conceptual)

Inside **`apps/web`**, the client is organized into **`src/features/`** (ERP capabilities), **`src/share/`** (routing, providers, shell state, and future shared UI/hooks/services), and **`src/pages/`** (marketing / landing only). The **exact** allowed top-level folders under **`apps/web/src`** are **machine-enforced** via **`workspaceGovernance.webClientSrc`** in [`scripts/afenda.config.json`](../scripts/afenda.config.json); see [Monorepo boundaries](./MONOREPO_BOUNDARIES.md). Map ERP areas to **feature** folders as described in [Project structure](./PROJECT_STRUCTURE.md). **Authentication** is a browser + **backend** concern—see [Authentication](./AUTHENTICATION.md). State, data fetching, and styling conventions are documented in:

- [State management](./STATE_MANAGEMENT.md)
- [Components and styling](./COMPONENTS_AND_STYLING.md)
- [Performance](./PERFORMANCE.md)

No second “source of truth” for folder names lives here—always align with [Project structure](./PROJECT_STRUCTURE.md).

---

## Related docs

- [Documentation scope](./DOCUMENTATION_SCOPE.md) — Which docs are normative vs optional
- [API reference](./API.md) — REST contract (`/api/tenants/{tenant}/...`) for the HTTP server
- [Project structure](./PROJECT_STRUCTURE.md) — **application** layout under `apps/web`
- [Monorepo boundaries](./MONOREPO_BOUNDARIES.md) — machine-enforced root, **`apps/web/src`** topology (`webClientSrc`), feature template, and shared-package rules
- [Architecture evolution](./ARCHITECTURE_EVOLUTION.md) — Trigger-based policy for upgrade timing and ADR ownership
- [Authentication](./AUTHENTICATION.md) — Vite SPA patterns, BFF / Auth0, API checks
- [Roles and permissions](./ROLES_AND_PERMISSIONS.md) — RBAC + PBAC, DB-backed checks, UI vs API
- [Database](./DATABASE.md) — PostgreSQL + Drizzle (API/worker only; not in Vite)
- [Deployment](./DEPLOYMENT.md) — Vercel static client + external API/DB
- [Glossary](./GLOSSARY.md) — shared vocabulary (client vs server, tenant, ERP concepts)
- [Integrations](./INTEGRATIONS.md) — OAuth to third-party APIs from the backend
- [Brand guidelines](./BRAND_GUIDELINES.md) · [Design system](./DESIGN_SYSTEM.md) — ERP UI identity and tokens
- [Project configuration](./PROJECT_CONFIGURATION.md) — ESLint, Prettier, TypeScript, tooling
- [AGENTS.md](../AGENTS.md) — AI and contributor execution guide
