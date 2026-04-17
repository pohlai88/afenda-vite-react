# DB Studio — modeling layers

DB Studio (authenticated UI under `/app/db-studio`) surfaces metadata along **three modeling layers** aligned with standard data modeling practice:

| Layer | Meaning in Afenda | Studio UI |
| ----- | ----------------- | --------- |
| **Conceptual** | Product and business language | Glossary search (`business_primary_term`, aliases); “new word” discovery |
| **Logical** | Terms grouped by concern, relationships to docs | **Domain module** matrix (`domain_module` entry counts) |
| **Physical** | PostgreSQL tables, enums, Drizzle modules | Allowlisted **enum** values (`pg_enum`); glossary entries link to `drizzle_schema_file` and `table` / enum names |

The YAML glossary is the **bridge** between conceptual/logical naming and physical identifiers. The **audit** panel shows **append-only evidence** for the active tenant (not DDL history—see repo migrations for schema changes).

In **DB Studio**, the domain-module matrix is **derived in the browser** from the same glossary snapshot as the term list (no extra `/glossary/matrix` request). The API still exposes `GET /v1/studio/glossary/matrix` for thin clients.

See also [`DATABASE_ARCHITECTURE_DOCTRINE.md`](./DATABASE_ARCHITECTURE_DOCTRINE.md).
