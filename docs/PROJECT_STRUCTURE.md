# 🗄️ Project structure

**Afenda** uses a **feature-based** layout (Screaming Architecture + DDD ideas): ERP domain code lives under **`src/features/<name>/`**. Cross-cutting client infrastructure lives under **`src/share/`** (not a catch-all `lib/` at `src` root). The web client is a **Vite + React** SPA under **`apps/web`** with **React Router**—there is **no** Next.js App Router or React Server Components.

Unless noted otherwise, paths below are relative to **`apps/web/src`** (shorthand: **`src/`**).

**Machine enforcement:** `apps/web/src` top-level folders and required `src/share/*` subfolders are **locked** in [`scripts/afenda.config.json`](../scripts/afenda.config.json) (`workspaceGovernance.webClientSrc`) and validated by `pnpm run script:check-afenda-config`. See [Monorepo boundaries](./MONOREPO_BOUNDARIES.md).

---

## Architecture overview

Three top-level buckets under **`src/`**:

1. **`features/`** — ERP and product capability modules (auth UI, dashboard, finance, …). This is the **primary source** for application behavior and screens.
2. **`share/`** — Shared **client** infrastructure: routing tables, global providers, cross-feature state, and (as you add them) shared components, hooks, contexts, services, actions. Nothing cross-cutting should sprawl at `src/` root.
3. **`pages/`** — **Marketing / landing only** (e.g. public homepage). The authenticated ERP shell is routed from **`share/routing`** directly to **`features/*`** views.

**Backend data and Drizzle** live in **separate packages** (e.g. `apps/api`, `packages/database`)—not under `apps/web/src`. See [Database](./DATABASE.md) and [Architecture](./ARCHITECTURE.md).

**Workspace testing** (unit, future E2E, Storybook, UI/a11y glue) is centered on [`packages/testing/`](../packages/testing/) (`@afenda/testing`); Vitest **`setupFiles`** in **`apps/web/vite.config.ts`** points at **`@afenda/testing/vitest/setup`**—see [Testing](./TESTING.md).

---

## Normative `apps/web/src` layout

Top-level **directories** under `src/` are **exactly** `features`, `pages`, and `share` (enforced by config). Entry files live next to them:

```text
apps/web/
├── vite.config.ts        # Vite + Vitest (`test` block); setupFiles → @afenda/testing/vitest/setup
└── src/
    ├── main.tsx          # React root
    ├── App.tsx           # Shell: QueryProvider + RouterProvider
    ├── index.css         # Global styles
    ├── App.css
    ├── features/         # Feature modules (required internal shape → MONOREPO_BOUNDARIES)
    │   ├── auth/
    │   ├── dashboard/
    │   └── …
    ├── pages/            # Marketing / landing only
    │   └── Landing.tsx
    └── share/            # Shared client infrastructure (expand here, not at src root)
        ├── routing/      # createBrowserRouter, marketing + /app/* feature routes
        ├── providers/    # e.g. TanStack Query client + QueryClientProvider
        ├── state/        # e.g. Zustand app shell store
        └── i18n/         # i18next bootstrap, locales, glossary, audit artifacts (SEA i18n)
        # (future) components/, contexts/, hooks/, services/, actions/, utils/
```

### Routing model

- **Marketing:** [`share/routing/marketing-routes.tsx`](../apps/web/src/share/routing/marketing-routes.tsx) — e.g. `/` → `pages/Landing`.
- **ERP app:** [`share/routing/feature-routes.tsx`](../apps/web/src/share/routing/feature-routes.tsx) — routes under **`/app/*`** map to **`features/*`** views (no thin `pages/` wrappers for ERP).
- **Root router:** [`share/routing/router.tsx`](../apps/web/src/share/routing/router.tsx) composes both and may redirect legacy paths (e.g. `/dashboard` → `/app/dashboard`).

