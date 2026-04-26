# `@afenda/billing`

Commercial billing domain primitives for Afenda.

## Owns

- billing plan catalog
- subscription lifecycle rules
- invoice generation truth
- monthly recurring revenue reporting

## Does Not Own

- feature entitlement checks
- tenant provisioning
- onboarding UX
- payment gateway integrations
- route middleware or transport concerns

This package is the narrow Afenda extraction of the valuable commercial core from the legacy `saas` template. It intentionally does not recreate a monolithic `saas` package.

## Boundary

- `@afenda/billing`: plans, subscriptions, invoices, MRR
- `@afenda/feature-flags`: entitlements and tier/module evaluation
- `@afenda/admin`: tenant admin operations
- apps/API: payment providers, billing routes, checkout, customer-facing billing UX
