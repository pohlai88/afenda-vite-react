# @afenda/operator-kernel

Governed Operator Kernel runtime primitives for the Afenda monorepo.

This package provides a small TypeScript runtime layer that wraps the
`@afenda/features-sdk/sync-pack` workflow catalog behind a governed tool
registry, operator-mode policy checks, safe-command enforcement, and a minimal
MCP adapter runtime.

## Current scope

`@afenda/operator-kernel` is currently an internal workspace package (`private: true`).
It is **not** a standalone CLI and it does **not** currently ship a full MCP
transport server process. Instead, it exposes:

- core contracts for tools, resources, plugins, safety policies, and findings
- a registry/orchestrator for assembling plugin manifests
- a default governed runtime backed by the Feature SDK Sync-Pack workflows
- a minimal MCP-style runtime wrapper with `executeTool(...)`
- mode-aware policy helpers and explanation builders for governed responses

## Why this package exists

The package creates a controlled execution surface for Operator Kernel automation in
Afenda. It ensures that runtime responses stay aligned with the Feature SDK
workflow catalog and that different operator modes only access the tool classes
they are allowed to use.

The implementation currently enforces:

- canonical tool parity with `@afenda/features-sdk/sync-pack`
- safe next-action commands limited to governed `pnpm run feature-sync...`
  commands
- mutation boundaries by operator mode
- bounded guided-operator responses for verify flows

## Package structure

```text
packages/operator-kernel/
├─ src/
│  ├─ core/           # contracts, findings, registry, orchestrator
│  ├─ mcp-adapter/    # minimal MCP adapter runtime wrapper
│  ├─ plugins/
│  │  └─ features-sdk/# Sync-Pack tool integration, guards, mode policy, explainers
│  └─ runtime/        # operator modes, tool names, default runtime
├─ tests/             # parity, policy, runtime, and explanation tests
└─ scripts/           # build-time boundary assertion
```

## Public exports

The package root currently re-exports:

- `./core`
- `./mcp-adapter`
- `./runtime`
- `featuresSdkPlugin` namespace from `./plugins/features-sdk`

From `src/index.ts`:

```ts
export * from "./core/index.js"
export * from "./mcp-adapter/index.js"
export * from "./runtime/index.js"
export * as featuresSdkPlugin from "./plugins/features-sdk/index.js"
```

## Governed operator modes

The default runtime recognizes these operator modes:

- `guided_operator`
- `feature_devops`
- `architect_commander`

Mode capability policy is currently:

| Mode                  | Capabilities                                                   |
| --------------------- | -------------------------------------------------------------- |
| `guided_operator`     | `read`, `diagnose`, `execute_safe`                             |
| `feature_devops`      | `read`, `diagnose`, `execute_safe`, `plan`                     |
| `architect_commander` | `read`, `diagnose`, `execute_safe`, `plan`, `generate_guarded` |

Scope policy is currently:

| Mode                  | One exact next command | Mutation allowed |
| --------------------- | ---------------------- | ---------------- |
| `guided_operator`     | Yes                    | No               |
| `feature_devops`      | No                     | No               |
| `architect_commander` | No                     | Yes              |

## Governed tool surface

The runtime uses the canonical tool names declared in `OPERATOR_TOOL_NAMES`:

- `quickstart`
- `verify`
- `release-check`
- `check`
- `doctor`
- `validate`
- `rank`
- `report`
- `generate`
- `scaffold`

These tools are created from the Sync-Pack workflow catalog in
`@afenda/features-sdk/sync-pack` and mapped to governed commands:

- `quickstart` → `pnpm run feature-sync`
- every other tool → `pnpm run feature-sync:<tool-name>`

### Capability-to-tool mapping

| Capability         | Allowed tools                                  |
| ------------------ | ---------------------------------------------- |
| `read`             | `quickstart`                                   |
| `diagnose`         | `release-check`, `check`, `doctor`, `validate` |
| `execute_safe`     | `verify`                                       |
| `plan`             | `rank`, `report`                               |
| `generate_guarded` | `generate`, `scaffold`                         |

## Safety model

The package includes guardrails around command generation and mutation:

