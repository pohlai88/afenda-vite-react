---
title: ADR template
description: Reusable template for architecture decisions with explicit implementation maturity, enforcement, and evidence state.
status: template
owner: docs-policy
truthStatus: supporting
docClass: supporting-doc
relatedDomain: decision-record
order: 999
---

# ADR-XXXX: [Decision title]

- **Decision status:** Proposed | Accepted | Superseded | Rejected
- **Implementation status:** Not started | Partial | Substantially implemented | Complete
- **Enforcement status:** None | Manual | Partial automation | Enforced in CI/runtime
- **Evidence status:** Missing | Planned | Partial | Current
- **Date:** YYYY-MM-DD
- **Owner:** [Team or role]
- **Review by:** YYYY-MM-DD
- **Scope:** Repo-wide | app/package-specific | bounded subsystem
- **Decision type:** Adopt now | Defer with triggers | Reject for now | Record existing baseline
- **Operational posture:** Active contract | Transitional contract | Watcher only
- **Related governance domains:** GOV-XXXX-000 (comma-separated, if applicable)
- **Related ATCs:** ATC-XXXX (optional)
- **Supersedes:** ADR-XXXX (optional)
- **Superseded by:** ADR-XXXX (optional)

## Context

Describe the current architecture state, the problem signal, and why the ADR exists.

- What is happening now?
- What measurable pain exists?
- Why does this decision matter at this stage?
- Is this ADR creating a new contract, ratifying an existing one, or only watching for future migration?

## Decision summary

State the decision in 3 to 7 short, testable statements.

1. [Decision point 1]
2. [Decision point 2]
3. [Decision point 3]

## Delivery classification

State explicitly how readers must interpret this ADR today.

### What is immediately true

- [Contract that is already active now]
- [Constraint already expected in design/review]

### What is not yet true

- [Thing this ADR does not claim yet]
- [Gap between doctrine and implementation]

### How this ADR should be used

- Treat as **binding policy** only for:
- Treat as **directional guidance** only for:
- Do **not** use this ADR as proof that:

## Scope and boundaries

Define the blast radius clearly.

- In scope:
- Out of scope:
- Affected repos/apps/packages:
- Interfaces/contracts touched:

## Architecture contract

Turn the decision into enforceable contract statements.

### Required

- [Requirement 1]
- [Requirement 2]

### Forbidden

- [Forbidden pattern 1]
- [Forbidden pattern 2]

### Allowed exceptions

- [Exception 1 + approval rule]
- [Exception 2 + expiry or review condition]

## Alternatives considered

### Option A: [Name]

- Pros:
- Cons:

### Option B: [Name]

- Pros:
- Cons:

## Consequences

### Positive

- [Benefit 1]
- [Benefit 2]

### Negative

- [Trade-off 1]
- [Trade-off 2]

## Evidence and enforcement matrix

Show whether the ADR is real in the codebase or still aspirational.

| Contract statement | Source of truth   | Current evidence        | Enforcement mechanism    | Gap / follow-up |
| ------------------ | ----------------- | ----------------------- | ------------------------ | --------------- |
| [statement]        | [doc/config/code] | [test/script/path/none] | [CI/runtime/manual/none] | [gap]           |
| [statement]        | [doc/config/code] | [test/script/path/none] | [CI/runtime/manual/none] | [gap]           |

## Implementation plan

Use this section even when the ADR records an existing baseline.

### Completed now

- [Already implemented item]
- [Already enforced item]

### Required follow-through

- [ ] [Action] — owner — due date
- [ ] [Action] — owner — due date

### Exit criteria for “implemented”

- [ ] [Criterion proving implementation is complete]
- [ ] [Criterion proving enforcement is in place]
- [ ] [Criterion proving evidence is current]

## Validation plan

- Required checks:
- Required manual QA:
- Runtime/operational signals to watch:
- How success will be measured after rollout:

## Trigger metrics (for revisit, escalation, or migration)

Define objective conditions that trigger reevaluation.

- Trigger 1: [metric threshold + observation window]
- Trigger 2: [metric threshold + observation window]
- Trigger 3: [metric threshold + observation window]

## Rollout and rollback / containment

### Rollout plan

- Step 1:
- Step 2:
- Step 3:

### Rollback/containment plan

- How to revert safely if impact is negative:

## References

- Related docs:
- Related issues/PRs:
- Related incidents/postmortems:
