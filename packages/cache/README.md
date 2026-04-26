# Cache

`@afenda/cache` is the typed Afenda replacement for the legacy CNA `@vierp/cache` package from [`.legacy/cna-templates/packages/cache`](/C:/NexusCanon/afenda-react-vite/.legacy/cna-templates/packages/cache).

It preserves the useful developer-facing API:

- `CacheManager`
- `CacheKeys`
- `CacheTTL`
- `RequestDeduplicator`
- `BatchLoader`
- cursor helpers

The implementation is modernized for the current monorepo:

- no `any`
- no fake Redis stub that silently does nothing
- explicit optional L2 adapter contract
- deterministic stats and eviction tracking
- cleanup timers can be disposed safely

## Validation

Run from the repo root:

```powershell
pnpm --filter @afenda/cache typecheck
pnpm --filter @afenda/cache test:run
```
