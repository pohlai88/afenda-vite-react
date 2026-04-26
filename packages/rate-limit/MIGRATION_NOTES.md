# Migration Notes: Legacy `rate-limit` -> `@afenda/rate-limit`

## Preserved

- fixed-window, sliding-window, and token-bucket strategies
- per-key rate limit evaluation
- reusable policy presets
- Redis-backed honest mode

## Rewritten

- removed Next.js API wrapper
- removed Express middleware
- replaced generic legacy filenames with Afenda-governed names
- added a Hono middleware surface for `apps/api`
- made memory storage explicit as dev/test-only infrastructure

## Boundary

- `packages/rate-limit` owns engine + strategies + stores + Hono adapter
- `apps/api` decides where policies apply
- `@afenda/better-auth` may consume this later, but does not own the generic implementation
