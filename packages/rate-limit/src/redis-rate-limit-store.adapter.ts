import { randomUUID } from "node:crypto"

import type { RateLimitStoreAdapter } from "./rate-limit.contract"

type RedisHash = Record<string, string>

export interface RateLimitRedisClient {
  incrby(key: string, increment: number): Promise<number>
  pexpire(key: string, ttlMs: number): Promise<number>
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode?: "PX", ttlMs?: number): Promise<unknown>
  del(...keys: string[]): Promise<number>
  zremrangebyscore(key: string, min: number, max: number): Promise<number>
  zcard(key: string): Promise<number>
  zadd(key: string, score: number, member: string): Promise<number>
  hgetall(key: string): Promise<RedisHash>
  hset(key: string, values: RedisHash): Promise<number>
}

export class RedisRateLimitStoreAdapter implements RateLimitStoreAdapter {
  constructor(private readonly redis: RateLimitRedisClient) {}

  async consumeFixedWindow(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly points: number
    readonly limit: number
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{ readonly consumed: number; readonly resetAtMs: number }> {
    const windowStartMs =
      Math.floor(input.nowMs / input.windowMs) * input.windowMs
    const bucketKey = this.getFixedWindowKey(
      input.keyPrefix,
      input.key,
      windowStartMs
    )
    const consumed = await this.redis.incrby(bucketKey, input.points)
    await this.redis.pexpire(bucketKey, input.windowMs)
    return {
      consumed,
      resetAtMs: windowStartMs + input.windowMs,
    }
  }

  async getFixedWindow(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{ readonly consumed: number; readonly resetAtMs: number }> {
    const windowStartMs =
      Math.floor(input.nowMs / input.windowMs) * input.windowMs
    const bucketKey = this.getFixedWindowKey(
      input.keyPrefix,
      input.key,
      windowStartMs
    )
    return {
      consumed: Number.parseInt((await this.redis.get(bucketKey)) ?? "0", 10),
      resetAtMs: windowStartMs + input.windowMs,
    }
  }

  async consumeSlidingWindow(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly points: number
    readonly limit: number
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{ readonly consumed: number; readonly resetAtMs: number }> {
    const bucketKey = this.getSlidingWindowKey(input.keyPrefix, input.key)
    const windowStartMs = input.nowMs - input.windowMs
    await this.redis.zremrangebyscore(bucketKey, 0, windowStartMs)

    for (let index = 0; index < input.points; index += 1) {
      await this.redis.zadd(
        bucketKey,
        input.nowMs + index,
        `${input.nowMs}:${index}:${randomUUID()}`
      )
    }

    await this.redis.pexpire(bucketKey, input.windowMs)
    return {
      consumed: await this.redis.zcard(bucketKey),
      resetAtMs: input.nowMs + input.windowMs,
    }
  }

  async getSlidingWindow(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{ readonly consumed: number; readonly resetAtMs: number }> {
    const bucketKey = this.getSlidingWindowKey(input.keyPrefix, input.key)
    const windowStartMs = input.nowMs - input.windowMs
    await this.redis.zremrangebyscore(bucketKey, 0, windowStartMs)
    return {
      consumed: await this.redis.zcard(bucketKey),
      resetAtMs: input.nowMs + input.windowMs,
    }
  }

  async consumeTokenBucket(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly points: number
    readonly limit: number
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{
    readonly consumed: number
    readonly remainingTokens: number
    readonly resetAtMs: number
  }> {
    const bucketKey = this.getTokenBucketKey(input.keyPrefix, input.key)
    const refillPerMs = input.limit / input.windowMs
    const current = await this.redis.hgetall(bucketKey)
    const lastRefillMs = Number.parseInt(
      current.lastRefillMs ?? `${input.nowMs}`,
      10
    )
    const existingTokens = Number.parseFloat(current.tokens ?? `${input.limit}`)
    const elapsedMs = Math.max(0, input.nowMs - lastRefillMs)
    const refilledTokens = Math.min(
      input.limit,
      existingTokens + elapsedMs * refillPerMs
    )
    const remainingTokens = refilledTokens - input.points

    await this.redis.hset(bucketKey, {
      tokens: `${Math.max(0, remainingTokens)}`,
      lastRefillMs: `${input.nowMs}`,
    })
    await this.redis.pexpire(bucketKey, input.windowMs * 2)

    return {
      consumed: input.limit - Math.floor(remainingTokens),
      remainingTokens,
      resetAtMs:
        input.nowMs +
        Math.ceil(Math.max(0, input.limit - remainingTokens) / refillPerMs),
    }
  }

  async getTokenBucket(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly limit: number
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{
    readonly consumed: number
    readonly remainingTokens: number
    readonly resetAtMs: number
  }> {
    const bucketKey = this.getTokenBucketKey(input.keyPrefix, input.key)
    const refillPerMs = input.limit / input.windowMs
    const current = await this.redis.hgetall(bucketKey)
    const lastRefillMs = Number.parseInt(
      current.lastRefillMs ?? `${input.nowMs}`,
      10
    )
    const existingTokens = Number.parseFloat(current.tokens ?? `${input.limit}`)
    const elapsedMs = Math.max(0, input.nowMs - lastRefillMs)
    const remainingTokens = Math.min(
      input.limit,
      existingTokens + elapsedMs * refillPerMs
    )

    return {
      consumed: input.limit - Math.floor(remainingTokens),
      remainingTokens,
      resetAtMs:
        input.nowMs +
        Math.ceil(Math.max(0, input.limit - remainingTokens) / refillPerMs),
    }
  }

  async setBlockedUntil(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly blockedUntilMs: number
    readonly nowMs: number
  }): Promise<void> {
    await this.redis.set(
      this.getBlockedKey(input.keyPrefix, input.key),
      `${input.blockedUntilMs}`,
      "PX",
      Math.max(1, input.blockedUntilMs - input.nowMs)
    )
  }

  async getBlockedUntil(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly nowMs: number
  }): Promise<number | null> {
    const value = await this.redis.get(
      this.getBlockedKey(input.keyPrefix, input.key)
    )
    if (!value) {
      return null
    }

    const blockedUntilMs = Number.parseInt(value, 10)
    return blockedUntilMs > input.nowMs ? blockedUntilMs : null
  }

  async reset(input: {
    readonly key: string
    readonly keyPrefix: string
  }): Promise<void> {
    await this.redis.del(
      this.getSlidingWindowKey(input.keyPrefix, input.key),
      this.getTokenBucketKey(input.keyPrefix, input.key),
      this.getBlockedKey(input.keyPrefix, input.key)
    )
  }

  private getFixedWindowKey(
    keyPrefix: string,
    key: string,
    windowStartMs: number
  ): string {
    return `${keyPrefix}:fixed:${key}:${windowStartMs}`
  }

  private getSlidingWindowKey(keyPrefix: string, key: string): string {
    return `${keyPrefix}:sliding:${key}`
  }

  private getTokenBucketKey(keyPrefix: string, key: string): string {
    return `${keyPrefix}:bucket:${key}`
  }

  private getBlockedKey(keyPrefix: string, key: string): string {
    return `${keyPrefix}:blocked:${key}`
  }
}
