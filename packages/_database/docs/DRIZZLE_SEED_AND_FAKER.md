# Drizzle Seed and Faker (Afenda)

This package uses **[drizzle-seed](https://orm.drizzle.team/docs/seed-overview)** for deterministic synthetic rows and **[@faker-js/faker](https://fakerjs.dev/)** for auxiliary randomness when needed. Both are **server-only** (run via `pnpm db:seed`, never from Vite).

## Overview

- **drizzle-seed** — pRNG-driven generators (`email`, `json`, `weightedRandom`, …) tied to your Drizzle schema; supports **`seed()`**, **`reset()`**, and **`.refine()`**.
- **Faker** — optional; call **`seedFakerDeterministic()`** (or `faker.seed(n)`) so hybrid modules stay reproducible alongside drizzle-seed’s `options.seed`.

Central constants live in:

- [`src/seeds/drizzle-seed-config.ts`](../src/seeds/drizzle-seed-config.ts) — `DRIZZLE_SEED_GENERATOR_VERSION`, `DRIZZLE_SYNTHETIC_PRNG_SEED`, re-exports `drizzleSeed` / `drizzleReset` / `getGeneratorsFunctions`.
- [`src/seeds/faker-seed.ts`](../src/seeds/faker-seed.ts) — `seedFakerDeterministic`, `withDeterministicFaker`.

## Installation

Already declared on `@afenda/database`:

- `drizzle-seed`
- `@faker-js/faker`
- `drizzle-orm` (peer)

## Basic usage

```ts
import { drizzleSeed } from "@afenda/database/seeds" // or ../drizzle-seed-config
import * as schema from "./schema"

await drizzleSeed(db, schema, { seed: 12345, count: 10 })
```

Afenda’s **volume** example: [`src/seeds/volume/seed-synthetic-tenant-settings.ts`](../src/seeds/volume/seed-synthetic-tenant-settings.ts).

## Options (`seed(db, schema, options)`)

| Option    | Purpose |
| --------- | ------- |
| `count`   | Default number of rows per table (when not overridden in `refine`). |
| `seed`    | pRNG seed — same seed + same script ⇒ same data. |
| `version` | Generator API version — use **`"2"`** (`DRIZZLE_SEED_GENERATOR_VERSION`) for current generators. |

## Reset database

Use **`drizzleReset(db, schema)`** (truncates Drizzle-modeled tables). The CLI script `db:reset:local` calls this on **`afendaDrizzleSchema`** with env gates (`SEED_RESET_LOCAL`, `SEED_ENV=local`).

**Note:** `reset` affects tables in the schema object you pass; Better Auth tables outside this bundle are untouched.

## Refinements

Chain **`.refine((funcs) => ({ tableName: { count, columns: { ... } } }))`** to pick generators per column. `funcs` matches **`getGeneratorsFunctions()`** (version **`2`** when `version: "2"` is set).

## Weighted random

Use **`funcs.weightedRandom([{ weight, value: funcs.int({...}) }, ...])`** per [Drizzle docs](https://orm.drizzle.team/docs/seed-overview).

## Generators (reference)

The upstream API includes: `valuesFromArray`, `intPrimaryKey`, `number`, `int`, `boolean`, `date`, `time`, `timestamp`, `datetime`, `year`, `json`, `interval`, `string`, `uuid`, `firstName`, `lastName`, `fullName`, `email`, `phoneNumber`, `country`, `city`, `streetAddress`, `jobTitle`, `postcode`, `state`, `companyName`, `loremIpsum`, `point`, `line`, `bitString`, `inet`, `geometry`, `vector`, `weightedRandom`, `default`, etc. See **`drizzle-seed`** `index.d.ts` and [official docs](https://orm.drizzle.team/docs/seed-overview).

## Limitations

- Requires **drizzle-orm ≥ 0.36.4** (see drizzle-seed README).
- Complex FK graphs may need **narrow schema slices** or careful **refine** ordering.
- **Volume** stage is policy-limited to **local / ci** in this repo.

## Faker alignment

```ts
import { seedFakerDeterministic, DRIZZLE_SYNTHETIC_PRNG_SEED } from "@afenda/database/seeds"

seedFakerDeterministic() // same default as DRIZZLE_SYNTHETIC_PRNG_SEED intent
// then call faker.* APIs
```

Use the same numeric seed for both systems when a single module uses drizzle-seed and Faker together.
