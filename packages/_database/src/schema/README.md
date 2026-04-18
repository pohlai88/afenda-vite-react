# Schema (`packages/_database/src/schema/`)

Canonical **Drizzle DDL** and related building blocks for `@afenda/database`. Runtime truth is PostgreSQL plus migration history under `packages/_database/drizzle/` (gitignored until you generate SQL).

**Charter:** [`docs/guideline/001-postgreSQL-DDL.md`](../../docs/guideline/001-postgreSQL-DDL.md) · **Tree / placement:** [`docs/guideline/008-db-tree.md`](../../docs/guideline/008-db-tree.md) · **Discipline:** [`docs/practical-discipline.md`](../../docs/practical-discipline.md).

---

## Main barrel (`index.ts`)

Import the merged schema graph as:

```ts
import { … } from "@afenda/database/schema"
```

[`index.ts`](./index.ts) re-exports, in order:

| Export | PostgreSQL / role |
| --- | --- |
| [`finance/`](./finance/) | `finance.*` — COA, GL, fiscal calendars / periods, LE↔COA |
| [`governance/`](./governance/) | `governance.*` — data sources; **also** re-exports 7W1H audit DDL from [`src/7w1h-audit/`](../7w1h-audit/) for Drizzle Kit |
| [`iam/`](./iam/) | `iam.*` — accounts, identities, memberships, roles, policies, auth challenges |
| [`mdm/`](./mdm/) | `mdm.*` — tenants, parties, items, org graph, sequences, … |
| [`ref/`](./ref/) | `ref.*` — countries, currencies, locales, timezones, UoM |
| [`shared/`](./shared/) | Cross-domain `pgEnum`, column fragments, Zod (`shared-boundary`) |
| [`../views/`](../views/) | `mdm.*` **views** (`pgView`) — canonical read models |

New **domain tables** must be added under the right `pgSchema` folder, exported from that domain’s `index.ts`, and included in **`schema/index.ts`** so Drizzle Kit sees them.

---

## Other folders under `schema/` (not all in `schema/index.ts`)

These are **supporting** surfaces; some are re-exported from the **package root** [`src/index.ts`](../index.ts) or dedicated export paths:

| Folder | Role |
| --- | --- |
| [`constants/`](./constants/) | `DATABASE_URL` / pool env key names + defaults (`runtime.ts`) — used by [`client.ts`](../client.ts) |
| [`helpers/`](./helpers/) | `readOptionalInteger`, optional integer Zod — env/config boundaries |
| [`identity/`](./identity/) | Better Auth ↔ Afenda **bootstrap**; re-exports IAM tables + `ensureIdentityLinkForBetterAuthUser` |
| [`tenancy/`](./tenancy/) | Active-tenant / “me” **services** + Zod; re-exports `tenant_memberships` + `tenants` — **`@afenda/database/tenancy`** |
| [`pkg-governance/`](./pkg-governance/) | Migration filenames, PG identifier helpers, `*.schema.ts` convention — **`@afenda/database/governance`** |

Do **not** add new **DDL tables** under `identity/`, `tenancy/`, `helpers`, or `constants` unless the charter explicitly allows it — those folders are barrels, env helpers, or tooling (see practical discipline).

---

## PostgreSQL schemas (Drizzle-managed)

Registered list: [`pkg-governance/constants.ts`](./pkg-governance/constants.ts) (`DRIZZLE_MANAGED_PG_SCHEMAS`) — must stay aligned with `drizzle.config.ts` `schemaFilter`.

---

## Conventions

- **DDL modules:** `*.schema.ts` (and domain `_schema.ts` for `pgSchema("…")`) — see [`pkg-governance/schema-modules.ts`](./pkg-governance/schema-modules.ts).
- **Zod-only files:** may use `.schema.ts` for `guard-schema-modules` / naming parity; not emitted as standalone SQL (e.g. `*-boundary.schema.ts`).
- **Annotation envelope:** shared header pattern on modules (timestamp + `This module: src/schema/…`).

---

## Related paths (sibling of `schema/`)

| Path | Role |
| --- | --- |
| [`src/7w1h-audit/`](../7w1h-audit/) | 7W1H audit DDL + services — **`@afenda/database/7w1h-audit`** |
| [`src/relations/`](../relations/) | Drizzle `relations()` graph — **`@afenda/database/relations`** |
| [`src/queries/`](../queries/) | Query helpers |

---

## Inventory

Regenerate the machine list when the tree changes:

`pnpm run db:inventory:sync` in `packages/_database` → [`docs/guideline/schema-inventory.json`](../../docs/guideline/schema-inventory.json).
