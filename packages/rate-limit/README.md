# `@afenda/rate-limit`

Afenda-native rate limiting infrastructure for server runtimes.

## Package Boundary

This package owns:

- strategy-aware limiter contracts
- memory and Redis-backed store adapters
- limiter orchestration
- Hono middleware
- reusable policy presets

This package does not own:

- route decisions about where limits apply
- app-specific error envelopes
- Redis provisioning
- auth-specific product policy

## Runtime Posture

- `MemoryRateLimitStoreAdapter` is for local development and tests.
- `RedisRateLimitStoreAdapter` is the honest multi-instance option.

## Quick Start

```ts
import {
  MemoryRateLimitStoreAdapter,
  PUBLIC_RATE_LIMIT_POLICY,
  RateLimiterService,
  createHonoRateLimitMiddleware,
} from "@afenda/rate-limit"

const limiter = new RateLimiterService({
  store: new MemoryRateLimitStoreAdapter(),
})

app.use(
  "/api/*",
  createHonoRateLimitMiddleware({
    limiter,
    policy: PUBLIC_RATE_LIMIT_POLICY,
  })
)
```
