export const databaseRuntimeEnvKeys = {
  url: "DATABASE_URL",
  poolMax: "DB_POOL_MAX",
  idleTimeoutMs: "DB_IDLE_TIMEOUT_MS",
  connectionTimeoutMs: "DB_CONNECTION_TIMEOUT_MS",
  statementTimeoutMs: "DB_STATEMENT_TIMEOUT_MS",
} as const

export const defaultPoolSettings = {
  max: 10,
  idleTimeoutMs: 10_000,
  connectionTimeoutMs: 5_000,
  statementTimeoutMs: 30_000,
} as const
