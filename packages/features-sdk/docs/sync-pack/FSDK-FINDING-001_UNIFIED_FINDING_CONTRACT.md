---
title: FSDK-FINDING-001 Unified Finding Contract
description: Internal unified finding contract for gated Sync-Pack command surfaces.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 26
---

# FSDK-FINDING-001: Unified Finding Contract

## Purpose

`FSDK-FINDING-001` defines the normalized finding shape for gated Sync-Pack command surfaces.

## Scope

This contract applies only to:

- `release-check`
- `check`
- `doctor`
- `validate`
- `verify`

It does not apply to `rank`, `report`, `generate`, or `scaffold` in this pass.

## Shape

```ts
type Finding = {
  code: string
  severity: "error" | "warning"
  message: string
  filePath?: string
  remediation?: {
    action: string
    command?: string
    doc?: string
  }
}
```

## Rules

- Every `error` finding must include remediation.
- `warning` findings should include remediation when there is a concrete next step.
- JSON result envelopes must preserve `findings`, `errorCount`, and `warningCount`.
- `verify` may extend the base finding with workflow-specific fields such as `step`.
