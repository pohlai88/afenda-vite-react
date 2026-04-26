# Metrics

`@afenda/metrics` is the server-only Afenda replacement for the legacy CNA `@vierp/metrics` package from [`.legacy/cna-templates/packages/metrics`](/C:/NexusCanon/afenda-react-vite/.legacy/cna-templates/packages/metrics).

It provides:

- Prometheus registries and default Node metrics
- HTTP request duration and totals middleware for Hono
- DB, event, and cache metric recorders
- a plaintext `/metrics` handler

It does **not** own:

- business KPI modeling
- frontend telemetry
- tracing
- logging

## Validation

Run from the repo root:

```powershell
pnpm --filter @afenda/metrics typecheck
pnpm --filter @afenda/metrics test:run
```
