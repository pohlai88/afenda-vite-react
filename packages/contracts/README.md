# `@afenda/contracts`

Shared cross-runtime contracts for Afenda applications and packages.

Rules:

- keep this package runtime-light
- prefer schemas and transport contracts that can be consumed by both `apps/web` and `apps/api`
- do not mix app-local feature code into this package
