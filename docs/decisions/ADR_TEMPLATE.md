---
title: ADR template
description: Reusable template for documenting architecture decisions with triggers, ownership, and review cadence.
order: 999
status: template
---

# ADR-XXXX: [Decision title]

- **Status:** Proposed | Accepted | Superseded | Rejected
- **Date:** YYYY-MM-DD
- **Owner:** [Team or role]
- **Review by:** YYYY-MM-DD
- **Supersedes:** ADR-XXXX (optional)
- **Superseded by:** ADR-XXXX (optional)

## Context

Describe the current architecture state and problem signal.

- What is happening now?
- What measurable pain exists?
- Why does this decision matter at this stage?

## Decision

State the decision in clear, testable terms.

1. [Decision point 1]
2. [Decision point 2]
3. [Decision point 3]

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

## Trigger metrics (for revisit or migration)

Define objective conditions that trigger reevaluation.

- Trigger 1: [metric threshold + observation window]
- Trigger 2: [metric threshold + observation window]
- Trigger 3: [metric threshold + observation window]

## Rollout and rollback

### Rollout plan

- Step 1:
- Step 2:
- Step 3:

### Rollback/containment plan

- How to revert safely if impact is negative:

## Validation plan

- What checks must pass? (lint, typecheck, tests, perf, QA)
- How success will be measured after rollout?

## Follow-up actions

- [ ] Action 1 (owner + due date)
- [ ] Action 2 (owner + due date)
- [ ] Action 3 (owner + due date)

## References

- Related docs:
- Related issues/PRs:
- Related incidents/postmortems:

