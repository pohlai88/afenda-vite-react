import type { RateLimitPolicy } from "./rate-limit.contract"

export const PUBLIC_RATE_LIMIT_POLICY: RateLimitPolicy = {
  name: "public",
  keyPrefix: "rl:public",
  limit: 100,
  windowMs: 60_000,
  blockDurationMs: 60_000,
  strategy: "fixed-window",
}

export const AUTHENTICATED_RATE_LIMIT_POLICY: RateLimitPolicy = {
  name: "authenticated",
  keyPrefix: "rl:auth",
  limit: 500,
  windowMs: 60_000,
  blockDurationMs: 120_000,
  strategy: "fixed-window",
}

export const ADMIN_RATE_LIMIT_POLICY: RateLimitPolicy = {
  name: "admin",
  keyPrefix: "rl:admin",
  limit: 1_000,
  windowMs: 60_000,
  blockDurationMs: 120_000,
  strategy: "fixed-window",
}

export const WEBHOOK_RATE_LIMIT_POLICY: RateLimitPolicy = {
  name: "webhook",
  keyPrefix: "rl:webhook",
  limit: 50,
  windowMs: 60_000,
  blockDurationMs: 300_000,
  strategy: "fixed-window",
}
