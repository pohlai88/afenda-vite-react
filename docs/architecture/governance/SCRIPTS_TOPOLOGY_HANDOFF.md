---
title: Scripts topology handoff
description: Developer handoff for the grouped scripts topology, area ownership model, and root-scripts reservation policy.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
relatedDomain: workspace-topology
order: 14
---

# Scripts topology handoff

This document is the developer handoff for the `scripts/` topology.

It explains the current baseline after the grouped-entrypoint migration and points back to the authoritative rules.

## Current state

`scripts/` is no longer intended to operate as a mostly flat CLI bucket.

The current topology is:

- root `scripts/` = manifests, rules, generated indexes, and support files only
- `scripts/config/` = workspace manifest loading and config validation
- `scripts/docs/` = generated docs navigation tooling
- `scripts/governance/` = governance-domain checks and evidence writers
- `scripts/runtime/` = toolchain/runtime diagnostics
- `scripts/ui/` = repo-global UI quality checks
- `scripts/integrations/` = external tool bridges
- `scripts/lib/` = shared repo-local helpers
- `scripts/repo-integrity/` = repo-guard orchestration adapters
- `scripts/fixtures/` = governed script fixtures

## What is authoritative

Use these documents in order:

1. [Scripts directory rules](../../../scripts/RULES.md)
2. [Scripts README](../../../scripts/README.md)
3. [Project configuration](../../PROJECT_CONFIGURATION.md)

This handoff is a summary, not the source of truth.

## Permanent boundary

The topology is deliberate:

- grouped directories carry area ownership
- root `scripts/` is reserved for manifests and support files
- one level of nesting under `scripts/` remains the maximum

This means:

- do not add new runnable `.ts`, `.js`, or `.mjs` files directly under `scripts/`
- do not introduce `scripts/<area>/<subarea>/...` without an explicit policy change
- do not move app-local or package-local scripts into root `scripts/` just for convenience

## How to place new work

- repo-global config or manifest validation: `scripts/config/`
- docs/readme/index generation: `scripts/docs/`
- governance checks and evidence emission: `scripts/governance/`
- runtime/toolchain diagnostics: `scripts/runtime/`
- repo-global UI quality checks: `scripts/ui/`
- external tool bridges: `scripts/integrations/`
- pure helpers or fixtures with no direct command surface: `scripts/lib/` or `scripts/fixtures/`

If the code is repo-bound orchestration for the Repository Integrity Guard, prefer `scripts/repo-integrity/`.

## Validation rule

`pnpm run script:check-afenda-config` is the topology gate.

It now enforces:

- root `scripts/` reserved-file policy
- one-level nesting only

## Handoff note

If someone asks where the developer handoff for scripts lives, send them here first, then to [Scripts directory rules](../../../scripts/RULES.md).
