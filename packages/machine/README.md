# @afenda/machine

`@afenda/machine` is the governed machine-runtime package for Afenda.

The machine identity is **Lynx**.

This package exists to prevent legacy-style AI package drift where one package mixes:

- provider SDK wiring
- assistant prompts
- ERP context scraping
- product-specific skills
- domain business logic

## What this package owns

- neutral machine contracts
- machine manifest and skill registry
- Lynx runtime input/output contracts
- a governed runtime factory that delegates to a provider adapter
- a safe preview provider for local development and tests
- a default general Lynx skill

## What this package does not own

- product UI
- module-specific ERP assistants
- finance, HR, MRP, CRM, or costing business logic
- direct database or master-data reads
- provider-specific SDK packages in the root package boundary

Those concerns belong in owner-local module surfaces or future governed extension/plugin slices.

## Package structure

```text
packages/machine/
├─ src/
│  ├─ core/      # contracts and registry
│  ├─ runtime/   # Lynx runtime contracts and factories
│  ├─ skills/    # package-owned neutral baseline skills only
│  └─ index.ts
├─ tests/        # registry and runtime tests
└─ scripts/      # public surface and build-boundary assertions
```

## Public surface

The root package exports:

- core contracts and `createMachineRegistry(...)`
- Lynx runtime contracts and `createLynxMachineRuntime(...)`
- `createPreviewMachineProvider(...)`
- package-owned baseline skills and `lynxCoreManifest`

## Why "machine" instead of "ai"

Afenda uses **machine** as the neutral internal execution term.
`Lynx` is the machine identity.

This avoids turning the package name into a vendor claim, product promise, or one-model assumption.

## Development

From the repo root:

```bash
pnpm --filter @afenda/machine run lint
pnpm --filter @afenda/machine run typecheck
pnpm --filter @afenda/machine run test:run
pnpm --filter @afenda/machine run build
pnpm --filter @afenda/machine run surface:check
```
