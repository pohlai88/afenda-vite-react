# `@afenda/database` documentation

Package-local guides for Drizzle schema, seeds, and database architecture.

| Document | Description |
| -------- | ----------- |
| [Database architecture doctrine](./DATABASE_ARCHITECTURE_DOCTRINE.md) | Business-first principles: tenant scope, layers of truth, master vs transactional data, glossary alignment. |
| [data/overview.md](./data/overview.md) · [business-technical-glossary.yaml](./data/business-technical-glossary.yaml) | Machine-readable business ↔ table / schema mapping. |
| [External glossary references](./EXTERNAL_GLOSSARY_REFERENCES.md) | DAMA / ISO pointers; OpenMetadata & DataHub for catalog UX inspiration. |
| [DB Studio modeling](./STUDIO_MODELING.md) | Conceptual / logical / physical layers for the in-app DB Studio. |
| [Governance future](./GOVERNANCE_FUTURE.md) | Write-path options for glossary change management. |
| [Drizzle Seed and Faker](./DRIZZLE_SEED_AND_FAKER.md) | `drizzle-seed`, `@faker-js/faker`, deterministic synthetic seeds. |

**Repo-wide database operations** (connection strings, CI, migrations): [docs/DATABASE.md](../../../docs/DATABASE.md) at the monorepo root.

**Audit evidence** (normative module docs): [packages/_database/src/audit/README.md](../src/audit/README.md).
