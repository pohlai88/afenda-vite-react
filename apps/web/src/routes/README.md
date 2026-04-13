# `src/routes`

**Single place** for React Router **route objects** in this Vite app. The factory that calls `createBrowserRouter` stays next to the app root in [`src/router.tsx`](../router.tsx); it only imports [`browserRoutes`](./route-browser.tsx) and applies global router concerns (for example shell `RouteHandle` typing).

## Naming

Filenames use the **`route-*.tsx`** prefix so route modules group clearly in the tree and stay distinct from [`router.tsx`](../router.tsx) (the orchestrator only).

## Files

| File                                           | Role                                                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [`route-browser.tsx`](./route-browser.tsx)     | **Aggregated tree** passed to `createBrowserRouter` — composes root routes + app shell.                              |
| [`route-root.tsx`](./route-root.tsx)           | Top-level routes **outside** the authenticated shell: `/` (marketing), `/app/login` (transitional auth placeholder). |
| [`route-app-shell.tsx`](./route-app-shell.tsx) | Subtree for **`/app/*`**: `AppShellLayout`, feature pages, splat not-found.                                          |
| [`index.ts`](./index.ts)                       | Re-exports for consumers that prefer a barrel (`browserRoutes`, `rootRouteObjects`, `appShellRouteObject`).          |

## Shell metadata

`handle.shell` is the governed contract for shell chrome under `/app/*`.

**Source of truth:** [`app/_platform/shell/routes/shell-route-definitions.ts`](../app/_platform/shell/routes/shell-route-definitions.ts) — `ShellRouteMetadata`, `shellRouteMetadataList`, child segments, layout, and not-found metadata. The public barrel [`shell/index.ts`](../app/_platform/shell/index.ts) (`@/app/_platform/shell`) re-exports those symbols for stable imports.

**Router wiring:** [`route-app-shell.tsx`](./route-app-shell.tsx) maps definitions to `RouteObject`s (elements, `handle`). Stay aligned with the canonical list (Vitest: `_platform/shell/__tests__/route-app-shell-parity.test.ts`). Do not fork breadcrumb or nav shape in this folder.

**In-app shell:** Layout, feature children, and the `/app/*` splat not-found must carry governed `handle.shell` from definitions.

**Outside shell:** Marketing and auth entry routes do not mount `AppShellLayout`; they declare `handle: { shell: null }` so policy is explicit. See [`route-root.tsx`](./route-root.tsx).

Shell metadata ownership applies to the governed `/app/*` runtime, not to every route in the app.

## Governance

- **Invariant catalog:** Field checks live in `validateShellMetadata`; governed truth uses stable `SHELL_INV_*` codes (`contract/shell-invariant-codes.ts`). `collectShellRouteCatalogIssues` / `assertShellRouteCatalog` combine catalog, system, and router-scope rules into `ShellInvariantIssue`. Vitest covers this; CI runs `pnpm --filter @afenda/web shell:validation-report`, which writes [`.artifacts/reports/shell-governance/shell-metadata-validation-report.json`](../../../../.artifacts/reports/shell-governance/shell-metadata-validation-report.json) (gitignored; see [`docs/REPO_ARTIFACT_POLICY.md`](../../../../docs/REPO_ARTIFACT_POLICY.md)).

## Adding routes

1. **Marketing or auth-only path** (no shell): extend [`route-root.tsx`](./route-root.tsx) with `handle: { shell: null }` unless the route participates in shell chrome (it should not for these).
2. **Authenticated ERP area under `/app`**:
   - Update [`shell-route-definitions.ts`](../app/_platform/shell/routes/shell-route-definitions.ts) and wire the page in [`route-app-shell.tsx`](./route-app-shell.tsx) (often via the shared child-route map there).
3. **New top-level segment** (e.g. a second product shell): add a dedicated `route-*.tsx` module, then import and compose it inside [`route-browser.tsx`](./route-browser.tsx) in the right order.

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
