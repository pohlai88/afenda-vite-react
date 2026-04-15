import type { DatabaseClient } from "@afenda/database"
import type { Pool } from "pg"

import { createDrizzleAuthChallengeRepo } from "./modules/auth-companion-adapters/drizzle/index.js"
import {
  createPgBetterAuthSessionReader,
  createPgBetterAuthSessionRevoker,
} from "./modules/auth-companion-adapters/pg/index.js"
import {
  DEFAULT_BETTER_AUTH_PG_COLUMNS,
  DEFAULT_BETTER_AUTH_PG_TABLES,
} from "./modules/auth-companion-adapters/pg/repo/better-auth-pg-defaults.js"
import { isDatabaseClient } from "./modules/auth-companion-adapters/is-database-client.js"
import { createAuthCompanionModule } from "./modules/auth-companion/create-auth-companion-module.js"
import { InMemoryAuthChallengeRepo } from "./modules/auth-companion/repo/auth-challenge.repo.js"
import { AlsBackedDemoAuthSessionRepo } from "./modules/auth-companion/repo/auth-session.repo.js"

/**
 * Wires auth-companion repos for the current runtime: Drizzle-backed when
 * `db` is a {@link DatabaseClient}, otherwise in-memory challenge + ALS session demo.
 *
 * Session list/revoke use a **raw `pg.Pool` seam** against Better Auth tables (CLI-managed
 * schema), not Drizzle models. Pass the same pool Better Auth uses (`createAfendaAuth(pool)`).
 */
export function createAuthCompanionModuleForApp(db: unknown, pool?: Pool) {
  if (!isDatabaseClient(db)) {
    const demo = new AlsBackedDemoAuthSessionRepo()
    return createAuthCompanionModule({
      challengeRepo: new InMemoryAuthChallengeRepo(),
      sessionReader: demo,
      sessionRevoker: demo,
    })
  }

  if (!pool) {
    const demo = new AlsBackedDemoAuthSessionRepo()
    return createAuthCompanionModule({
      challengeRepo: createDrizzleAuthChallengeRepo(db),
      sessionReader: demo,
      sessionRevoker: demo,
    })
  }

  const tables = DEFAULT_BETTER_AUTH_PG_TABLES
  const columns = DEFAULT_BETTER_AUTH_PG_COLUMNS

  return createAuthCompanionModule({
    challengeRepo: createDrizzleAuthChallengeRepo(db),
    sessionReader: createPgBetterAuthSessionReader(pool, tables, columns),
    sessionRevoker: createPgBetterAuthSessionRevoker(
      pool,
      tables.sessionTable,
      columns.session
    ),
  })
}
