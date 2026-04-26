# Migration Notes: Legacy `search` -> `@afenda/search`

## Preserved

- search query/result contracts
- index configuration concept
- client/indexer/sync separation
- multi-entity search posture

## Deliberately Excluded

- direct Meilisearch dependency
- Prisma middleware integration
- legacy ERP index assumptions as hard runtime coupling
- provider-specific settings such as Vietnamese stopword tuning

## Why

The legacy package mixed contracts, provider implementation, and ORM coupling. Afenda keeps the search package transport-safe and provider-agnostic first, then lets apps and future adapters decide whether Meilisearch is worth adopting as real infrastructure.
