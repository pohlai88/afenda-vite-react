# `@afenda/pino-logger`

Structured logging primitives for Afenda services.

Scope:

- Pino root logger creation
- request-scoped logger binding
- Hono middleware for request completion logging

Rules:

- JSON-first output
- request context through child loggers
- no app-specific business logic in this package
