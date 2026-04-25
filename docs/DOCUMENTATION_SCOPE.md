---
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: documentation-governance
---

# Documentation scope and readiness

This page clarifies **which docs are normative** for building Afenda, what is **optional**, and what **does not block** implementation.

## Normative (build from these)

| Need                               | Document                                                |
| ---------------------------------- | ------------------------------------------------------- |
| Monorepo and SPA vs API vs DB      | [Architecture](./ARCHITECTURE.md)                       |
| HTTP paths, payloads, errors       | [API reference](./API.md)                               |
| Auth and sessions (Vite + backend) | [Authentication](./AUTHENTICATION.md)                   |
| Roles and permission keys          | [Roles and permissions](./ROLES_AND_PERMISSIONS.md)     |
| PostgreSQL + Drizzle               | [`packages/_database`](../packages/_database/README.md) |
| `apps/web` folders and features    | [Project structure](./PROJECT_STRUCTURE.md)             |
| UI patterns and stack facts        | [Components and styling](./COMPONENTS_AND_STYLING.md)   |
| Package-specific conventions       | [Dependency guides](./dependencies/README.md)           |

You can implement the live Afenda surfaces using only the above. Today that means:

- **`apps/api`** exists and is a Hono API
- **`apps/web`** consumes that API through a typed Hono RPC surface and a generic browser client surface
- [API.md](./API.md) is the narrative contract, while [`docs/architecture/governance/generated/api-route-surface.md`](./architecture/governance/generated/api-route-surface.md) is the generated route inventory

## Optional (improve quality; not required to start)

| Topic                                   | Purpose                                                                                             | Blocks development?                                                                                               |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **OpenAPI / Swagger**                   | Generated clients, contract tests, partner-facing API browser                                       | **No** — hand-written routes and TypeScript types are enough. Add when you want automation or external discovery. |
| **Storybook**                           | Isolated component development                                                                      | No                                                                                                                |
| **MSW, Sentry, OTel, Vercel Functions** | Optional patterns — [dependencies index](./dependencies/README.md) §Optional / when you standardize | No                                                                                                                |
| **CI deep-dive doc**                    | Beyond what [Project configuration](./PROJECT_CONFIGURATION.md) and workflows cover                 | No                                                                                                                |

## Deferred items explained

- **OpenAPI** remains optional because the current gap-closure wave uses a generated Hono route-surface artifact instead of introducing a second spec system in the same step. Deferring OpenAPI does **not** block coding; it defers a richer partner/codegen surface.
- If a **public partner API** or **strict contract testing** becomes a requirement, add OpenAPI generation from **`apps/api`** (or hand-maintained `openapi.yaml`) and link it from [API.md](./API.md).

## Related

- [docs/README.md](./README.md) — full index
- [Dependency guides](./dependencies/README.md) — per-package status (adopted vs planned)
