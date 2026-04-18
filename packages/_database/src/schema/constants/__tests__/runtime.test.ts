/**
 * Vitest: `constants/runtime.ts` — pool env keys and defaults consumed by `src/client.ts`.
 */
import { describe, expect, it } from "vitest"

import { databaseRuntimeEnvKeys, defaultPoolSettings } from "../runtime"

describe("databaseRuntimeEnvKeys", () => {
  it("uses stable process.env lookup literals", () => {
    expect(databaseRuntimeEnvKeys).toEqual({
      url: "DATABASE_URL",
      poolMax: "DB_POOL_MAX",
      idleTimeoutMs: "DB_IDLE_TIMEOUT_MS",
      connectionTimeoutMs: "DB_CONNECTION_TIMEOUT_MS",
      statementTimeoutMs: "DB_STATEMENT_TIMEOUT_MS",
    })
  })
})

describe("defaultPoolSettings", () => {
  it("keeps positive numeric defaults for pool wiring", () => {
    expect(defaultPoolSettings).toEqual({
      max: 10,
      idleTimeoutMs: 10_000,
      connectionTimeoutMs: 5_000,
      statementTimeoutMs: 30_000,
    })
  })
})
