import type {
  RateLimitDecision,
  RateLimiterRequest,
  RateLimitStrategyId,
  RateLimitStoreAdapter,
} from "./rate-limit.contract"
import { RATE_LIMIT_HEADER_NAMES } from "./rate-limit.contract"
import type {
  RateLimitStrategyExecutor,
  RateLimitStrategyRuntime,
} from "./rate-limit-strategy.contract"

export interface RateLimiterServiceOptions {
  readonly store: RateLimitStoreAdapter
  readonly now?: () => number
}

export class RateLimiterService {
  private readonly store: RateLimitStoreAdapter
  private readonly now: () => number

  constructor(options: RateLimiterServiceOptions) {
    this.store = options.store
    this.now = options.now ?? Date.now
  }

  async consume(request: RateLimiterRequest): Promise<RateLimitDecision> {
    return this.resolveExecutor(request.policy.strategy).execute(request, {
      nowMs: this.now(),
      store: this.store,
    })
  }

  async inspect(request: RateLimiterRequest): Promise<RateLimitDecision> {
    return this.resolveExecutor(request.policy.strategy).inspect(request, {
      nowMs: this.now(),
      store: this.store,
    })
  }

  reset(request: Pick<RateLimiterRequest, "key" | "policy">): Promise<void> {
    return this.store.reset({
      key: request.key,
      keyPrefix: request.policy.keyPrefix ?? request.policy.name,
    })
  }

  private resolveExecutor(
    strategy: RateLimitStrategyId | undefined
  ): RateLimitStrategyExecutor {
    switch (strategy ?? "fixed-window") {
      case "sliding-window":
        return slidingWindowExecutor
      case "token-bucket":
        return tokenBucketExecutor
      case "fixed-window":
      default:
        return fixedWindowExecutor
    }
  }
}

const fixedWindowExecutor: RateLimitStrategyExecutor = {
  id: "fixed-window",
  execute: async (request, runtime) => {
    const normalized = normalizeRequest(request)
    const blocked = await runtime.store.getBlockedUntil({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      nowMs: runtime.nowMs,
    })
    if (blocked) {
      return buildDecision({
        request,
        strategy: "fixed-window",
        nowMs: runtime.nowMs,
        consumed: normalized.limit,
        blockedUntilMs: blocked,
        resetAtMs: blocked,
      })
    }

    const current = await runtime.store.consumeFixedWindow({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      points: normalized.points,
      limit: normalized.limit,
      windowMs: normalized.windowMs,
      nowMs: runtime.nowMs,
    })

    const overLimit = current.consumed > normalized.limit
    const blockedUntilMs = overLimit
      ? await blockIfNeeded(request, runtime, normalized.blockDurationMs)
      : null

    return buildDecision({
      request,
      strategy: "fixed-window",
      nowMs: runtime.nowMs,
      consumed: current.consumed,
      blockedUntilMs,
      resetAtMs: blockedUntilMs ?? current.resetAtMs,
    })
  },
  inspect: async (request, runtime) => {
    const normalized = normalizeRequest(request)
    const blockedUntilMs = await runtime.store.getBlockedUntil({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      nowMs: runtime.nowMs,
    })
    const current = await runtime.store.getFixedWindow({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      windowMs: normalized.windowMs,
      nowMs: runtime.nowMs,
    })
    return buildDecision({
      request,
      strategy: "fixed-window",
      nowMs: runtime.nowMs,
      consumed: blockedUntilMs ? normalized.limit : current.consumed,
      blockedUntilMs,
      resetAtMs: blockedUntilMs ?? current.resetAtMs,
    })
  },
}

const slidingWindowExecutor: RateLimitStrategyExecutor = {
  id: "sliding-window",
  execute: async (request, runtime) => {
    const normalized = normalizeRequest(request)
    const blocked = await runtime.store.getBlockedUntil({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      nowMs: runtime.nowMs,
    })
    if (blocked) {
      return buildDecision({
        request,
        strategy: "sliding-window",
        nowMs: runtime.nowMs,
        consumed: normalized.limit,
        blockedUntilMs: blocked,
        resetAtMs: blocked,
      })
    }

    const current = await runtime.store.consumeSlidingWindow({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      points: normalized.points,
      limit: normalized.limit,
      windowMs: normalized.windowMs,
      nowMs: runtime.nowMs,
    })
    const overLimit = current.consumed > normalized.limit
    const blockedUntilMs = overLimit
      ? await blockIfNeeded(request, runtime, normalized.blockDurationMs)
      : null

    return buildDecision({
      request,
      strategy: "sliding-window",
      nowMs: runtime.nowMs,
      consumed: current.consumed,
      blockedUntilMs,
      resetAtMs: blockedUntilMs ?? current.resetAtMs,
    })
  },
  inspect: async (request, runtime) => {
    const normalized = normalizeRequest(request)
    const blockedUntilMs = await runtime.store.getBlockedUntil({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      nowMs: runtime.nowMs,
    })
    const current = await runtime.store.getSlidingWindow({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      windowMs: normalized.windowMs,
      nowMs: runtime.nowMs,
    })
    return buildDecision({
      request,
      strategy: "sliding-window",
      nowMs: runtime.nowMs,
      consumed: blockedUntilMs ? normalized.limit : current.consumed,
      blockedUntilMs,
      resetAtMs: blockedUntilMs ?? current.resetAtMs,
    })
  },
}

