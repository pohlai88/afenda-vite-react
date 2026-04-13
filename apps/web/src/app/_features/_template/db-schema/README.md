# Database Boundary

Do not place browser-owned database schema in this Vite feature folder.

For a real ERP feature, use this folder only for persistence intent notes or a future `persistence-contract.md`: domain tables needed, invariants, ownership, and API DTO expectations.

Executable Drizzle schema and migrations belong in the matching domain owner under `packages/_database/src/<domain>` and are consumed by server/API code through `@afenda/database`. This Vite feature consumes persistence through `_platform/api`, `services/`, and `types/` only.
