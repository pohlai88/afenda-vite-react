# `@afenda/search`

Afenda-native search contracts, indexing orchestration, and a test-safe in-memory engine.

## Owns

- search query and result contracts
- index configuration contracts and registry
- abstract search engine boundary
- indexing orchestration
- sync event batching
- an in-memory engine for local work and tests

## Does Not Own

- Meilisearch, Elasticsearch, or any provider-specific runtime
- ORM middleware
- API route handlers
- tenant/auth scoping
- domain-specific document mappers

## Boundary

- `@afenda/search`: contracts, orchestration, engine interface
- provider adapter later: Meilisearch or another engine if the platform commits to one
- `apps/api`: search routes, tenant scoping, auth, provider wiring
- domain modules: map business truth into search documents

This is the safe first slice extracted from the legacy `search` package without carrying over its Meilisearch and Prisma assumptions.
