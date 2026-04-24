---
title: FSDK-CLI-001 Release-Gate CLI Contract
description: Internal command contract for Sync-Pack release-gate CLI behavior.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 20
---

# FSDK-CLI-001: Release-Gate CLI Contract

## Purpose

`FSDK-CLI-001` defines the internal CLI behavior contract for Sync-Pack release-gate commands.

It exists so Afenda CI and internal operators can trust that release-gate commands behave consistently from source and from built `dist/` entrypoints.

`FSDK-CLI-001` governs the underlying gates. The daily operator workflow command `verify` is defined separately by [`FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md`](./FSDK-CLI-002_OPERATOR_WORKFLOW_CONTRACT.md).
Routing and metadata are defined by [`FSDK-CLI-003_COMMAND_TREE_CONTRACT.md`](./FSDK-CLI-003_COMMAND_TREE_CONTRACT.md).
Finding normalization is defined by [`FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md`](./FSDK-FINDING-001_UNIFIED_FINDING_CONTRACT.md).

## Scope

Start-here commands:

```txt
quickstart
help
```

Operator workflow command:

```txt
verify
```

Release-gate commands:

```txt
check
doctor
release-check
validate
```

Non-gated operator commands:

```txt
rank
report
generate
scaffold
```

## Contract

| Rule                          | Contract                             |
| ----------------------------- | ------------------------------------ |
| Unknown flags                 | Fail with error                      |
| Missing option values         | Fail with error                      |
| `--json`                      | Emit JSON object only, with no prose |
| `--ci`                        | Fail only when `errorCount > 0`      |
| Warnings                      | Never fail CI on warnings alone      |
| Unsupported `--json` / `--ci` | Fail clearly on non-gated commands   |
| Help                          | Always exits `0`                     |

## Operator notes

- `pnpm run feature-sync` is the canonical first command for humans.
- `pnpm run feature-sync:help` is the canonical command discovery entrypoint.
- `pnpm run feature-sync:verify` is the canonical daily workflow command for humans.
- Release-gate commands remain the underlying CI-safe gates.
- `verify` is the supported CI-safe workflow wrapper around those gates.
- Non-gated commands are human-oriented operator utilities and must not pretend to be CI-safe.
- The dispatcher help output must clearly identify release-gate versus non-gated commands.

## Validation evidence

This contract is enforced by:

- shared CLI command metadata in `src/sync-pack/cli/shared.ts`
- dist smoke coverage in `tests/sync-pack/built-cli-smoke.test.ts`
- parser and output tests in `tests/sync-pack/cli-output.test.ts`

## Internal-only boundary

`FSDK-CLI-001` is an internal Afenda contract. It does not imply partner/public support, semver guarantees, or external portability commitments.
