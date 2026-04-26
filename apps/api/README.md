# @afenda/api

Afenda's live HTTP API runs in this package on **Hono** with the Node adapter.
It is no longer a minimal scaffold. The active surface includes auth companion routes,
shell bootstrap, governed command execution, operations reads, and a lightweight typed-client demo surface.

## Live stack

| Layer        | Choice                                               |
| ------------ | ---------------------------------------------------- |
| Runtime      | Node.js via `@hono/node-server`                      |
| Transport    | Hono                                                 |
| Validation   | Zod + `@hono/zod-validator`                          |
| Auth runtime | Better Auth via `@afenda/better-auth` integration    |
| Data access  | `@afenda/database` + Drizzle-backed packages         |
| Typed client | `hono/client` using `AppType` from `@afenda/api/app` |

## Source of truth

- Narrative API contract: [`../../docs/API.md`](../../docs/API.md)
- Generated route inventory: [`../../docs/architecture/governance/generated/api-route-surface.md`](../../docs/architecture/governance/generated/api-route-surface.md)
- Authentication posture: [`../../docs/AUTHENTICATION.md`](../../docs/AUTHENTICATION.md)

If this README and the mounted Hono app disagree, [`src/app.ts`](./src/app.ts) wins.

## Current layout

- `src/app.ts`: canonical app composition and mounted route tree
- `src/index.ts`: server bootstrap and shutdown wiring
- `src/routes/`: transport surfaces for auth, me, commands, ops, health, and users
- `src/command/`: governed command contracts, registry, matrix, and execution orchestration
- `src/modules/operations/`: operations read models, state machine, and command handlers
- `src/modules/users/`: typed-client demo surface backed by an in-memory repository
- `src/middleware/`: request context, Better Auth session context, and error handling
- `src/truth/` and `src/workflow/`: truth-record and workflow transition support
- `src/contract/` and `src/lib/`: shared HTTP contracts, envelopes, env, logging, and helpers

## Mounted route groups

- `GET /`
- `GET /health`
- `/api/auth/*`
- `/api/v1/auth/*`
- `GET /api/v1/me`
- `/api/v1/mdm/*`
- `POST /api/v1/commands/execute`
- `POST /api/v1/legacy-erp/ingest`
- `POST /api/v1/legacy-erp/pull/counterparties`
- `POST /api/v1/legacy-erp/pull/items`
- `POST /api/v1/legacy-erp/transform`
- `/api/v1/ops/*`
- `/api/users`

For the exact method and path inventory, use the generated route surface document instead of duplicating it here.

## Development

From repo root:

```bash
pnpm --filter @afenda/api dev
```

Default port is `8787` when `PORT` is unset.

Useful checks:

```bash
pnpm --filter @afenda/api lint
pnpm --filter @afenda/api typecheck
pnpm --filter @afenda/api test:run
pnpm run script:generate-api-route-surface
```

## Housekeeping notes

- The `/api/users` surface is intentionally lightweight and uses an in-memory repository for typed-client regression coverage.
- Operations transport now uses `counterparty` vocabulary externally even where some persistence remains on legacy partner identifiers internally.
- `/api/v1/legacy-erp/transform` is an admin-gated anti-corruption seam for stable legacy payload ingestion and Afenda-shape normalization.
- `/api/v1/legacy-erp/ingest` is the first digest-and-persist seam: counterparties and items are written through canonical MDM ownership, while journals remain candidate-only until finance is live.
- `/api/v1/legacy-erp/pull/counterparties` is the first connector-backed intake seam: it fetches paginated legacy TPM `customers` over HTTP, transforms them into Afenda counterparties, and persists them through MDM.
- `/api/v1/legacy-erp/pull/items` extends that pattern for legacy MRP `products`: it fetches paginated item master records, normalizes them into Afenda item intake records, and persists them through `/api/v1/mdm/items`.
- There is no dedicated payment or billing route surface mounted in the live API today. If payment flows are introduced, they should land as an explicit bounded surface rather than being hidden inside operations transport.

## File envelope

See repo-root [`ENVELOPE.md`](../../ENVELOPE.md).
