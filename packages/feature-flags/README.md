# Feature Flags

`@afenda/feature-flags` is the typed Afenda replacement for the legacy CNA `@vierp/feature-flags` package from [`.legacy/cna-templates/packages/feature-flags`](/C:/NexusCanon/afenda-react-vite/.legacy/cna-templates/packages/feature-flags).

It owns:

- the canonical feature catalog
- tier-based feature evaluation
- tenant metadata-based overrides
- shared guards such as `requireTier()` and `requireFeature()`

It does **not** own:

- Vite configuration
- route middleware
- database access
- authorization / permissions

The package is runtime-only and transport-safe. Callers may supply tenant metadata from `mdm.tenants.metadata` or from an API/session projection.
