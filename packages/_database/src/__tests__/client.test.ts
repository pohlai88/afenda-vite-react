/**
 * Tests createPgPool / createDbClient / closeDbPool with mocked pg + drizzle (no real network).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const pgMock = vi.hoisted(() => ({
  end: vi.fn().mockResolvedValue(undefined),
  poolConfigs: [] as unknown[],
}))

vi.mock("pg", () => ({
  Pool: class MockPool {
    end = pgMock.end
    constructor(config?: unknown) {
      pgMock.poolConfigs.push(config)
    }
  },
}))

const mockDrizzle = vi.fn(() => ({}))
vi.mock("drizzle-orm/node-postgres", () => ({
  drizzle: mockDrizzle,
}))

describe("client", { timeout: 30_000 }, () => {
  beforeEach(() => {
    vi.resetModules()
    pgMock.end.mockClear()
    pgMock.poolConfigs.length = 0
    mockDrizzle.mockClear()
    process.env.DATABASE_URL = "postgres://localhost:5432/testdb"
    delete process.env.DB_POOL_MAX
    delete process.env.DB_IDLE_TIMEOUT_MS
    delete process.env.DB_CONNECTION_TIMEOUT_MS
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("createPgPool uses DATABASE_URL and defaults", async () => {
    const { createPgPool } = await import("../client")
    const pool = createPgPool()
    expect(pool).toBeDefined()
    const call = pgMock.poolConfigs.at(-1) as
      | Record<string, unknown>
      | undefined
    expect(call?.connectionString).toBe("postgres://localhost:5432/testdb")
  })

  it("createPgPool reads optional pool env integers", async () => {
    process.env.DB_POOL_MAX = "12"
    process.env.DB_IDLE_TIMEOUT_MS = "60000"
    process.env.DB_CONNECTION_TIMEOUT_MS = "5000"
    const { createPgPool } = await import("../client")
    createPgPool()
    const call = pgMock.poolConfigs.at(-1) as
      | Record<string, unknown>
      | undefined
    expect(call?.max).toBe(12)
    expect(call?.idleTimeoutMillis).toBe(60000)
    expect(call?.connectionTimeoutMillis).toBe(5000)
  })

  it("createDbClient wraps drizzle with schema", async () => {
    const { createPgPool, createDbClient } = await import("../client")
    const pool = createPgPool()
    const db = createDbClient(pool)
    expect(db).toBeDefined()
    expect(mockDrizzle).toHaveBeenCalled()
  })

  it("closeDbPool ends the pool", async () => {
    const { createPgPool, closeDbPool } = await import("../client")
    const pool = createPgPool()
    await closeDbPool(pool)
    expect(pgMock.end).toHaveBeenCalled()
  })
})
