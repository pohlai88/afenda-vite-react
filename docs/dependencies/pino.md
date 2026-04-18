# Pino guide (Afenda)

This document describes how **Afenda** intends to use **[Pino](https://getpino.io/)** for **structured JSON logging** on **Node** (**`apps/api`**, workers): child loggers, **redaction**, and transports—**not** in the Vite browser bundle.

**Status:** **Planned** for **server-side** code (**`apps/api`**, workers, scripts). **`apps/web`** must **not** bundle Pino for browser logging.

**Note:** The marketing site lists topics on [getpino.io](https://getpino.io/); **detailed pages** are maintained as Markdown in the repo under **`docs/`**. Use the **GitHub `blob/main/docs/...`** links below (older **`getpino.io/docs/...`** paths often **404**).

**Official documentation:**

- [getpino.io](https://getpino.io/) — index and quick orientation
- [API](https://github.com/pinojs/pino/blob/main/docs/api.md) — constructor, levels, **`redact`**, [**`serializers`**](https://github.com/pinojs/pino/blob/main/docs/api.md#serializers-object), `transport`, logging argument order
- [Transports](https://github.com/pinojs/pino/blob/main/docs/transports.md) — **`pino.transport`**, workers, targets / pipeline
- [Asynchronous logging](https://github.com/pinojs/pino/blob/main/docs/asynchronous.md) — workers, `pino.destination` / `sync: false`
- [Redaction](https://github.com/pinojs/pino/blob/main/docs/redaction.md)
- [Child loggers](https://github.com/pinojs/pino/blob/main/docs/child-loggers.md)
- [Pretty printing](https://github.com/pinojs/pino/blob/main/docs/pretty.md) — **`pino-pretty`** (dev)
- [Benchmarks](https://github.com/pinojs/pino/blob/main/docs/benchmarks.md)
- [Web frameworks](https://github.com/pinojs/pino/blob/main/docs/web.md) — Fastify, Express (**`pino-http`**), etc.
- [Browser API](https://github.com/pinojs/pino/blob/main/docs/browser.md) · [Bundling](https://github.com/pinojs/pino/blob/main/docs/bundling.md) — not for Afenda **`apps/web`** product logging; server-only here
- [Diagnostics](https://github.com/pinojs/pino/blob/main/docs/diagnostics.md) · [Ecosystem](https://github.com/pinojs/pino/blob/main/docs/ecosystem.md) · [LTS](https://github.com/pinojs/pino/blob/main/docs/lts.md)
- [Pino on GitHub](https://github.com/pinojs/pino) — [README](https://github.com/pinojs/pino#readme) (same doc index as the site)
- Fastify: [Fastify](./fastify.md); Pino [web framework notes](https://github.com/pinojs/pino/blob/main/docs/web.md#fastify)

Prefer **structured JSON** in production; keep **pretty printing** off the hot path (see [Development vs production](#development-vs-production)).

---

## How we use Pino

| Aspect         | Afenda convention                                                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Output**     | **JSON lines** to stdout in production; one object per line                                                                                                                                             |
| **Context**    | **Child loggers** with `requestId`, `tenantId`, route name—align with [API](../API.md) `requestId`                                                                                                      |
| **Secrets**    | **`redact`** paths for tokens, passwords, `Authorization` headers—never log full JWTs                                                                                                                   |
| **Cost**       | Minimal CPU vs many loggers—important under ERP load ([benchmarks](https://github.com/pinojs/pino/blob/main/docs/benchmarks.md))                                                                        |
| **Heavy work** | Use **`pino.transport`** so transports (shipping, alerting, reformatting) run **outside** the main event loop when possible ([Transports](https://github.com/pinojs/pino/blob/main/docs/transports.md)) |

---

## Log API shape (official)

Pino’s signature is **merging object first**, **message string second** (not Winston-style message-first):

```typescript
// ✅ Correct — merge object, then message
logger.info(
  { tenantId, userId, route: "/api/tenants/acme/profile" },
  "profile fetched"
)

// ❌ Avoid — wrong argument order for Pino
logger.info("profile fetched", { tenantId, userId })
```

Reference: [API — logging method parameters](https://github.com/pinojs/pino/blob/main/docs/api.md#logging-method-parameters) and the [README usage](https://github.com/pinojs/pino#usage).

---

## Base logger (illustrative, ESM)

Afenda uses **`"type": "module"`** at the repo root—prefer **`import pino from 'pino'`** in **`apps/api`** when you add it.

```typescript
import pino from "pino"

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "password",
      "token",
      "accessToken",
      "refreshToken",
      "*.password",
      "*.authorization",
    ],
    censor: "[Redacted]",
  },
})
```

- Tune **`redact.paths`** as your merge objects grow ([Redaction](https://github.com/pinojs/pino/blob/main/docs/redaction.md)).
- Set **`LOG_LEVEL`** per environment (`debug` in local dev only if needed).

---

## Child loggers (request / job scope)

Bind **stable context** once per request or job so every line carries correlation fields:

```typescript
const child = logger.child({
  requestId: req.id,
  tenantSlug: resolvedTenant.slug,
})

child.info({ durationMs: 42 }, "query completed")
```

In **Fastify**, `req.log` is already a child logger—add bindings in **`onRequest`** hooks when tenant and user are resolved. See [Child loggers](https://github.com/pinojs/pino/blob/main/docs/child-loggers.md).

---

## Development vs production

| Mode           | Approach                                                                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Production** | Raw JSON to stdout; ship to your log stack; **no** `pino-pretty` on the hot path                                                                                                                        |
| **Local dev**  | Optional **`pino-pretty`** via **`pino.transport({ target: 'pino-pretty', ... })`** or the inline **`transport`** option—see [Pretty printing](https://github.com/pinojs/pino/blob/main/docs/pretty.md) |

Upstream recommends running **transports** (sending, alerting, pretty-printing) in a **worker** using **`pino.transport`**, so the main thread stays responsive ([Transports](https://github.com/pinojs/pino/blob/main/docs/transports.md), [Asynchronous logging](https://github.com/pinojs/pino/blob/main/docs/asynchronous.md)).

Install pretty only as a **devDependency** if you use it:

```bash
pnpm add -D pino-pretty
```

---

## Serializers

Use **`serializers`** (and **`redact`**) so `req`, `res`, `err`, or domain objects don’t dump PII or multi-kilobyte bodies. Truncate large payloads before they hit the log stream. See [API — `serializers`](https://github.com/pinojs/pino/blob/main/docs/api.md#serializers-object).

---

## Fastify integration

- Pass a Pino instance (or options) into **`fastify({ logger: ... })`** so routes use **`req.log`** with correct request bindings.
- Align Fastify’s **`genReqId`** (or custom) with [API](../API.md) **`requestId`** in JSON error responses.

---

## Drizzle / SQL diagnostics

Optional: wrap the **`pg` Pool** or use Drizzle’s logger hook to **warn** on slow queries—correlate **`requestId`** with DB spans. See [Drizzle ORM](https://orm.drizzle.team/) and the repo [Pino logging skill](../../.agents/skills/pino-logging-setup/SKILL.md).

---

## Red flags

- Importing **Pino** from **`apps/web`** or any **client** bundle.
- Logging **passwords**, **raw JWTs**, or full **`Authorization`** values without **redact**.
- **Pretty** transport or synchronous heavy formatting in **production** hot paths.
- **Wrong argument order** (`msg` first) so fields merge incorrectly.

---

## Related documentation

- [Fastify](./fastify.md) — HTTP server and `req.log`
- [API reference](../API.md) — `requestId` on errors
- [Drizzle ORM](https://orm.drizzle.team/) — optional slow-query logging
- [`.agents/skills/pino-logging-setup/SKILL.md`](../../.agents/skills/pino-logging-setup/SKILL.md) — extended patterns (serializers, transports, request middleware)

**External:** [getpino.io](https://getpino.io/) · [pinojs/pino on GitHub](https://github.com/pinojs/pino)

**Context7 (AI doc refresh):** **`pino`** → **`/pinojs/pino`**; HTTP middleware → **`/pinojs/pino-http`**. Then **`query-docs`** for transports, redaction, Fastify, or worker threading.
