# Errors

`@afenda/errors` provides shared, transport-safe error primitives for Afenda packages and apps.

It owns:

- base `AfendaError`
- HTTP-oriented `AppError`
- common helpers such as `badRequest()`, `notFound()`, `conflict()`
- serialization and operational-error helpers

It does **not** own:

- Hono middleware or API transport wiring
- Vite configuration
- domain-specific errors that belong inside bounded contexts

Current API transport mapping remains in `apps/api`.
