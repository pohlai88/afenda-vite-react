# Fastify guide (Afenda)

This document describes how **Afenda** plans to implement **`apps/api`** with **[Fastify](https://fastify.dev/)**: tenant-scoped routes, validation aligned with [API](../API.md), and **Pino** logging.

**Status:** **Planned** for **`apps/api`**. No Fastify package in **`apps/web`**. HTTP contract: [API](../API.md).

**Official documentation:**

- [Documentation home](https://fastify.dev/docs/latest/) — Reference vs Guides
- [Getting started](https://fastify.dev/docs/latest/Guides/Getting-Started/) — install, `register`, plugins, validation basics
- [Server](https://fastify.dev/docs/latest/Reference/Server/) — `Fastify()`, `listen`, logger options
- [Routes](https://fastify.dev/docs/latest/Reference/Routes/) — methods, `route()`, params, route options
- [Plugins](https://fastify.dev/docs/latest/Reference/Plugins/) — encapsulation, `fastify-plugin`, loading order
- [Hooks](https://fastify.dev/docs/latest/Reference/Hooks/) — lifecycle (`onRequest`, `preValidation`, `preHandler`, …)
- [Validation and serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/) — JSON Schema for body, query, params, headers, response
- [TypeScript](https://fastify.dev/docs/latest/Reference/TypeScript/) — generics on routes, schema typing
- [Request](https://fastify.dev/docs/latest/Reference/Request/) / [Reply](https://fastify.dev/docs/latest/Reference/Reply/) — `body`, `params`, `query`, responses
- [Logging](https://fastify.dev/docs/latest/Reference/Logging/) — built-in **Pino**
- [Content-Type Parser](https://fastify.dev/docs/latest/Reference/ContentTypeParser/) — non-JSON payloads if needed
- [Testing](https://fastify.dev/docs/latest/Guides/Testing/) — `inject()`, patterns
- [Plugins guide](https://fastify.dev/docs/latest/Guides/Plugins-Guide/) — architecture, `fastify-plugin`
- [Ecosystem](https://fastify.dev/docs/latest/Guides/Ecosystem/) — **`@fastify/cors`**, **`@fastify/*`**
- [LTS](https://fastify.dev/docs/latest/Reference/LTS/) — release lines
- [Fastify on GitHub](https://github.com/fastify/fastify) · [fastify-cli](https://github.com/fastify/fastify-cli) (optional scaffolding)

---

## Responsibilities

- Implement **`/api/tenants/:tenant/...`** and **`/api/chat`** per [API](../API.md).
- **AuthZ / authN** — [Authentication](../AUTHENTICATION.md), [Roles and permissions](../ROLES_AND_PERMISSIONS.md).
- **DB** — **Drizzle** only on server ([Database package](../../packages/_database/README.md), [Drizzle ORM](https://orm.drizzle.team/)).

---

## How we scaffold Fastify

| Topic               | Convention                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prefixes**        | `fastify.register(tenantRoutes, { prefix: '/api/tenants/:tenant' })` + shared **`preHandler`** (or **`preValidation`**) for tenant membership                                                                       |
| **Hooks**           | Use the [lifecycle](https://fastify.dev/docs/latest/Reference/Hooks/) that fits: auth often **`preValidation`** / **`preHandler`**; avoid duplicating work across hooks                                             |
| **Validation**      | Route **`schema`** (JSON Schema) and/or shared Zod/types at the boundary—aligned with [API](../API.md); see [Validation and serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/) |
| **Plugins**         | **`fastify-plugin`** when decorators/hooks must apply outside a child scope (e.g. shared auth)—[Plugins](https://fastify.dev/docs/latest/Reference/Plugins/)                                                        |
| **Logger**          | Built-in **Pino** — [Pino](./pino.md), [Logging](https://fastify.dev/docs/latest/Reference/Logging/)                                                                                                                |
| **CORS**            | **`@fastify/cors`** with explicit origins when SPA and API differ — [Ecosystem](https://fastify.dev/docs/latest/Guides/Ecosystem/)                                                                                  |
| **Listen / deploy** | Default bind is **localhost**; use **`host: '0.0.0.0'`** (or **`::`**) in containers—[Getting started](https://fastify.dev/docs/latest/Guides/Getting-Started/)                                                     |

---

## Alternatives

**Express** — acceptable; **URL contract** unchanged.

---

## Red flags

- **Skipping** tenant checks on tenant-scoped routes.
- **Fat handlers** without plugins/services for ERP domains.

---

## Related documentation

- [API reference](../API.md)
- [Architecture](../ARCHITECTURE.md)
- [Pino](./pino.md)

**External:** [fastify.dev](https://fastify.dev/) · [Fastify GitHub](https://github.com/fastify/fastify)

**Context7 (AI doc refresh):** resolve **`Fastify`** → **`/fastify/fastify`** (or **`/llmstxt/fastify_dev_llms_txt`** for broader snippets), then **`query-docs`** for the topic (hooks, validation, TypeScript, plugins).
