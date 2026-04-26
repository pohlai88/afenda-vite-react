import type { RateLimitStoreAdapter } from "./rate-limit.contract"

type TokenBucketState = {
  tokens: number
  lastRefillMs: number
}

export class MemoryRateLimitStoreAdapter implements RateLimitStoreAdapter {
  private readonly fixedWindows = new Map<string, number>()
  private readonly slidingWindows = new Map<string, number[]>()
  private readonly tokenBuckets = new Map<string, TokenBucketState>()
  private readonly blockedKeys = new Map<string, number>()

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
    const consumed = (this.fixedWindows.get(bucketKey) ?? 0) + input.points
    this.fixedWindows.set(bucketKey, consumed)
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
      consumed: this.fixedWindows.get(bucketKey) ?? 0,
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
    const current = (this.slidingWindows.get(bucketKey) ?? []).filter(
      (entry) => entry > windowStartMs
    )

    for (let index = 0; index < input.points; index += 1) {
      current.push(input.nowMs + index * 0.001)
    }

    this.slidingWindows.set(bucketKey, current)
    const earliest = current[0] ?? input.nowMs
    return {
      consumed: current.length,
      resetAtMs: Math.ceil(earliest) + input.windowMs,
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
    const current = (this.slidingWindows.get(bucketKey) ?? []).filter(
      (entry) => entry > windowStartMs
    )
    this.slidingWindows.set(bucketKey, current)
    const earliest = current[0] ?? input.nowMs
    return {
      consumed: current.length,
      resetAtMs: Math.ceil(earliest) + input.windowMs,
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
    const current = this.tokenBuckets.get(bucketKey) ?? {
      tokens: input.limit,
      lastRefillMs: input.nowMs,
    }

    const elapsedMs = Math.max(0, input.nowMs - current.lastRefillMs)
    const refilledTokens = Math.min(
      input.limit,
      current.tokens + elapsedMs * refillPerMs
    )
    const remainingTokens = refilledTokens - input.points
    this.tokenBuckets.set(bucketKey, {
      tokens: Math.max(0, remainingTokens),
      lastRefillMs: input.nowMs,
    })

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
    const current = this.tokenBuckets.get(bucketKey) ?? {
      tokens: input.limit,
      lastRefillMs: input.nowMs,
    }
    const elapsedMs = Math.max(0, input.nowMs - current.lastRefillMs)
    const remainingTokens = Math.min(
      input.limit,
      current.tokens + elapsedMs * refillPerMs
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
    this.blockedKeys.set(
      this.getBlockedKey(input.keyPrefix, input.key),
      input.blockedUntilMs
    )
  }

  async getBlockedUntil(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly nowMs: number
  }): Promise<number | null> {
    const storageKey = this.getBlockedKey(input.keyPrefix, input.key)
    const blockedUntilMs = this.blockedKeys.get(storageKey) ?? null
    if (blockedUntilMs !== null && blockedUntilMs <= input.nowMs) {
      this.blockedKeys.delete(storageKey)
      return null
    }

    return blockedUntilMs
  }

  async reset(input: {
    readonly key: string
    readonly keyPrefix: string
  }): Promise<void> {
    this.blockedKeys.delete(this.getBlockedKey(input.keyPrefix, input.key))
    this.slidingWindows.delete(
      this.getSlidingWindowKey(input.keyPrefix, input.key)
    )
    this.tokenBuckets.delete(this.getTokenBucketKey(input.keyPrefix, input.key))

    for (const fixedWindowKey of this.fixedWindows.keys()) {
      if (fixedWindowKey.startsWith(`${input.keyPrefix}:fixed:${input.key}:`)) {
        this.fixedWindows.delete(fixedWindowKey)
      }
    }
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
