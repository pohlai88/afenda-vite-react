import { Hono } from "hono"
import { describe, expect, it } from "vitest"

import { createHonoRateLimitMiddleware } from "../src/hono-rate-limit.middleware"
import { MemoryRateLimitStoreAdapter } from "../src/memory-rate-limit-store.adapter"
import {
  AUTHENTICATED_RATE_LIMIT_POLICY,
  PUBLIC_RATE_LIMIT_POLICY,
} from "../src/rate-limit-presets.policy"
import { RedisRateLimitStoreAdapter } from "../src/redis-rate-limit-store.adapter"
import { RateLimiterService } from "../src/rate-limiter.service"

describe("@afenda/rate-limit", () => {
  it("enforces fixed-window limits deterministically", async () => {
    let nowMs = 1_000
    const limiter = new RateLimiterService({
      store: new MemoryRateLimitStoreAdapter(),
      now: () => nowMs,
    })

    await expect(
      limiter.consume({
        key: "ip:1",
        policy: {
          ...PUBLIC_RATE_LIMIT_POLICY,
          limit: 2,
          blockDurationMs: 0,
        },
      })
    ).resolves.toMatchObject({ allowed: true, remaining: 1 })

    await expect(
      limiter.consume({
        key: "ip:1",
        policy: {
          ...PUBLIC_RATE_LIMIT_POLICY,
          limit: 2,
          blockDurationMs: 0,
        },
      })
    ).resolves.toMatchObject({ allowed: true, remaining: 0 })

    await expect(
      limiter.consume({
        key: "ip:1",
        policy: {
          ...PUBLIC_RATE_LIMIT_POLICY,
          limit: 2,
          blockDurationMs: 0,
        },
      })
    ).resolves.toMatchObject({ allowed: false, remaining: 0 })

    nowMs = 61_500
    await expect(
      limiter.consume({
        key: "ip:1",
        policy: {
          ...PUBLIC_RATE_LIMIT_POLICY,
          limit: 2,
          blockDurationMs: 0,
        },
      })
    ).resolves.toMatchObject({ allowed: true, remaining: 1 })
  })

  it("expires sliding-window state as time moves forward", async () => {
    let nowMs = 10_000
    const limiter = new RateLimiterService({
      store: new MemoryRateLimitStoreAdapter(),
      now: () => nowMs,
    })
    const policy = {
      ...PUBLIC_RATE_LIMIT_POLICY,
      strategy: "sliding-window" as const,
      limit: 2,
      blockDurationMs: 0,
    }

    await limiter.consume({ key: "user:1", policy })
    await limiter.consume({ key: "user:1", policy })
    await expect(
      limiter.inspect({ key: "user:1", policy })
    ).resolves.toMatchObject({
      allowed: true,
      consumed: 2,
      remaining: 0,
    })

    nowMs = 71_000
    await expect(
      limiter.inspect({ key: "user:1", policy })
    ).resolves.toMatchObject({
      allowed: true,
      consumed: 0,
      remaining: 2,
    })
  })

  it("refills token buckets over time", async () => {
    let nowMs = 0
    const limiter = new RateLimiterService({
      store: new MemoryRateLimitStoreAdapter(),
      now: () => nowMs,
    })
    const policy = {
      ...AUTHENTICATED_RATE_LIMIT_POLICY,
      strategy: "token-bucket" as const,
      limit: 10,
      windowMs: 10_000,
      blockDurationMs: 0,
    }

    await expect(
      limiter.consume({ key: "user:2", policy, points: 6 })
    ).resolves.toMatchObject({ allowed: true, remaining: 4 })

    nowMs = 5_000
    await expect(
      limiter.inspect({ key: "user:2", policy })
    ).resolves.toMatchObject({ remaining: 9 })
  })

  it("supports redis-backed fixed-window state via the adapter contract", async () => {
    const redis = new FakeRedisClient()
    const limiter = new RateLimiterService({
      store: new RedisRateLimitStoreAdapter(redis),
      now: () => 1_000,
    })

    await expect(
      limiter.consume({
        key: "api:key",
        policy: {
          ...PUBLIC_RATE_LIMIT_POLICY,
          limit: 1,
          blockDurationMs: 0,
        },
      })
    ).resolves.toMatchObject({ allowed: true })

    await expect(
      limiter.consume({
        key: "api:key",
        policy: {
          ...PUBLIC_RATE_LIMIT_POLICY,
          limit: 1,
          blockDurationMs: 0,
        },
      })
    ).resolves.toMatchObject({ allowed: false })
  })

  it("applies Hono middleware and emits standard headers", async () => {
    let nowMs = 0
    const limiter = new RateLimiterService({
      store: new MemoryRateLimitStoreAdapter(),
      now: () => nowMs,
    })
    const app = new Hono()
    app.use(
      "*",
      createHonoRateLimitMiddleware({
        limiter,
        policy: {
          ...PUBLIC_RATE_LIMIT_POLICY,
          limit: 1,
          blockDurationMs: 0,
        },
      })
    )
    app.get("/limited", (context) => context.text("ok"))

    const first = await app.request("/limited")
    expect(first.status).toBe(200)
    expect(first.headers.get("X-RateLimit-Limit")).toBe("1")
    expect(first.headers.get("X-RateLimit-Remaining")).toBe("0")

    nowMs = 1
    const second = await app.request("/limited")
    expect(second.status).toBe(429)
    expect(second.headers.get("Retry-After")).toBe("60")
  })
})

class FakeRedisClient {
  private readonly strings = new Map<string, string>()
  private readonly zsets = new Map<string, Map<string, number>>()
  private readonly hashes = new Map<string, Record<string, string>>()

  async incrby(key: string, increment: number): Promise<number> {
    const next = Number.parseInt(this.strings.get(key) ?? "0", 10) + increment
    this.strings.set(key, `${next}`)
    return next
  }

  async pexpire(): Promise<number> {
    return 1
  }

  async get(key: string): Promise<string | null> {
    return this.strings.get(key) ?? null
  }

  async set(
    key: string,
    value: string,
    _mode?: "PX",
    _ttlMs?: number
  ): Promise<unknown> {
    this.strings.set(key, value)
    return "OK"
  }

  async del(...keys: string[]): Promise<number> {
    let deleted = 0
    for (const key of keys) {
      deleted += this.strings.delete(key) ? 1 : 0
      deleted += this.zsets.delete(key) ? 1 : 0
      deleted += this.hashes.delete(key) ? 1 : 0
    }
    return deleted
  }

  async zremrangebyscore(
    key: string,
    min: number,
    max: number
  ): Promise<number> {
    const current = this.zsets.get(key) ?? new Map<string, number>()
    let removed = 0
    for (const [member, score] of current.entries()) {
      if (score >= min && score <= max) {
        current.delete(member)
        removed += 1
      }
    }
    this.zsets.set(key, current)
    return removed
  }

  async zcard(key: string): Promise<number> {
    return (this.zsets.get(key) ?? new Map()).size
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    const current = this.zsets.get(key) ?? new Map<string, number>()
    current.set(member, score)
    this.zsets.set(key, current)
    return 1
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.hashes.get(key) ?? {}
  }

  async hset(key: string, values: Record<string, string>): Promise<number> {
    this.hashes.set(key, values)
    return Object.keys(values).length
  }
}
