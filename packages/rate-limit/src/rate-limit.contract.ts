export const rateLimitStrategyIds = [
  "fixed-window",
  "sliding-window",
  "token-bucket",
] as const

export type RateLimitStrategyId = (typeof rateLimitStrategyIds)[number]

export type RateLimitKeyContext = Readonly<{
  ip?: string
  userId?: string
  apiKey?: string
  pathname?: string
  method?: string
}>

export type RateLimitKeyGenerator = (context: RateLimitKeyContext) => string

export type RateLimitPolicy = Readonly<{
  name: string
  limit: number
  windowMs: number
  blockDurationMs?: number
  keyPrefix?: string
  strategy?: RateLimitStrategyId
}>

export type RateLimitHeaders = Readonly<{
  limit: string
  remaining: string
  reset: string
  retryAfter?: string
}>

export type RateLimitDecision = Readonly<{
  allowed: boolean
  key: string
  policy: RateLimitPolicy
  strategy: RateLimitStrategyId
  limit: number
  consumed: number
  remaining: number
  retryAfterMs: number
  resetAtMs: number
  blockedUntilMs: number | null
  headers: RateLimitHeaders
}>

export interface RateLimitStoreAdapter {
  consumeFixedWindow(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly points: number
    readonly limit: number
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{ readonly consumed: number; readonly resetAtMs: number }>
  getFixedWindow(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{ readonly consumed: number; readonly resetAtMs: number }>
  consumeSlidingWindow(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly points: number
    readonly limit: number
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{ readonly consumed: number; readonly resetAtMs: number }>
  getSlidingWindow(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{ readonly consumed: number; readonly resetAtMs: number }>
  consumeTokenBucket(input: {
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
  }>
  getTokenBucket(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly limit: number
    readonly windowMs: number
    readonly nowMs: number
  }): Promise<{
    readonly consumed: number
    readonly remainingTokens: number
    readonly resetAtMs: number
  }>
  setBlockedUntil(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly blockedUntilMs: number
    readonly nowMs: number
  }): Promise<void>
  getBlockedUntil(input: {
    readonly key: string
    readonly keyPrefix: string
    readonly nowMs: number
  }): Promise<number | null>
  reset(input: {
    readonly key: string
    readonly keyPrefix: string
  }): Promise<void>
}

export interface RateLimiterRequest {
  readonly key: string
  readonly points?: number
  readonly policy: RateLimitPolicy
}

export const RATE_LIMIT_HEADER_NAMES = {
  limit: "X-RateLimit-Limit",
  remaining: "X-RateLimit-Remaining",
  reset: "X-RateLimit-Reset",
  retryAfter: "Retry-After",
} as const
