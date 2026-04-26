# Legacy Mapping

Source:

- Legacy package: [`.legacy/cna-templates/packages/feature-flags`](/C:/NexusCanon/afenda-react-vite/.legacy/cna-templates/packages/feature-flags)
- New package: [`packages/feature-flags`](/C:/NexusCanon/afenda-react-vite/packages/feature-flags)

## Preserved

- `isFeatureEnabled`
- `requireTier`
- `requireFeature`
- `getFeaturesForTier`
- `getFeaturesByTier`
- `isModuleAccessible`
- `createFeatureGuard`

## Intentionally changed

- `Tier` is now local to this package instead of coming from a legacy shared package.
- feature evaluation can read tenant metadata from the current Afenda convention:
  `tenants.metadata.admin.tier` and `tenants.metadata.admin.enabledModules`
- the error type now extends `AppError` from `@afenda/errors`
- the package is no longer coupled to framework-specific middleware wording

## Not ported 1:1

- dependency on `@vierp/shared`
- hardcoded bilingual copy in every feature description as a transport concern
- direct dependency on any database package
