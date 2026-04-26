# Operator Kernel Developer Handoff

This document is a contributor handoff for `packages/operator-kernel`.

It is a summary-only orientation surface. It is **not** the source of truth.

## Status

- Internal governed runtime boundary: accepted and implemented
- Package visibility: private/internal workspace package
- Delivery posture: runtime package only
- Not included here: standalone CLI ownership or full MCP server ownership

## Source of truth

Use these sources in order:

1. [`docs/architecture/adr/ADR-0016-operator-kernel-governed-runtime-boundaries.md`](../../../docs/architecture/adr/ADR-0016-operator-kernel-governed-runtime-boundaries.md)
2. [`README.md`](../README.md)
3. [`src/index.ts`](../src/index.ts)
4. [`src/core/index.ts`](../src/core/index.ts)
5. [`src/runtime/contracts.ts`](../src/runtime/contracts.ts)
6. [`src/runtime/create-default-operator-runtime.ts`](../src/runtime/create-default-operator-runtime.ts)
7. [`src/plugins/features-sdk/plugin.ts`](../src/plugins/features-sdk/plugin.ts)

This handoff must stay descriptive. If it disagrees with those files, those files win.

## What this package is

`@afenda/operator-kernel` is Afenda's governed internal operator runtime package.

It currently provides:

- runtime-neutral core contracts for tools, resources, safety policies, and plugin manifests
- governed runtime contracts for modes, tool names, execution input parsing, and execution output
- a default runtime surface that wraps the Feature SDK Sync-Pack workflow catalog
- a minimal MCP-style adapter runtime wrapper

## What this package is not

This package is not:

- a standalone CLI product
- a full MCP transport server
- an arbitrary command-execution surface
- the owner of persistence, auth, or tenant/session orchestration

## Current contract highlights

### Core contract surface

`src/core/contracts.ts` defines the neutral runtime primitives:

- `OperatorCapability`
- `OperatorToolDefinition`
- `OperatorToolExecutionContext`
- `OperatorResourceDefinition`
- `OperatorSafetyPolicy`
- `OperatorPluginManifest`

`src/core/index.ts` also re-exports the main composition helpers:

- `OperatorFinding` and `OperatorFindingResult`
- `createOperatorRegistry`
- `createOperatorOrchestrator`

### Runtime contract surface

`src/runtime/contracts.ts` defines the governed runtime contract:

- operator modes: `guided_operator`, `feature_devops`, `architect_commander`
- governed tool names in `OPERATOR_TOOL_NAMES`
- input parsing via `OperatorExecuteInputSchema`
- normalized success/failure execution result shapes
- the `OperatorRuntime` interface

`src/runtime/create-default-operator-runtime.ts` is the concrete built-in runtime entrypoint.

`src/plugins/features-sdk/plugin.ts` is the bundled plugin wiring entrypoint.

## Where to start when changing behavior

- For neutral contracts and exported shared types: `src/core/contracts.ts` and `src/core/index.ts`
- For registry/orchestration assembly: `src/core/registry.ts` and `src/core/orchestrator.ts`
- For runtime input/output or governed runtime behavior: `src/runtime/contracts.ts` and `src/runtime/create-default-operator-runtime.ts`
- For Feature SDK tool wiring, mode policy, guards, and explanations: `src/plugins/features-sdk/**`
- For the adapter wrapper only: `src/mcp-adapter/index.ts`

## What developers may change

Developers may extend this package through the governed contract paths, including:

- adding or refining governed tool definitions
- adding plugin manifests and plugin wiring
- extending runtime schemas and execution behavior through approved package boundaries
- refining explanation and next-action behavior without breaking the contract surfaces
- extending neutral findings/registry/orchestrator helpers without violating the package boundaries

## What developers must not do

Do not:

- add standalone CLI ownership directly to this package
- turn the MCP adapter into a full transport/server ownership surface here
- bypass safety policy contracts
- introduce ad hoc runtime context or execution shapes outside the defined contracts
- import Feature SDK internals outside the approved public Sync-Pack path
- introduce subprocess execution into runtime source

## Boundary reminders

Per ADR-0016:

- `src/core` owns runtime-neutral primitives only
- `src/runtime` owns runtime protocol, runtime factory, input schemas, and governed execution path
- `src/plugins/features-sdk` owns Feature SDK-specific integration through `@afenda/features-sdk/sync-pack`
- `src/mcp-adapter` remains adapter-only and delegates through the top-level runtime API

## Validation expectations

From repo root, validate changes with:

- `pnpm --filter @afenda/operator-kernel run typecheck`
- `pnpm --filter @afenda/operator-kernel run lint`
- `pnpm --filter @afenda/operator-kernel run test:run`
- `pnpm --filter @afenda/operator-kernel run build`
- `pnpm --filter @afenda/operator-kernel run surface:check`

Depending on the change, also run the repo-level architecture/governance checks referenced by ADR-0016.

## Promotion path

Treat the layering as:

- Operator Kernel runtime
- adapter surfaces over the runtime
- future MCP/CLI hosting only through a separate approved slice

If someone asks for the governing rule, send them to ADR-0016 first, not this handoff.
