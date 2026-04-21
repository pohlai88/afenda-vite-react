import { drizzle } from "drizzle-orm/node-postgres"
import { Pool, type PoolConfig } from "pg"

import {
  databaseRuntimeEnvKeys,
  defaultPoolSettings,
} from "./schema/constants/runtime"
import { readOptionalInteger } from "./schema/environment-support"
import * as schema from "./schema"
import * as relations from "./relations/relations.schema"

/** Merged schema + relations for the canonical Drizzle client surface. */
export const afendaDrizzleSchema = {
  ...schema,
  ...relations,
}

const databaseSchema = afendaDrizzleSchema

export function createPgPool(config: PoolConfig = {}): Pool {
  const statementRaw = process.env[databaseRuntimeEnvKeys.statementTimeoutMs]
  const statementTimeoutMs =
    statementRaw?.trim() !== "" ? readOptionalInteger(statementRaw, 0) : 0
  const statementOptions =
    statementTimeoutMs > 0
      ? `-c statement_timeout=${statementTimeoutMs}`
      : undefined

  return new Pool({
    connectionString: process.env[databaseRuntimeEnvKeys.url],
    max: readOptionalInteger(
      process.env[databaseRuntimeEnvKeys.poolMax],
      defaultPoolSettings.max
    ),
    idleTimeoutMillis: readOptionalInteger(
      process.env[databaseRuntimeEnvKeys.idleTimeoutMs],
      defaultPoolSettings.idleTimeoutMs
    ),
    connectionTimeoutMillis: readOptionalInteger(
      process.env[databaseRuntimeEnvKeys.connectionTimeoutMs],
      defaultPoolSettings.connectionTimeoutMs
    ),
    ...(statementOptions ? { options: statementOptions } : {}),
    ...config,
  })
}

export function createDbClient(targetPool: Pool = createPgPool()) {
  return drizzle({
    client: targetPool,
    schema: databaseSchema,
    casing: "camelCase",
  })
}

export const pool = createPgPool()
export const db = createDbClient(pool)

export type DatabaseClient = ReturnType<typeof createDbClient>

export async function closeDbPool(targetPool: Pool = pool): Promise<void> {
  await targetPool.end()
}
