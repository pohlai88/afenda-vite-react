import type { Context, MiddlewareHandler } from "hono"

import type {
  RateLimitDecision,
  RateLimitKeyContext,
  RateLimitKeyGenerator,
  RateLimitPolicy,
} from "./rate-limit.contract"
import {
  applyRateLimitHeaders,
  RateLimiterService,
} from "./rate-limiter.service"

function defaultKeyGenerator(context: RateLimitKeyContext): string {
  return (
    context.userId ??
    context.apiKey ??
    context.ip ??
    `${context.method ?? "GET"}:${context.pathname ?? "unknown"}`
  )
}

function resolveIp(context: Context): string | undefined {
  const forwarded = context.req.header("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim()
  }

  return context.req.header("x-real-ip") ?? undefined
}

export interface HonoRateLimitMiddlewareOptions {
  readonly limiter: RateLimiterService
  readonly policy: RateLimitPolicy
  readonly keyGenerator?: RateLimitKeyGenerator
  readonly shouldApply?: (context: Context) => boolean
  readonly onRejected?: (
    context: Context,
    decision: RateLimitDecision
  ) => Response | Promise<Response>
}

export function createHonoRateLimitMiddleware(
  options: HonoRateLimitMiddlewareOptions
): MiddlewareHandler {
  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator

  return async (context, next) => {
    if (options.shouldApply && !options.shouldApply(context)) {
      await next()
      return
    }

    const decision = await options.limiter.consume({
      key: keyGenerator({
        ip: resolveIp(context),
        pathname: context.req.path,
        method: context.req.method,
      }),
      policy: options.policy,
    })

    if (!decision.allowed) {
      const response =
        (await options.onRejected?.(context, decision)) ??
        context.json(
          {
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests. Please try again later.",
            retryAfterMs: decision.retryAfterMs,
            resetAt: new Date(decision.resetAtMs).toISOString(),
          },
          429
        )
      applyRateLimitHeaders(response.headers, decision)
      return response
    }

    await next()
    applyRateLimitHeaders(context.res.headers, decision)
  }
}
