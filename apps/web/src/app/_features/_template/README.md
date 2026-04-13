# Feature module template (`_features/_template`)

This folder is the copyable template for ERP/product features. Copy it to `_features/<feature-name>` and rename exported symbols (`FeatureTemplate*` → your feature name) before shipping a real module.

## Ownership

Use this template for user-facing ERP capabilities. Use `_platform/_template` for app runtime infrastructure (shell, route composition, i18n, permissions, providers, client-store, server-state).

## Naming convention

| Concern        | Pattern                                                         |
| -------------- | --------------------------------------------------------------- |
| Feature folder | `kebab-case`                                                    |
| Component      | `PascalCase.tsx`                                                |
| Hook           | `use-<feature>-<purpose>.ts`                                    |
| Action module  | `<feature>-actions.ts`                                          |
| Service module | `<feature>-service.ts`                                          |
| Type module    | `<feature>.ts` or `<feature>-contract.ts`                       |
| Utility module | `<feature>-utils.ts`                                            |
| Script module  | `<feature>-template-report.ts` or `check-<feature>-contract.ts` |
| Test module    | `<feature>-contract.test.ts`                                    |

## Copy checklist

- Rename exported symbols and test names.
- Keep `index.ts` as the only cross-module import surface.
- Keep route composition outside the feature.
- Replace seed service data with an API boundary when the backend contract exists.
- Keep persistent schema and migrations out of the Vite client.
