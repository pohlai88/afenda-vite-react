# ADR-0002: Trigger-based architecture upgrades

- **Status:** Accepted
- **Date:** 2026-04-06
- **Owner:** Architecture review group
- **Review by:** 2026-07-01

## Context

Architecture changes can be valid in principle but harmful in timing.
Without trigger rules, "possible improvements" become perpetual backlog items or premature rewrites.

Afenda needs a repeatable policy for deciding **when** to implement major upgrades.

## Decision

Adopt a trigger-based upgrade policy:

1. **Upgrade now** only for low-risk, high-leverage changes with clear ownership.
2. **Document now, defer implementation** for high-blast-radius changes.
3. **Require measurable triggers** before approving broad migrations.
4. **Require owner + review date** for every deferred architecture item.

## Consequences

### Positive

- Reduces reactive framework churn.
- Keeps architecture debt visible with explicit review points.
- Aligns migration timing with real product pressure and evidence.

### Negative

- Some improvements remain deferred until trigger conditions are met.
- Requires periodic architecture review discipline.

## Trigger examples

### Router migration

Consider migration only when recurring route/search-param defects or refactor friction are measured over consecutive iterations.

### API boundary hardening

Accelerate when duplicated auth/retry/error logic appears across multiple features and causes defects or inconsistent UX.

### Test-depth expansion

Prioritize when escaped regressions cluster around API contract and route-loading behavior.

## Governance requirements

Each deferred item must include:

- Context and alternatives.
- Expected impact.
- Measurable trigger metrics.
- Owner and review date.
- Rollback or containment strategy for future implementation.
