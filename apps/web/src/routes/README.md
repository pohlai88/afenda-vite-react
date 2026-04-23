# `src/routes`

**Route modules** (`route-*.tsx`) define React Router **`RouteObject`** trees for this Vite app. **Page UI** (screens, layouts) lives under `src/pages/` and `src/app/`; this folder only **wires** those components into the router.

## Router usage (definition)

| Piece                                 | Role                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[`src/router.tsx`](../router.tsx)** | **Single** place that calls `createBrowserRouter`. Exports **`router`** (pass to `RouterProvider`) and **`browserRoutes`** (full `RouteObject[]` for tests or tooling). `RouteHandle` augmentation lives in [`../app/_platform/shell/shell-route-handle.ts`](../app/_platform/shell/shell-route-handle.ts); the router itself only composes route modules. Computes **`basename`** from `import.meta.env.BASE_URL` so client routes match Vite [`base`](https://vite.dev/config/shared-options.html#base). |
| **`route-*.tsx` in this folder**      | Export **arrays or objects** only (`marketingRouteObjects`, `appShellRouteObject`). No second `createBrowserRouter`.                                                                                                                                                                                                                                                                                                                                                                                       |
| **[`src/App.tsx`](../App.tsx)**       | Renders `<RouterProvider router={router} />` (from `../router`) inside `Suspense` / error boundary.                                                                                                                                                                                                                                                                                                                                                                                                        |
| **[`src/main.tsx`](../main.tsx)**     | Bootstraps React; does **not** import route modules directly—only mounts `<App />`.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **[`index.ts`](./index.ts)**          | Optional **barrel**: re-exports `router`, `browserRoutes`, and individual route modules for consumers that prefer a single import path.                                                                                                                                                                                                                                                                                                                                                                    |

**Flow:** `main` → `App` → `RouterProvider(router)` → URL matches a child of `browserRoutes` (marketing at `/`, auth at `/auth/*`, or ERP shell at `/app/*`).

## Naming

Filenames use the **`route-*.tsx`** prefix so route modules group clearly in the tree and stay distinct from [`router.tsx`](../router.tsx) (the app root orchestrator).

## Files

| File                                                                     | Role                                                                                                         |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| [`../marketing/marketing-routes.tsx`](../marketing/marketing-routes.tsx) | Standalone marketing routes under `/` and `/marketing/*` (no auth or ERP shell).                             |
| [`route-app-shell.tsx`](./route-app-shell.tsx)                           | Subtree for **`/app/*`**: `AppShellLayout`, feature pages, splat not-found.                                  |
| [`index.ts`](./index.ts)                                                 | Re-exports route modules and [`router` / `browserRoutes`](../router.tsx) for consumers that prefer a barrel. |

## Shell metadata

`handle.shell` is the governed contract for shell chrome under `/app/*`.

**Source of truth:** [`app/_platform/shell/routes/shell-route-definitions.ts`](../app/_platform/shell/routes/shell-route-definitions.ts) — `ShellRouteMetadata`, `shellRouteMetadataList`, child segments, layout, and not-found metadata. Route composition should use the curated [`shell-route-surface.ts`](../app/_platform/shell/shell-route-surface.ts); the root [`shell/index.ts`](../app/_platform/shell/index.ts) is not the route-metadata surface.

**Router wiring:** [`route-app-shell.tsx`](./route-app-shell.tsx) maps definitions to `RouteObject`s (elements, `handle`). Stay aligned with the canonical list (Vitest: `_platform/shell/__tests__/route-app-shell-parity.test.ts`). Do not fork breadcrumb or nav shape in this folder.

**In-app shell:** Layout, feature children, and the `/app/*` splat not-found must carry governed `handle.shell` from definitions.

**Outside shell:** Marketing and auth routes do not mount `AppShellLayout`; they declare `handle: { shell: null }` so policy is explicit. See [`../marketing/marketing-routes.tsx`](../marketing/marketing-routes.tsx) and [`../app/_platform/auth/routes/route-auth.tsx`](../app/_platform/auth/routes/route-auth.tsx).

Shell metadata ownership applies to the governed `/app/*` runtime, not to every route in the app.

## Governance

- **Invariant catalog:** Field checks live in `validateShellMetadata`; governed truth uses stable `SHELL_INV_*` codes (`contract/shell-invariant-codes.ts`). `collectShellRouteCatalogIssues` / `assertShellRouteCatalog` combine catalog, system, and router-scope rules into `ShellInvariantIssue`. Vitest covers this; CI runs `pnpm --filter @afenda/web shell:validation-report`, which writes [`.artifacts/reports/shell-governance/shell-metadata-validation-report.json`](../../../../.artifacts/reports/shell-governance/shell-metadata-validation-report.json) (gitignored; see [`docs/REPO_ARTIFACT_POLICY.md`](../../../../docs/REPO_ARTIFACT_POLICY.md)).

## Adding routes

1. **Marketing-only path** (no shell): extend [`../marketing/marketing-routes.tsx`](../marketing/marketing-routes.tsx) with `handle: { shell: null }`.
2. **Auth-only path** (no shell): extend [`../app/_platform/auth/routes/route-auth.tsx`](../app/_platform/auth/routes/route-auth.tsx) with `handle: { shell: null }`.
3. **Authenticated ERP area under `/app`**:
   - Update [`shell-route-definitions.ts`](../app/_platform/shell/routes/shell-route-definitions.ts) and wire the page in [`route-app-shell.tsx`](./route-app-shell.tsx) (often via the shared child-route map there).
4. **New top-level segment** (e.g. a second product shell): add a dedicated `route-*.tsx` module, import it from [`router.tsx`](../router.tsx), and append it to the `browserRoutes` array in the right order.

## Normative docs

- App shell behavior: [`app/_platform/shell/README.md`](../app/_platform/shell/README.md)
- Monorepo index: [`docs/README.md`](../../../../docs/README.md)

## Validation (from repo root)

```bash
pnpm run lint
pnpm run typecheck
pnpm run test:run
pnpm run build
pnpm --filter @afenda/web shell:validation-report
```

Use the scripts your workspace exposes; the `apps/web` package participates via the root Turborepo pipeline.
