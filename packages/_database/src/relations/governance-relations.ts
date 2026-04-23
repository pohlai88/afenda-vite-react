/**
 * @afenda/database — server-only PostgreSQL + Drizzle persistence boundary for the Afenda monorepo.
 * Canonical DDL under `src/schema/`; Drizzle `relations()` graphs under `src/relations/` (not `pgTable` DDL).
 * Import via `@afenda/database/relations`; do not deep-import `src/` from apps.
 * Not for browser bundles: server-only Drizzle + `pg`.
 * Schema or relation changes require `db:guard` / `db:ci`; Drizzle Kit output is gitignored until you generate/apply migrations.
 * Envelope timestamp: 2026-04-18T12:00:00.000Z
 *
 * This module: `relations/governance-relations.ts` — `data_sources` inverse edges (global registry; MDM references `source_system_id`).
 */
import { relations } from "drizzle-orm"

import { dataSources } from "../schema/governance/governance-data-sources.schema"
import { externalIdentities } from "../schema/mdm/external-identities.schema"
import { items } from "../schema/mdm/items.schema"
import { masterAliases } from "../schema/mdm/master-aliases.schema"
import { parties } from "../schema/mdm/parties.schema"

export const dataSourcesRelations = relations(dataSources, ({ many }) => ({
  items: many(items),
  parties: many(parties),
  masterAliases: many(masterAliases),
  externalIdentities: many(externalIdentities),
}))
