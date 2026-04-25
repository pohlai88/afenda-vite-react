---
title: Performance defaults scaffold
description: Supporting checklist for frontend performance defaults, budgets, diagnostics, and red flags in Vite SPA work.
status: template
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: doctrine
relatedDomain: frontend-performance
order: 50
---

# Performance Defaults (Scaffold)

These defaults are the baseline for scalable Vite SPA performance.
Use this when setting a baseline for new frontend work or reviewing drift.
It does not replace the canonical performance and Vite workspace policy in [`../../PERFORMANCE.md`](../../PERFORMANCE.md) and [`../../VITE_ENTERPRISE_WORKSPACE.md`](../../VITE_ENTERPRISE_WORKSPACE.md).

## 1) Initial Load Strategy

- Keep bootstrap minimal: `main.tsx` + `App.tsx` wiring only.
- Lazy-load ERP feature routes by default.
- Keep shell-level dependencies small and stable.

Example route split:

```ts
import { lazy, Suspense } from "react"

const FinanceView = lazy(() =>
  import("@/features/finance").then((m) => ({ default: m.FinanceView }))
)
```

## 2) Chunking Policy

- Start with route-level splits and measured manual chunks for framework/vendor hotspots.
- Avoid over-splitting into many tiny chunks.
- Reassess chunk strategy after each major dependency change.

## 3) Data and State Policy

- Use TanStack Query for server/cache state.
- Avoid duplicating API cache into global client store.
- Use local component state first; elevate only when there is cross-feature need.

## 4) ERP Tables/Lists Policy

- Virtualize large lists/tables.
- Keep server pagination by default.
- Use stable row keys and memoized rows where profiler proves churn.

## 5) Performance Budgets (Starting Point)

Adjust per product needs, but keep a strict first baseline:

- Largest initial JS chunk (gzip): <= 250 KB
- Total initial JS (gzip): <= 450 KB
- Number of initial JS requests: <= 12
- Largest CSS chunk (gzip): <= 120 KB

## 6) Measurement Cadence

Run on every release candidate:

- `pnpm --filter @afenda/web build:analyze`
- `vite --profile`
- Lighthouse (desktop + mobile)
- Real-user vitals for LCP/INP/CLS in production

## 7) Build/Dev Diagnostics

- Plugin transform cost: `vite --debug plugin-transform`
- Dependency prebundle issues: tune `optimizeDeps.include` only when needed
- Dev startup warmup: only keep truly hot files in `server.warmup`

## 8) Red Flags

- Broad barrel imports in startup paths.
- Heavy transform plugins added without profiling.
- No route-level split for module-heavy ERP areas.
- Infinite list rendering without virtualization/pagination.
