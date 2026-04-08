# Query (TanStack) rules

## What lives here

**Shared `QueryClient` instance** and small **pure helpers** used by its defaults (e.g. parsing HTTP status from unknown errors for `retry`). This is **client-side cache/orchestration**, not your REST/tRPC “service” layer.

## What does not belong here

- **`QueryProvider`** / React tree wiring → `share/components/providers/`.
- **Fetch functions**, OpenAPI clients, auth headers → `features/*/api`, `share/api`, etc.
- **Zustand** → `share/client-store/`.

## Imports

Prefer `@/share/query` for `queryClient` and helpers. Use `QueryProvider` from `@/share/components/providers`.