**Route guards** (e.g. redirect unauthenticated users) belong in **`features/auth`** as real components or loaders when [Authentication](./AUTHENTICATION.md) is implemented—not placeholder flags in the router.

---

## Route map (ERP under `/app/*`)

| Path (canonical) | Feature module       | Notes                                                          |
| ---------------- | -------------------- | -------------------------------------------------------------- |
| `/`              | —                    | Marketing [`pages/Landing`](../apps/web/src/pages/Landing.tsx) |
| `/app`           | —                    | Redirects to `/app/dashboard`                                  |
| `/app/login`     | `features/auth`      | Login / sign-in UX                                             |
| `/app/dashboard` | `features/dashboard` | Executive / role home                                          |
| `/app/inventory` | `features/inventory` | Stock, warehouses, …                                           |
| `/app/sales`     | `features/sales`     | Orders, pipeline, …                                            |
| `/app/customers` | `features/customers` | Customer master, …                                             |
| `/app/employees` | `features/employees` | HR / staff, …                                                  |
| `/app/finance`   | `features/finance`   | GL, journals, …                                                |
| `/app/reports`   | `features/reports`   | Reporting, exports                                             |
| `/app/settings`  | `features/settings`  | Tenant / app preferences                                       |
| `/app/*`         | `features/not-found` | In-app 404                                                     |

**Design system:** Module accent colors in [Design system](./DESIGN_SYSTEM.md) §3.2.3 align with these areas—reuse when theming each feature.

**Evolution rule:** Add ERP UI under **`features/<name>/`**. Extend **`share/`** for cross-cutting client code. Keep **`pages/`** for public/marketing routes only.

---

## `share/` growth (planned)

Place shared building blocks **under `share/`**, not at `src/` root:

| Concern                                         | Location                                                        |
| ----------------------------------------------- | --------------------------------------------------------------- |
| Route tables, redirects                         | `share/routing/`                                                |
| React providers, query client                   | `share/providers/`                                              |
| Global / shell client state                     | `share/state/`                                                  |
| **i18n** runtime, locale JSON, glossary & audit | **`share/i18n/`** ([i18n dependencies](./dependencies/i18n.md)) |
| Design-system primitives, layout shell          | `share/components/` (when added)                                |
| Shared React context                            | `share/contexts/` (when added)                                  |
| Reusable hooks                                  | `share/hooks/` (when added)                                     |
| HTTP / API client helpers                       | `share/services/` (when added)                                  |
| Cross-feature commands                          | `share/actions/` (when added)                                   |

When you add a new **`share/`** subdirectory that must always exist, list it under **`workspaceGovernance.webClientSrc.requiredShareSubdirectories`** in [`scripts/afenda.config.json`](../scripts/afenda.config.json) so CI keeps the tree honest.

### What we do **not** put in `apps/web`

| Concern                                                      | Location                                                      |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| Drizzle schema, SQL migrations                               | `packages/database` or `apps/api` ([Database](./DATABASE.md)) |
| OAuth token exchange, webhooks                               | Backend API ([Integrations](./INTEGRATIONS.md))               |
| Long-running sync jobs                                       | Workers / queue consumers, not the Vite bundle                |
| Dumping-ground `src/lib` or extra top-level `src/components` | Use **`share/`** (enforced topology)                          |

---

## Feature module pattern

Each feature is a **self-contained** slice: UI, hooks, and client-side services for that capability.

```text
src/features/<feature-name>/
├── components/
├── hooks/
├── services/           # fetch wrappers, TanStack Query keys—call your REST/GraphQL API
├── types/
├── actions/            # feature-specific command handlers / mutations
├── utils/              # feature-local pure helpers
└── index.ts            # public API — re-export only what other areas need
```

Principles:

- **High cohesion** — related code stays together
- **Low coupling** — interact via **`index.ts`** exports or **`share/`**
- **DDD** — folder names match business language where practical

---

## Key principles

### 1. Feature encapsulation

