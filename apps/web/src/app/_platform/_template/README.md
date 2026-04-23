# Platform Capability Template

Copy this folder to `_platform/<capability>` before building a new platform capability. Then rename exported symbols from `PlatformCapabilityTemplate*` to the concrete capability name.

Use this template for cross-feature runtime infrastructure only:

- app shell
- route composition
- i18n runtime
- server-state/query setup
- client-store setup
- permissions and guards
- providers and error boundaries

Do not use this template for ERP modules such as finance, inventory, audit, sales, or counterparty operations. Those belong in `_features`.

## Folders

| Folder        | Purpose                                                                   |
| ------------- | ------------------------------------------------------------------------- |
| `adapters/`   | Wrap third-party runtime libraries and keep library-specific types local. |
| `components/` | Platform UI composition such as shell, guards, and boundaries.            |
| `hooks/`      | Platform hooks that features may consume.                                 |
| `policy/`     | Constants, allowed capabilities, and dependency direction rules.          |
| `scripts/`    | Platform-local maintenance/report modules.                                |
| `services/`   | Platform runtime service boundary.                                        |
| `types/`      | Public contracts and stable types.                                        |
| `utils/`      | Pure helpers local to this capability.                                    |
| `__tests__/`  | Contract tests for policy and public behavior.                            |

## Boundary Rule

Platform capabilities may compose feature root exports in route-level code, but they must not import feature internals.

## Naming Convention

| Concern           | Pattern                                                               |
| ----------------- | --------------------------------------------------------------------- |
| Capability folder | `kebab-case`                                                          |
| Component         | `PascalCase.tsx`                                                      |
| Hook              | `use-<capability>-<purpose>.ts`                                       |
| Adapter module    | `<capability>-adapter.ts`                                             |
| Policy module     | `<capability>-policy.ts`                                              |
| Service module    | `<capability>-service.ts`                                             |
| Type module       | `<capability>.ts` or `<capability>-contract.ts`                       |
| Utility module    | `<capability>-utils.ts`                                               |
| Script module     | `<capability>-template-report.ts` or `check-<capability>-contract.ts` |
| Test module       | `<capability>-contract.test.ts` or `<capability>-policy.test.ts`      |
