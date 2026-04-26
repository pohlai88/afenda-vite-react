# Legacy Mapping

Source:

- Legacy package: [`.legacy/cna-templates/packages/metrics`](/C:/NexusCanon/afenda-react-vite/.legacy/cna-templates/packages/metrics)
- New package: [`packages/metrics`](/C:/NexusCanon/afenda-react-vite/packages/metrics)

## Preserved

- Prometheus registry
- default Node runtime metrics
- HTTP request duration histogram
- HTTP request total counter
- DB query duration histogram
- event total counter
- cache hit total counter
- metrics text handler

## Intentionally changed

- Hono middleware replaces Next.js wrappers
- metrics are created from a typed factory instead of global module singletons
- helper recorders are explicit; no Prisma middleware coupling
- metric names are app-scoped via labels, not package-global process assumptions