- Do not import another feature’s **internals** (`@/features/foo/components/...`); use **`@/features/foo`** or **`share/`**.
- Export stable surfaces from **`index.ts`** at the feature root.

### 2. Public API

```typescript
// ✅ Good — uses the feature’s public surface
import { PostingDialog } from '@/features/finance'

// ❌ Avoid — couples to internal layout
import { PostingDialog } from '@/features/finance/components/PostingDialog'
```

### 3. Optional ESLint guard

To discourage deep feature imports, you can add (tune patterns to your alias):

```js
{
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: ['@/features/*/*'],
      },
    ],
  },
}
```

This is **not** enabled by default in this repo—add when the team wants stricter boundaries.

---

## Best practices (Vite + React Router)

1. **ERP screens live in `features/`** — route entries in **`share/routing`** wire URLs to feature views.
2. **Lazy-load** heavy routes when bundle size matters (`React.lazy` + `Suspense` or route-based `lazy()` imports)—see [Performance](./PERFORMANCE.md).
3. **Data fetching** — **TanStack Query** for server state; avoid duplicating cache in global React state ([State management](./STATE_MANAGEMENT.md)).
4. **Errors and loading** — use React error boundaries and route-level fallbacks (`errorElement` / suspense fallbacks) where UX requires it.
5. **No RSC** — all UI code is client-side; secrets and DB access stay on the **API**.
6. **i18n (optional)** — if you add translations, use a client i18n library and colocate namespaces by feature; there is no `next-intl` in this stack.
7. **Accessibility** — semantic HTML, labels, keyboard navigation ([Design system](./DESIGN_SYSTEM.md)).

---

## Example: auth UI + login route

```tsx
// src/features/auth/index.ts
export { LoginView } from './components/LoginView'
export { useAuthFeature } from './hooks/useAuthFeature'

// src/share/routing/feature-routes.tsx (excerpt)
// { path: '/app/login', element: <LoginView /> }
```

Register paths only in **`share/routing`**; keep **`LoginView`** implementation inside **`features/auth`**.

---

## Benefits

1. **Maintainability** — changes stay inside a feature’s boundary when possible.
2. **Scalability** — new ERP modules add folders without rewiring the whole tree.
3. **Performance** — code splitting stays explicit at the routing layer.
4. **Clear ownership** — product and engineering can map folders to capabilities.
5. **Type safety** — TypeScript across `apps/web`; server types can be shared via packages later.
6. **Locked topology** — `script:check-afenda-config` fails on accidental `src/` root sprawl.

---

## Related docs

- [Architecture](./ARCHITECTURE.md) — Afenda ERP monorepo context (this doc is the app layout inside `apps/web`)
- [Monorepo boundaries](./MONOREPO_BOUNDARIES.md) — machine-enforced roots, features, **`webClientSrc`**
- [Authentication](./AUTHENTICATION.md) — where auth features and guards live conceptually
- [Roles and permissions](./ROLES_AND_PERMISSIONS.md) — RBAC + PBAC; keys for nav vs API enforcement
- [Integrations](./INTEGRATIONS.md) — connect UI in `apps/web`, OAuth handlers on the API
- [Database](./DATABASE.md) — PostgreSQL + Drizzle live in API/database packages, not `apps/web`
- [Glossary](./GLOSSARY.md) — domain and platform terms
- [Brand guidelines](./BRAND_GUIDELINES.md) and [Design system](./DESIGN_SYSTEM.md) — visual identity and tokens
- [Project configuration](./PROJECT_CONFIGURATION.md)
- [Components and styling](./COMPONENTS_AND_STYLING.md)
- [shadcn/ui](./dependencies/shadcn-ui.md) — shared UI conventions
- [State management](./STATE_MANAGEMENT.md)
- [Performance](./PERFORMANCE.md)
- [Testing](./TESTING.md) — Vitest + RTL in `apps/web`
