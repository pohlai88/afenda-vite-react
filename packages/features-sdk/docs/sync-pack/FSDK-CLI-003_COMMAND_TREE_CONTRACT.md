---
title: FSDK-CLI-003 Command Tree Contract
description: Internal command tree contract for Sync-Pack CLI metadata and routing.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 24
---

# FSDK-CLI-003: Command Tree Contract

## Purpose

`FSDK-CLI-003` defines the command tree as the source of truth for Sync-Pack CLI metadata and routing.

It exists to prevent drift between command help, command resolution, examples, and supported flag behavior.

## Contract

- The command tree is the source of truth for metadata and routing.
- Command implementation remains owned by each command module.
- The command tree must stay dependency-free and internal.
- Dispatcher routing must derive from the command tree, not a manual switch.
- Help output, examples, command grouping, and unsupported flag behavior must derive from the same command metadata.

## Minimum shape

```ts
type CommandDefinition = {
  name: string
  summary: string
  usage: string
  group: "start" | "workflow" | "gate" | "operator"
  flags: readonly CliFlagDefinition[]
  examples: readonly string[]
  troubleshooting?: readonly string[]
  load?: () => Promise<unknown>
}
```

## Internal boundary

This is not a framework abstraction and must not become one.

The goal is boring reliability:

- one metadata source
- one routing source
- one help source
