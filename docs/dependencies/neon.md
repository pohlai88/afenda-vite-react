# Neon guide (Afenda)

This document describes how **Afenda** expects to use **[Neon](https://neon.tech/)** for **hosted PostgreSQL** (branching, pooled connections, `DATABASE_URL`) with **server-side** Drizzle — never from the Vite client.

**Docs index:** [neon.tech/docs](https://neon.tech/docs) mirrors the canonical **[Neon documentation](https://neon.com/docs)** (same content; links below use **`neon.com`** for stability).

**Status:** **Planned / recommended** for **hosted PostgreSQL** — not a dependency in **`apps/web`**. Mentioned in [Deployment](../DEPLOYMENT.md) as a typical provider alongside [Database](../DATABASE.md).

**Official documentation:**

- [Neon documentation](https://neon.com/docs)
- [Connect your stack](https://neon.com/docs/get-started/connect-neon) — frameworks, ORMs, snippets
- [Connect from any application](https://neon.com/docs/connect/connect-from-any-app) — connection string from the console, SSL
- [Choosing a connection](https://neon.com/docs/connect/choose-connection) — drivers and deployment shape
- [Connection pooling](https://neon.com/docs/connect/connection-pooling) — **`-pooler`** host suffix, when to use pooled vs direct
- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver) — **`@neondatabase/serverless`**, HTTP vs WebSocket / **`Pool`**
- [Drizzle ORM + Neon](https://neon.com/docs/guides/drizzle) — **`drizzle-orm/neon-http`**, **`drizzle-orm/neon-serverless`**
- [Branching — get started](https://neon.com/docs/guides/branching-intro) · [About branching](https://neon.com/docs/introduction/branching)
- [Neon-managed Vercel integration](https://neon.com/docs/guides/neon-managed-vercel-integration) — preview branches, env vars
- [Vercel-managed integration](https://neon.com/docs/guides/vercel-managed-integration) — comparison, **`DATABASE_URL` / `DATABASE_URL_UNPOOLED`**
- [Neon CLI](https://neon.com/docs/reference/neon-cli) · guided setup: `npx neonctl@latest init`
- [@neondatabase/serverless (GitHub)](https://github.com/neondatabase/serverless) · [Neon server (GitHub)](https://github.com/neondatabase/neon)

---

## How we use Neon

| Topic                 | Convention                                                                                                                                                                                                                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Connection**        | **`DATABASE_URL`** — **server-only**, never `VITE_*` ([Database](../DATABASE.md) §2)                                                                                                                                                                                                                                                                         |
| **Pooling**           | Console defaults to **pooled** strings (**`-pooler`** in the host). Use them for **serverless** / high concurrency; use a **direct** string (toggle off pooling in the console, or **`DATABASE_URL_UNPOOLED`** from Vercel integrations) when a tool needs a **non-pooled** session ([Connection pooling](https://neon.com/docs/connect/connection-pooling)) |
| **Drivers / Drizzle** | Prefer **`drizzle-orm/neon-http`** + **`neon()`** or **`drizzle-orm/neon-serverless`** + **`Pool`** per workload—see [Drizzle ORM](./drizzle-orm.md) and [Neon’s Drizzle guide](https://neon.com/docs/guides/drizzle)                                                                                                                                        |
| **Migrations**        | Same as any Postgres: **Drizzle Kit** in **`packages/_database`** (`@afenda/database`) ([Drizzle ORM](./drizzle-orm.md)); if a migrator misbehaves through the pooler, run against a **direct** URL                                                                                                                                                          |
| **Previews**          | **Branch per preview** via **[Neon-managed Vercel](https://neon.com/docs/guides/neon-managed-vercel-integration)** (or equivalent automation) — [Deployment](../DEPLOYMENT.md)                                                                                                                                                                               |

---

## Red flags

- Pointing **local dev** at **production** Neon without guardrails.
- **Embedding** `DATABASE_URL` in client env.
- Assuming **one** connection string for everything—**pooled** for app traffic, **direct** when docs or tooling require it ([Vercel env vars](https://neon.com/docs/guides/neon-managed-vercel-integration#environment-variables)).

---

## Related documentation

- [Database](../DATABASE.md)
- [Deployment](../DEPLOYMENT.md)
- [Drizzle ORM](./drizzle-orm.md)

**External:** [neon.com/docs](https://neon.com/docs) · [Neon console](https://console.neon.tech/)

**Context7 (AI doc refresh):** **`Neon`** → **`/websites/neon`** (broad) or **`/llmstxt/neon_llms_txt`**; **`@neondatabase/serverless`** → **`/neondatabase/serverless`**. Then **`query-docs`** for pooling, serverless driver, Drizzle, Vercel.
