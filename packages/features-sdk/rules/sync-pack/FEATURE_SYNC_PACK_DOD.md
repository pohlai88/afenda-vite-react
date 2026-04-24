# Feature Sync-Pack Definition Of Done

For internal Afenda use, Sync-Pack is done when:

- `feature-sync` is the deterministic start-here command
- `feature-sync:verify` is the explicit daily workflow
- `feature-sync:intent-check` validates maintainer truth-binding coverage
- `feature-sync:sync-examples` is the explicit repair path for example fitness
- `feature-sync:quality-validate` closes the package with a read-only verdict
- golden examples stay governed and fit for reuse
- junior-facing docs match the live CLI

Required validation path:

```txt
pnpm --filter @afenda/features-sdk typecheck
pnpm --filter @afenda/features-sdk build
pnpm --filter @afenda/features-sdk test:run
pnpm --filter @afenda/features-sdk lint
pnpm run feature-sync:intent-check
pnpm run feature-sync:sync-examples
pnpm run feature-sync:quality-validate
```
