# Migration Notes: Legacy `saas` -> `@afenda/billing`

## Preserved

- pricing plan catalog
- subscription creation, tier change, cancellation, and renewal rules
- invoice generation
- MRR normalization across monthly, quarterly, and yearly contracts

## Deliberately Excluded

- usage metering
- onboarding step generation
- tenant provisioning
- multi-tenant platform orchestration

## Why

The legacy `saas` package combined too many domains in one file. Afenda keeps the reusable commercial core and leaves the rest in their proper bounded contexts.
