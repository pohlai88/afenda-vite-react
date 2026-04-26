# Legacy Mapping

Source:

- Legacy package: [`.legacy/cna-templates/packages/cache`](/C:/NexusCanon/afenda-react-vite/.legacy/cna-templates/packages/cache)
- New package: [`packages/cache`](/C:/NexusCanon/afenda-react-vite/packages/cache)

## Preserved

- `CacheManager`
- `CacheKeys`
- `CacheTTL`
- `CacheStrategy`
- `encodeCursor`
- `decodeCursor`
- `buildCursorQuery`
- `RequestDeduplicator`
- `BatchLoader`

## Intentionally changed

- L2 cache is now an explicit adapter contract instead of commented-out Redis calls.
- `CacheEntry<T = any>` became `CacheEntry<T = unknown>`.
- L1 eviction now updates stats and tag indexes correctly.
- cleanup intervals are disposable and unref'd so they do not hold the process open.
- stats no longer report hardcoded evictions.

## Not ported 1:1

- direct `ioredis` dependency
- Prisma-specific assumptions beyond the legacy-compatible cursor query descriptor
- implicit background behavior without disposal controls
