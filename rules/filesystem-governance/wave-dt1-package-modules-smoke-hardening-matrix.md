# Wave DT.1 Package Modules Smoke Hardening Matrix

This matrix records the bounded `database-truth` slice that hardened the load-sensitive package module smoke test.

| Load-sensitive surface | Failure mode before | Hardening applied | Result |
| --- | --- | --- | --- |
| `packages/_database/src/__tests__/package-modules.smoke.test.ts` | Default 5s Vitest timeout and bursty `Promise.all()` dynamic imports caused intermittent timeout under aggregated Turbo/Vitest workload, even though the same test passed in isolation. | Added an explicit 30s per-test timeout and changed coverage-load imports to deterministic sequential loading for the heavy declarative module graph. | Database package `test:run`, repo-wide `test:run`, and full root `check` now pass consistently in this slice. |