const tokenBucketExecutor: RateLimitStrategyExecutor = {
  id: "token-bucket",
  execute: async (request, runtime) => {
    const normalized = normalizeRequest(request)
    const blocked = await runtime.store.getBlockedUntil({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      nowMs: runtime.nowMs,
    })
    if (blocked) {
      return buildDecision({
        request,
        strategy: "token-bucket",
        nowMs: runtime.nowMs,
        consumed: normalized.limit,
        blockedUntilMs: blocked,
        resetAtMs: blocked,
      })
    }

    const current = await runtime.store.consumeTokenBucket({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      points: normalized.points,
      limit: normalized.limit,
      windowMs: normalized.windowMs,
      nowMs: runtime.nowMs,
    })
    const overLimit = current.remainingTokens < 0
    const consumed = overLimit
      ? normalized.limit + Math.abs(Math.floor(current.remainingTokens))
      : current.consumed
    const blockedUntilMs = overLimit
      ? await blockIfNeeded(request, runtime, normalized.blockDurationMs)
      : null

    return buildDecision({
      request,
      strategy: "token-bucket",
      nowMs: runtime.nowMs,
      consumed,
      blockedUntilMs,
      resetAtMs: blockedUntilMs ?? current.resetAtMs,
    })
  },
  inspect: async (request, runtime) => {
    const normalized = normalizeRequest(request)
    const blockedUntilMs = await runtime.store.getBlockedUntil({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      nowMs: runtime.nowMs,
    })
    const current = await runtime.store.getTokenBucket({
      key: request.key,
      keyPrefix: normalized.keyPrefix,
      limit: normalized.limit,
      windowMs: normalized.windowMs,
      nowMs: runtime.nowMs,
    })
    return buildDecision({
      request,
      strategy: "token-bucket",
      nowMs: runtime.nowMs,
      consumed: blockedUntilMs ? normalized.limit : current.consumed,
      blockedUntilMs,
      resetAtMs: blockedUntilMs ?? current.resetAtMs,
    })
  },
}

async function blockIfNeeded(
  request: RateLimiterRequest,
  runtime: RateLimitStrategyRuntime,
  blockDurationMs: number
): Promise<number | null> {
  if (blockDurationMs <= 0) {
    return null
  }

  const keyPrefix = request.policy.keyPrefix ?? request.policy.name
  const blockedUntilMs = runtime.nowMs + blockDurationMs
  await runtime.store.setBlockedUntil({
    key: request.key,
    keyPrefix,
    blockedUntilMs,
    nowMs: runtime.nowMs,
  })
  return blockedUntilMs
}

function buildDecision(input: {
  readonly request: RateLimiterRequest
  readonly strategy: RateLimitStrategyId
  readonly nowMs: number
  readonly consumed: number
  readonly blockedUntilMs: number | null
  readonly resetAtMs: number
}): RateLimitDecision {
  const normalized = normalizeRequest(input.request)
  const allowed =
    input.blockedUntilMs === null && input.consumed <= normalized.limit
  const remaining = allowed ? Math.max(0, normalized.limit - input.consumed) : 0
  const retryAfterMs = allowed
    ? 0
    : Math.max(0, (input.blockedUntilMs ?? input.resetAtMs) - input.nowMs)

  return {
    allowed,
    key: input.request.key,
    policy: input.request.policy,
    strategy: input.strategy,
    limit: normalized.limit,
    consumed: Math.max(0, input.consumed),
    remaining,
    retryAfterMs,
    resetAtMs: input.resetAtMs,
    blockedUntilMs: input.blockedUntilMs,
    headers: {
      limit: `${normalized.limit}`,
      remaining: `${remaining}`,
      reset: `${Math.ceil(input.resetAtMs / 1000)}`,
      retryAfter: allowed ? undefined : `${Math.ceil(retryAfterMs / 1000)}`,
    },
  }
}

function normalizeRequest(request: RateLimiterRequest): {
  readonly limit: number
  readonly windowMs: number
  readonly points: number
  readonly blockDurationMs: number
  readonly keyPrefix: string
} {
  return {
    limit: request.policy.limit,
    windowMs: request.policy.windowMs,
    points: request.points ?? 1,
    blockDurationMs: request.policy.blockDurationMs ?? 0,
    keyPrefix: request.policy.keyPrefix ?? request.policy.name,
  }
}

export function applyRateLimitHeaders(
  headers: Headers,
  decision: RateLimitDecision
): void {
  headers.set(RATE_LIMIT_HEADER_NAMES.limit, decision.headers.limit)
  headers.set(RATE_LIMIT_HEADER_NAMES.remaining, decision.headers.remaining)
  headers.set(RATE_LIMIT_HEADER_NAMES.reset, decision.headers.reset)
  if (decision.headers.retryAfter) {
    headers.set(RATE_LIMIT_HEADER_NAMES.retryAfter, decision.headers.retryAfter)
  }
}