- only commands starting with `pnpm run feature-sync` are allowed
- shell chaining and redirection fragments such as `&&`, `||`, `;`, `|`, `>`,
  and `<` are rejected
- mutating tools are blocked unless the mode allows mutation
- missing tool/runtime parity is treated as a governed error

## Default runtime

Use `createDefaultOperatorRuntime()` when you want the built-in governed runtime
with the Feature SDK plugin pre-registered.

```ts
import { createDefaultOperatorRuntime } from "@afenda/operator-kernel"

const runtime = createDefaultOperatorRuntime()

const result = await runtime.execute({
  tool: "verify",
  mode: "guided_operator",
  workspaceRoot: process.cwd(),
  input: {},
})

if (result.ok) {
  console.log(result.explanation)
  console.log(result.nextActions)
} else {
  console.error(result.error.code, result.error.message)
}
```

### Runtime result shape

`execute(...)` returns one of two shapes:

- success: `{ ok: true, tool, data, explanation?, nextActions }`
- failure: `{ ok: false, tool, error, explanation?, nextActions }`

For verify flows, the runtime adds mode-aware explanations and recommended next
actions. In `guided_operator`, responses are intentionally narrowed to one exact
next command.

## Minimal MCP runtime wrapper

Use `createOperatorMcpAdapterRuntime()` when you need a small host object that wraps
the default runtime behind `executeTool(...)`.

```ts
import { createOperatorMcpAdapterRuntime } from "@afenda/operator-kernel"

const server = createOperatorMcpAdapterRuntime()

const result = await server.executeTool({
  tool: "report",
  mode: "feature_devops",
  workspaceRoot: process.cwd(),
  input: {
    filters: {
      pack: "internal-support-crm",
    },
  },
})
```

Important: this is a runtime adapter, **not** a full networked MCP server with
transport, protocol negotiation, or process lifecycle management.

## Core extension points

If you need to assemble your own governed runtime pieces, the package exposes:

- `createOperatorRegistry(plugins)`
- `createOperatorOrchestrator(plugins)`
- core contracts such as:
  - `OperatorToolDefinition`
  - `OperatorPluginManifest`
  - `OperatorSafetyPolicy`
  - `OperatorResourceDefinition`
  - `OperatorFinding`

The bundled plugin is available through:

- `featuresSdkPlugin.featuresSdkOperatorPlugin`

## Relationship to `@afenda/features-sdk`

`@afenda/operator-kernel` does not implement its own workflow engine. The actual workflow
behavior comes from `@afenda/features-sdk/sync-pack`. This package contributes:

- policy enforcement
- tool registration
- governed command shaping
- operator-mode access control
- explanation and next-command logic
- a runtime façade suitable for higher-level orchestration

## Development

From the repo root:

```bash
pnpm --filter @afenda/operator-kernel run build
pnpm --filter @afenda/operator-kernel run typecheck
pnpm --filter @afenda/operator-kernel run lint
pnpm --filter @afenda/operator-kernel run test:run
```

Available package scripts:

- `build` — compiles `src` to `dist` and runs a dist boundary assertion
- `typecheck` — validates TypeScript with `tsconfig.json`
- `lint` — lints `src` and `tests`
- `test` — runs Vitest
- `test:run` — runs Vitest in non-watch mode
- `surface:check` — builds the package and verifies the neutral public exports

## Test coverage highlights

The current test suite verifies:

- tool parity between runtime, canonical names, and Sync-Pack workflow catalog
- mode capability and scope policy behavior
- safe-command enforcement
- guided operator next-command constraints
- end-to-end execution across the governed safe tool surface
- mutation blocking for non-authorized modes
- architect commander access to `generate` and `scaffold`

## Known boundaries

This README reflects the package as currently implemented. At the time of
writing, the package does **not** provide:

- a published npm package contract
- a command-line binary
- remote MCP transport bindings
- persistence, auth, or multi-tenant session orchestration
- arbitrary shell execution outside governed Sync-Pack commands

## Internal status

- Package name: `@afenda/operator-kernel`
- Version: `0.0.0`
- License: `UNLICENSED`
- Workspace visibility: private/internal only
