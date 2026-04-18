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

You can **implement `apps/api`** (Fastify routes, handlers, auth hooks) and **`apps/web`** (React screens, TanStack Query calls) using **only** the above. **`apps/api`** may not exist in the tree yet; the contract in [API.md](./API.md) is still the source of truth for routes and behavior.

## Optional (improve quality; not required to start)

| Topic                                   | Purpose                                                                                             | Blocks development?                                                                                               |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **OpenAPI / Swagger**                   | Generated clients, contract tests, partner-facing API browser                                       | **No** — hand-written routes and TypeScript types are enough. Add when you want automation or external discovery. |
| **Storybook**                           | Isolated component development                                                                      | No                                                                                                                |
| **MSW, Sentry, OTel, Vercel Functions** | Optional patterns — [dependencies index](./dependencies/README.md) §Optional / when you standardize | No                                                                                                                |
| **CI deep-dive doc**                    | Beyond what [Project configuration](./PROJECT_CONFIGURATION.md) and workflows cover                 | No                                                                                                                |

## Deferred items explained

- **OpenAPI** was listed as a follow-up to [API.md](./API.md) because the **markdown contract** is sufficient for internal implementation. Deferring OpenAPI does **not** leave gaps that prevent coding; it defers **machine-readable** duplication and codegen.
- If a **public partner API** or **strict contract testing** becomes a requirement, add OpenAPI generation from **`apps/api`** (or hand-maintained `openapi.yaml`) and link it from [API.md](./API.md).

## Related

- [docs/README.md](./README.md) — full index
- [Dependency guides](./dependencies/README.md) — per-package status (adopted vs planned)
