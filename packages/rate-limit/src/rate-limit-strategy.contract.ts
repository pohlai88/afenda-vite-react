import type {
  RateLimitDecision,
  RateLimitStoreAdapter,
  RateLimiterRequest,
  RateLimitStrategyId,
} from "./rate-limit.contract"

export type RateLimitStrategyRuntime = Readonly<{
  nowMs: number
  store: RateLimitStoreAdapter
}>

export interface RateLimitStrategyExecutor {
  readonly id: RateLimitStrategyId
  execute(
    request: RateLimiterRequest,
    runtime: RateLimitStrategyRuntime
  ): Promise<RateLimitDecision>
  inspect(
    request: RateLimiterRequest,
    runtime: RateLimitStrategyRuntime
  ): Promise<RateLimitDecision>
}
