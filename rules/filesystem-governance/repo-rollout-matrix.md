# Repo Rollout Matrix

## Purpose

This matrix defines how the monorepo should be governed by zone so refactors remain consistent and do not drift back into generic structures.

## Web App

### `apps/web/src/app`

Purpose:

- authenticated ERP product surface

Allowed ownership model:

- `_features/` for business capability modules
- `_platform/` for app runtime infrastructure

Rules:

- no nested `share/` or `shared/`
- no generic `utils/`, `helpers/`, `sections/`, `content/`
- prefer owner-prefixed file names
- max depth: 4 meaningful directories below the governed root

Examples:

- `inventory-workspace-page.tsx`
- `order-command-service.ts`
- `tenant-scope-context.tsx`

### `apps/web/src/share`

Purpose:

- the only promoted shared layer for the web app

Rules:

- only code reused by unrelated owners belongs here
- feature-private code must not be promoted here
- the directory should be screened before becoming a governed root

Admission checklist:

- imported by at least two unrelated owners
- name still makes sense outside the original owner
- stable enough to behave like a public app-local contract

### `apps/web/src/marketing`

Purpose:

- public-facing editorial and brand surfaces

Rules:

- page-owned modules use the page prefix
- content and editorial files contain structured data, not render logic
- route or page shells do not absorb copy contracts and motion helpers into one file

Examples:

- `flagship-page.tsx`
- `flagship-page-editorial.ts`
- `flagship-page-panels.tsx`
- `flagship-page-motion.ts`

### `apps/web/src/routes`

Purpose:

- route registration and route-owned shells

Rules:

- keep business logic in features or platform owners
- avoid vague route helper files
- route files should explain navigation ownership from the file name alone

### `apps/web/src/rpc`

Purpose:

- typed client/runtime bridge for remote contracts

Rules:

- name files by transport or contract responsibility
- avoid turning this into a misc integration layer

## API App

### `apps/api/src/modules`

Purpose:

- primary backend ownership boundary for business capability code

Rules:

- prefer module-local files over generic technical buckets
- handler, service, contract, and persistence support should stay close to the owning module
- cross-module imports should target deliberate public entry points only

### `apps/api/src/routes`

Purpose:

- HTTP route composition

Rules:

- route files wire modules to transport
- business rules should not live here

### `apps/api/src/middleware`

Purpose:

- cross-cutting HTTP concerns

Rules:

- request context, auth gates, logging, and transport policy belong here
- avoid business-domain helpers here

### `apps/api/src/lib`

Purpose:

- infrastructure primitives only

Rules:

- this is the highest-risk backend dumping ground
- if a file is business-shaped, move it to `modules/`
- if a file is transport-shaped, move it to `routes/` or `middleware/`

## Packages

### `packages/contracts`

Purpose:

- cross-runtime schemas and contract types

Rules:

- names must reflect domain contract ownership
- avoid generic `types`, `utils`, or `helpers` buckets without a real package-level rationale

### `packages/design-system`

Purpose:

- shared UI primitives and governed visual contracts

Rules:

- package-local helpers should be responsibility-named
- `utils/` at package root should be reviewed and renamed when the files are not truly generic

### `packages/_database`

Purpose:

- schema, query, and persistence primitives

Rules:

- helper folders must be justified by database responsibility, not convenience
- prefer names such as `query-normalizers`, `schema-env`, or `row-shaping` over generic `helpers`

## Naming Standard

Rules:

- minimum: 2 semantic labels
- preferred: 2 to 3 semantic labels
- maximum: 4 semantic labels
- do not add filler labels just to satisfy a count

Good:

- `flagship-page.tsx`
- `flagship-page-panels.tsx`
- `api-client-config.ts`
- `platform-capability-metadata.ts`

Bad:

- `content.ts`
- `sections.tsx`
- `utils.ts`
- `wrapper.tsx`
- `flagship-page-wrapper.tsx`

## Rollout Order

Recommended order:

1. `apps/web/src/share`
2. `apps/web/src/routes`
3. `apps/web/src/rpc`
4. `apps/api/src/modules`
5. `apps/api/src/lib`
6. `packages/design-system`
7. `packages/_database`
8. `packages/contracts`
