---
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
---

# ADR-0007: Marketing WebGL route policy

- **Decision status:** Accepted
- **Implementation status:** Substantially implemented
- **Enforcement status:** Manual
- **Evidence status:** Partial
- **Date:** 2026-04-20
- **Owner:** Platform / web
- **Review by:** 2026-10-01
- **Scope:** `apps/web/src/marketing` flagship-route performance posture and optional WebGL placement
- **Decision type:** Record existing baseline
- **Operational posture:** Active contract
- **Related governance domains:** GOV-DOC-001
- **Related ATCs:** ATC-XXXX

## Context

The marketing surface already distinguishes between the canonical flagship route and experimental landing variants. Heavy WebGL bundles materially change that split because Three.js-based rendering increases bundle size, runtime cost, and device sensitivity.

The repo needed one explicit rule for where 3D belongs by default so contributors do not silently move experimental rendering into the canonical flagship path.

## Decision summary

1. Three.js, `@react-three/fiber`, and `@react-three/drei` are not part of the default flagship route contract.
2. Heavy WebGL belongs on experimental or optional marketing routes loaded behind route-level boundaries.
3. Putting WebGL on a primary marketing route requires explicit product approval plus measured performance evidence.

## Delivery classification

### What is immediately true

- The canonical flagship route is treated as the default marketing experience.
- Experimental landing variants can host heavier optional rendering without redefining the flagship baseline.
- Route-level isolation is the preferred containment strategy for 3D experiments.

### What is not yet true

- This ADR does not claim a dedicated CI gate exists for WebGL placement.
- This ADR does not claim all marketing variants have formal performance budgets encoded in tooling.

### How this ADR should be used

- Treat as **binding policy** for default placement of WebGL/Three.js in marketing routes.
- Treat as **directional guidance** for future marketing experiments that need richer rendering.
- Do **not** use this ADR as proof that all marketing rendering performance is fully automated today.

## Scope and boundaries

- In scope:
  canonical marketing route posture, experimental route containment, approval expectations for WebGL on primary routes.
- Out of scope:
  non-marketing product routes, the broader marketing topology decision, and generic front-end animation guidance.
- Affected repos/apps/packages:
  `apps/web/src/marketing` and related marketing docs.
- Interfaces/contracts touched:
  flagship route ownership, route-level code splitting expectations, and PR review criteria for WebGL adoption.

## Architecture contract

### Required

- Canonical flagship marketing routes stay free of bundled heavy WebGL by default.
- WebGL experiments live behind explicit route or lazy-loading boundaries.
- Any exception on a primary marketing route includes measured impact in the PR.

### Forbidden

- Silent addition of Three.js dependencies to the flagship default bundle.
- Treating experimental rendering as if it were automatically canonical marketing behavior.

### Allowed exceptions

- Product-approved flagship WebGL is allowed when supported by performance evidence and explicit review.
- Lightweight visual enhancements that do not materially change the flagship route cost remain subject to normal review.

## Consequences

### Positive

- Keeps the canonical marketing route performance posture readable and stable.
- Preserves room for visual experimentation without redefining the default user path.

### Negative

- Some richer flagship concepts now require deliberate review instead of landing opportunistically.
- WebGL experimentation has to accept stronger route-boundary discipline.

## Evidence and enforcement matrix

| Contract statement                                       | Source of truth                         | Current evidence                                    | Enforcement mechanism                  | Gap / follow-up                         |
| -------------------------------------------------------- | --------------------------------------- | --------------------------------------------------- | -------------------------------------- | --------------------------------------- |
| WebGL is not part of the default flagship route contract | this ADR, ADR-0006                      | current marketing route structure and variant split | review discipline                      | no dedicated route-performance gate yet |
| Heavy 3D belongs on optional or experimental routes      | this ADR, marketing page registry usage | route-level dynamic import pattern for variants     | review discipline and bundle awareness | still manual rather than CI-enforced    |
| Flagship exceptions require measured approval            | this ADR                                | PR expectation only                                 | manual review                          | no automated evidence collector yet     |

## Validation plan

- Required checks:
  normal marketing validation plus reviewer confirmation when WebGL is introduced.
- Required manual QA:
  compare flagship-route bundle and Lighthouse impact before approving WebGL on a primary route.
- Runtime/operational signals to watch:
  flagship bundle growth, low-end device regressions, and route-level rendering instability.

## Trigger metrics (for revisit, escalation, or migration)

Re-open this ADR if one or more persist across two review cycles:

- flagship product requirements repeatedly demand inline 3D,
- route-boundary containment becomes operationally insufficient,
- the team needs automated performance gates specific to marketing rendering classes.

## References

- [ADR-0006 marketing feature topology](./ADR-0006-marketing-feature-topology.md)
- [Performance](../PERFORMANCE.md)
