# Architecture

This document explains **how the Afenda ERP workspace fits together** at a systems level: monorepo orchestration, the web client's place in the tree, the governed UI architecture, and how that supports **business-oriented features** (modules such as finance, inventory, HR, reporting, etc.) as they evolve in the codebase.

For **folder-by-folder layout inside the Vite app** (`apps/web/src`, features, pages, routes), use [**Project structure**](./PROJECT_STRUCTURE.md). That guide is authoritative for application structure; this page does not redefine those paths.

---

## 1. Afenda monorepo (ERP system)

Afenda is delivered as a **pnpm** + **Turborepo** monorepo. The **primary surface** is the **React + Vite** SPA under **`apps/web`**, which implements the **ERP web client**: shell, navigation, and **feature modules** aligned to business capabilities (see [Project structure](./PROJECT_STRUCTURE.md)).

### How it works

- **Package manager:** [pnpm](https://pnpm.io/) workspaces (`pnpm-workspace.yaml`) install dependencies and link local packages.
- **Task runner:** [Turborepo](https://turborepo.com/) (`turbo.json`) runs `build`, `lint`, `typecheck`, `test`, and other tasks across `apps/*` and `packages/*` with caching and dependency ordering.
- **Primary application:** the **React + Vite** app under **`apps/web`** (see [`apps/web/package.json`](../apps/web/package.json)). Production output is static assets under `apps/web/dist/` (served like any Vite build).
- **Shared TypeScript:** [`packages/typescript-config/`](../packages/typescript-config/) holds shared `tsconfig` presets consumed by apps and packages.
- **Workspace testing:** [`packages/vitest-config/`](../packages/vitest-config/) (`@afenda/vitest-config`) holds **shared Vitest defaults** (global setup, `getAfendaVitestTestOptions()`, coverage presets). Future E2E, Storybook, and broader UI test glue may live in additional packages as the repo grows.
- **Persistent data:** ERP state belongs in **PostgreSQL** (and related services), accessed from **API or workers** -- see [Database](./DATABASE.md). The Vite app talks to HTTP APIs, not the DB directly.

```text
afenda-monorepo/
├── apps/
│   └── web/                 # ERP web client (Vite + React)
├── packages/
│   ├── shadcn-ui/           # Governed shadcn/ui primitives + semantic layer (@afenda/shadcn-ui-deprecated)
│   ├── features/core/       # Shared feature domain types (@afenda/core)
│   ├── typescript-config/   # Shared tsconfig presets
│   ├── vitest-config/       # Shared Vitest defaults (@afenda/vitest-config)
│   └── shared/              # Cross-app shared modules (public API via package root)
├── docs/                    # Repo-wide guides (including this file)
├── tools/ui-drift/          # Shared utilities for governance scripts
├── scripts/                 # Governance checkers and workspace scripts
│   ├── check-ui-drift.ts           # Layer 0: token-level drift scan
│   ├── check-ui-drift-ast.ts       # Layer 1: AST feature-code drift checker
│   ├── check-ui-wrapper-contracts.ts # Layer 2: Radix/shadcn wrapper contract checker
│   ├── afenda.config.json           # Product/workspace path metadata
│   └── afenda.config.schema.json    # Schema for the workspace manifest
├── eslint.config.js         # Flat ESLint, workspace-wide
├── turbo.json
└── pnpm-workspace.yaml
```

### Development and build flow

1. **Install:** `pnpm install` at the repo root.
2. **Dev:** `pnpm dev` runs Turbo `dev` tasks (typically the Vite dev server for `apps/web` and any other configured apps).
3. **Quality gates:** `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, and `pnpm build` delegate to Turbo so each package's scripts run in the right order.

This repository is the **live ERP product source tree**. Day-to-day architecture decisions for UI, workflows, and domain code belong under **`apps/web/src`** as described in [Project structure](./PROJECT_STRUCTURE.md).

---

## 2. Web application layering (conceptual)

Inside **`apps/web`**, the client is organized into **`src/features/`** (ERP capabilities), **`src/share/`** (routing, providers, shell state, and future shared UI/hooks/services), and **`src/pages/`** (marketing / landing only). The **exact** allowed top-level folders under **`apps/web/src`** are **machine-enforced** via **`workspaceGovernance.webClientSrc`** in [`scripts/afenda.config.json`](../scripts/afenda.config.json); see [Monorepo boundaries](./MONOREPO_BOUNDARIES.md). Map ERP areas to **feature** folders as described in [Project structure](./PROJECT_STRUCTURE.md). **Authentication** is a browser + **backend** concern -- see [Authentication](./AUTHENTICATION.md). State, data fetching, and styling conventions are documented in:

- [State management](./STATE_MANAGEMENT.md)
- [Components and styling](./COMPONENTS_AND_STYLING.md)
- [Performance](./PERFORMANCE.md)

No second "source of truth" for folder names lives here -- always align with [Project structure](./PROJECT_STRUCTURE.md).

---

## 3. Governed UI architecture (`packages/shadcn-ui-deprecated`)

The `@afenda/shadcn-ui-deprecated` package (`packages/shadcn-ui-deprecated/`) is the **governed UI stack**: shadcn/ui primitives and the constant and policy layer. It sits between raw business domain types (from `@afenda/core`) and feature code in `apps/web`, so UI decisions flow through validated, schema-checked contracts.

### 3.1 Package topology

```text
packages/shadcn-ui-deprecated/src/
├── index.ts                        # Package entry
├── index.css                       # Package styles
│
├── components/ui/                  # shadcn/ui copy-in primitives (56 components)
│   ├── button.tsx                  #   consumes buttonDefaults from constant layer
│   ├── card.tsx                    #   consumes cardDefaults, CardSurface, CardPadding
│   └── ...
│
├── lib/
│   ├── utils.ts                    # cn() merge utility
│   └── constant/                   # THE GOVERNED CONSTANT LAYER
│       ├── index.ts                #   Barrel (all exports below)
│       ├── governance-version.ts   #   Version lock for cross-script validation
│       ├── rule-policy.ts          #   UIX-* rule codes and severity
│       ├── validate-constants.ts   #   Runtime consistency validator
│       │
│       ├── schema/                 #   defineConstMap, defineTuple, defineComponentContract
│       ├── foundation/             #   Tokens: accessibility, density, elevation, motion, radius, typography
│       ├── semantic/               #   Cross-component vocabularies: tone, emphasis, surface, intent, severity, status
│       ├── component/              #   Per-component contracts (59 files, one per UI primitive)
│       ├── domain/                 #   Domain-specific constants: allocation, settlement, reconciliation, invariant
│       ├── policy/                 #   Governance policies (12 files): ownership, tailwind, radix, shadcn, import, etc.
│       ├── registry/               #   Component and semantic registries
│       └── pattern/                #   Reusable layout patterns (page-header)
```

The former top-level `semantic/` adapter (`@afenda/shadcn-ui-deprecated/semantic`) was removed; migrate ERP semantic UI to the canonical design system / new repo. `lib/constant/` remains the governed vocabulary layer.

### 3.2 Dependency flow

Data flows in one direction through five layers:

```text
Domain State (business logic from @afenda/core)
   |  AllocationState, InvariantSeverity, ReconciliationStatus, SettlementState
   v
Semantic Adapter Layer (src/semantic/domain/*)
   |  Maps domain states to UI models (tone, badgeLabel, icon, role)
   v
Semantic Primitives (src/semantic/primitives/*)
   |  Shared vocabulary: tone, emphasis, surface, density, size, state
   v
Presentation Utilities (src/semantic/internal/presentation.ts)
   |  Translates primitives to CSS classes and icon nodes
   v
UI Components (src/components/ui/* + src/semantic/components/*)
      Render alerts, badges, cards, panels using governed contracts
```

**Governance bracket:** `validate-constants.ts` cross-checks every layer at module load time, ensuring no adapter references a tone, emphasis, or surface value that is not registered in the primitives, and no primitive contradicts the component contracts.

### 3.3 Component contract structure

Every governed UI component has a three-part contract defined in `src/lib/constant/component/<name>.ts`:

1. **Vocabularies** -- canonical value tuples (what values are legal for each dimension)
2. **Defaults** -- Zod-validated fallback prop values
3. **Policy** -- boolean governance flags that prevent feature-level drift

The `.tsx` component file imports its defaults and types from the contract, never repeating literal values. See [`component/_TEMPLATE.ts`](../packages/shadcn-ui-deprecated/src/lib/constant/component/_TEMPLATE.ts) for the full pattern.

### 3.4 Governance pipeline

Three governance scripts run in sequence via `pnpm run script:ui-drift-governance`:

| Layer | Script | What it catches |
|-------|--------|-----------------|
| **0 -- Token drift** | `check-ui-drift.ts` | Raw color classes, arbitrary values, inline style violations in UI packages |
| **1 -- Feature drift** | `check-ui-drift-ast.ts` | Raw Tailwind in feature code, ungoverned imports, local wrapper factories |
| **2 -- Wrapper contracts** | `check-ui-wrapper-contracts.ts` | Swallowed props/ref, primitive replacement, asChild drift, local state takeover |

Additional pipeline: `pnpm run script:ui-color-governance` validates OKLCH stem sync and color consistency.

---

## 4. Adding a new ERP module

When adding a new business domain (e.g. Purchase Orders, HR, Procurement), the architecture is designed so new modules plug in at a single adapter file without touching the rest of the pyramid.

### Step 1 -- Feature folder

Create `apps/web/src/features/<module-name>/` following the [feature module pattern](./PROJECT_STRUCTURE.md#feature-module-pattern):

```text
src/features/purchase-orders/
├── components/
│   └── PurchaseOrderView.tsx
├── hooks/
│   ├── index.ts
│   └── use-purchase-order-action-bar.ts
└── index.ts
```

### Step 2 -- Route registration

Add the route in `apps/web/src/share/routing/feature-routes.tsx`:

```tsx
{ path: '/app/purchase-orders', element: <PurchaseOrderView /> }
```

### Step 3 -- Domain types

Add domain state types to `packages/features/core/src/` if they need to be shared across packages. Otherwise keep them local to the feature folder.

### Step 4 -- Semantic adapter (when domain states need visual mapping)

Create `packages/shadcn-ui-deprecated/src/semantic/domain/<module>.ts`:

```ts
import type { Tone } from '../primitives/tone'

export type PurchaseOrderStatus = 'draft' | 'submitted' | 'approved' | 'received'

export function getPurchaseOrderTone(status: PurchaseOrderStatus): Tone {
  const map: Record<PurchaseOrderStatus, Tone> = {
    draft: 'neutral',
    submitted: 'info',
    approved: 'positive',
    received: 'positive',
  }
  return map[status]
}
```

Export from `packages/shadcn-ui-deprecated/src/semantic/index.ts`.

### Step 5 -- Domain constants (when governed status/variant mappings are needed)

Create `packages/shadcn-ui-deprecated/src/lib/constant/domain/<module>.ts` and register the export in `packages/shadcn-ui-deprecated/src/lib/constant/index.ts` (alphabetical order).

### Step 6 -- Action bar hook

Create `src/features/<module>/hooks/use-<module>-action-bar.ts` following the existing `useFinanceActionBar` pattern to register module-specific action bar tabs.

### Step 7 -- i18n namespace

Add translation files under `apps/web/src/share/i18n/locales/{en,id,ms,vi}/<module>.json` and register the namespace.

### Step 8 -- Validation

Run the governance pipeline to confirm zero new violations:

```sh
pnpm run script:ui-drift-governance    # token + AST + wrapper contract checks
pnpm run script:check-afenda-config    # workspace structure validation
pnpm run typecheck                     # TypeScript
pnpm run lint                          # ESLint
```

### What you do NOT need to do

- Modify `validate-constants.ts` -- it auto-discovers registered constants
- Touch `presentation.ts` -- semantic components use primitive lookup, not per-module code
- Create new CSS utility classes -- use existing `ui-*` vocabulary ([Components and styling](./COMPONENTS_AND_STYLING.md#approved-app-vocabulary))
- Add new component contracts -- unless the module introduces a genuinely new UI primitive

---

## Related docs

- [Documentation scope](./DOCUMENTATION_SCOPE.md) -- Which docs are normative vs optional
- [API reference](./API.md) -- REST contract (`/api/tenants/{tenant}/...`) for the HTTP server
- [Project structure](./PROJECT_STRUCTURE.md) -- **application** layout under `apps/web`
- [Monorepo boundaries](./MONOREPO_BOUNDARIES.md) -- machine-enforced root, **`apps/web/src`** topology (`webClientSrc`), feature template, and shared-package rules
- [Architecture evolution](./ARCHITECTURE_EVOLUTION.md) -- Trigger-based policy for upgrade timing and ADR ownership
- [Authentication](./AUTHENTICATION.md) -- Vite SPA patterns, BFF / Auth0, API checks
- [Roles and permissions](./ROLES_AND_PERMISSIONS.md) -- RBAC + PBAC, DB-backed checks, UI vs API
- [Database](./DATABASE.md) -- PostgreSQL + Drizzle (API/worker only; not in Vite)
- [Deployment](./DEPLOYMENT.md) -- Vercel static client + external API/DB
- [Glossary](./GLOSSARY.md) -- shared vocabulary (client vs server, tenant, ERP concepts)
- [Integrations](./INTEGRATIONS.md) -- OAuth to third-party APIs from the backend
- [Brand guidelines](./BRAND_GUIDELINES.md) / [Design system](./DESIGN_SYSTEM.md) -- ERP UI identity and tokens
- [Project configuration](./PROJECT_CONFIGURATION.md) -- ESLint, Prettier, TypeScript, tooling
- [AGENTS.md](../AGENTS.md) -- AI and contributor execution guide
