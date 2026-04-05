# ADR-0001: Core web architecture baseline

- **Status:** Accepted
- **Date:** 2026-04-06
- **Owner:** Web architecture maintainers
- **Review by:** 2026-07-01

## Context

Afenda is a product monorepo with an ERP-focused web client in `apps/web`.
The team needs stable conventions for scaling features without frequent framework churn.

The current documented baseline includes:

- React + Vite SPA under `apps/web`.
- React Router route shells with progressive feature extraction.
- TanStack Query for server cache and optional Zustand for cross-cutting client state.
- API-first client/server boundary (no DB code in the web client).

## Decision

Keep the current core web architecture baseline as the default path:

1. Preserve React Router route-shell model while feature modules evolve.
2. Keep client/server separation explicit and enforced in docs and implementation.
3. Prioritize incremental hardening over broad framework replacement.

## Consequences

### Positive

- Lower migration risk while ERP modules are still expanding.
- Better onboarding consistency across teams.
- Stable architecture for governance, CI, and documentation.

### Negative

- Some advanced typed-routing capabilities are deferred.
- Full-stack boilerplate parity is not an immediate objective.

## Revisit triggers

Re-open this ADR if one or more persist across two iterations:

- Route-related defects or refactor regressions exceed team threshold.
- Feature delivery slows due to route and data-layer coupling.
- Team spends repeated effort undoing architecture drift.

## Notes

This ADR is intentionally conservative during growth.
It does not block tactical improvements in API boundary, testing depth, or developer tooling.
