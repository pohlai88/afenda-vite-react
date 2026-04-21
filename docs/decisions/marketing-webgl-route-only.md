# Marketing: WebGL / Three.js default policy

- **Status:** Accepted (operational policy)
- **Date:** 2026-04-20
- **Related:** [ADR-0006](./ADR-0006-marketing-feature-topology.md) (canonical flagship vs experimental variants), [PERFORMANCE.md](../PERFORMANCE.md) (route-level code splitting)

## Decision

1. **Default:** **Three.js, `@react-three/fiber`, and `@react-three/drei`** are **not** embedded in the canonical flagship page bundle.
2. **Heavy 3D** lives on **experimental landing variant routes** (e.g. `5.Topology-BW.tsx`) that are loaded via **dynamic `import()`** from [`marketing-page-registry.ts`](../../apps/web/src/marketing/marketing-page-registry.ts), keeping Three off the critical path for users who never open that variant.
3. **Exception:** Shipping WebGL on `/marketing/flagship` or another primary marketing route requires **explicit product approval** and **measured** impact (Lighthouse, bundle, low-end devices) documented in the PR.

## Rationale

- Aligns with ADR-0006: flagship is the **canonical brand face**; variants are **exploration**.
- Aligns with Performance doc: **prefer route boundaries** for large optional UI.
- Preserves a clear **default** for “what ships to every flagship visitor.”

## Review

Revisit when flagship product requirements explicitly demand inline 3D, or when framework-level lazy islands prove acceptable in production metrics.
