---
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
---

# ADR-0002: Trigger-based architecture upgrades

- **Decision status:** Accepted
- **Implementation status:** Substantially implemented
- **Enforcement status:** Manual
- **Evidence status:** Partial
- **Date:** 2026-04-06
- **Owner:** Architecture review group
- **Review by:** 2026-07-01
- **Scope:** Repo-wide architecture review and migration timing policy
- **Decision type:** Defer with triggers
- **Operational posture:** Active contract
- **Related governance domains:** GOV-DOC-001
- **Related ATCs:** ATC-XXXX

## Context

Architecture changes can be valid in principle but harmful in timing.
Without trigger rules, technically possible improvements become either permanent backlog theater or premature rewrites.

Afenda needs a repeatable policy for deciding when a major upgrade should be implemented now, documented for later, or explicitly rejected for the current phase.

This ADR exists because the repo already has multiple plausible future migrations:

- router and route-contract hardening,
- broader API-boundary automation,
- deeper test pyramid expansion,
- larger folder or runtime refactors.

The missing rule was not "what could improve," but "what evidence makes the upgrade legitimate now."

## Decision summary

Adopt a trigger-based upgrade policy:

1. Upgrade now only for low-risk, high-leverage changes with bounded rollout and clear ownership.
2. Document now and defer implementation for high-blast-radius changes until trigger metrics are met.
3. No deferred architecture item is valid without an owner, review date, and measurable revisit conditions.
4. Decision records must distinguish implemented policy from watcher-only or transitional guidance.

## Delivery classification

### What is immediately true

- Trigger-based evaluation is the required default for major architecture upgrades.
- The repo should document deferred upgrades as explicit decisions rather than informal backlog notes.
- Upgrade timing must be tied to observed pain, not architectural taste.

### What is not yet true

- This ADR does not claim every architecture proposal already has complete metrics automation.
- This ADR does not automatically block every premature migration in CI.
- This ADR does not replace follow-on ADRs that define the contract for a specific upgrade.

### How this ADR should be used

- Treat as **binding policy** for deciding whether a major upgrade happens now or later.
- Treat as **directional guidance** for how trigger metrics and review cadence should be written into later ADRs.
- Do **not** use this ADR as proof that every migration threshold is already machine-enforced.

## Scope and boundaries

- In scope:
  major architecture upgrades, deferred migration records, review cadence, trigger metrics, and owner-based reevaluation.
- Out of scope:
  the technical contract of any one migration, implementation details for router/API/test changes, and runtime enforcement for every future decision.
- Affected repos/apps/packages:
  repo-wide architecture governance, especially `apps/web`, `apps/api`, and shared packages touched by later ADRs.
- Interfaces/contracts touched:
  ADR review discipline, migration approval timing, and the evidence standard for large architectural change.

## Architecture contract

### Required

- Major upgrades must be justified by observed problems, measurable impact, bounded blast radius, and named ownership.
- Deferred upgrades must record triggers, owner, review date, and containment expectations.
- Follow-on ADRs must make clear whether they are active contracts, transitional doctrine, or watcher-only records.

### Forbidden

- Approving broad architecture migration solely because an alternative is technically attractive.
- Leaving deferred upgrades as undocumented ideas without owner or revisit conditions.
- Treating speculative migration ideas as active roadmap commitments without trigger evidence.

### Allowed exceptions

- Low-risk hardening work may proceed immediately when rollout is bounded and ownership is explicit.
- Emergency containment work may bypass normal trigger thresholds when incidents show the current architecture is actively failing; that exception must still be documented after the fact.

## Alternatives considered

### Option A: Upgrade opportunistically

- Pros:
  fast local decisions and less upfront documentation.
- Cons:
  high churn risk, poor auditability, and no durable rule for timing.

### Option B: Freeze all major upgrades until a formal migration program exists

- Pros:
  stable near-term delivery and low migration noise.
- Cons:
  real architecture pain can linger too long, and beneficial hardening work gets delayed with the risky changes.

## Consequences

### Positive

- Reduces reactive framework churn.
- Keeps architecture debt visible with explicit review points.
- Aligns migration timing with product pressure, defects, and measured delivery friction.

### Negative

- Some improvements remain deferred until trigger conditions are met.
- Requires architecture review discipline and evidence gathering.
- Human review remains part of the policy until later automation is added.

## Evidence and enforcement matrix

| Contract statement                                                    | Source of truth                                    | Current evidence                                        | Enforcement mechanism      | Gap / follow-up                                                       |
| --------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------- |
| Major upgrades require trigger-based justification                    | `docs/ARCHITECTURE_EVOLUTION.md`, this ADR         | documented review policy and follow-on ADR references   | manual architecture review | still relies on reviewer discipline rather than CI                    |
| Deferred upgrades must have owner and review date                     | ADR template, this ADR                             | current ADR template fields and revised ADR-0001 header | docs governance review     | not all older ADRs have been upgraded yet                             |
| Large migrations should be deferred until observed pain is measurable | `docs/ARCHITECTURE_EVOLUTION.md`, future ADR chain | router/API/test trigger examples already documented     | doctrine + review process  | metrics are not yet uniformly instrumented across all upgrade classes |

## Implementation plan

### Completed now

- Architecture evolution policy exists and is already used as a review reference.
- The ADR template now requires maturity and evidence state instead of a single ambiguous status.
- ADR-0001 already depends on this trigger-based posture rather than assuming broad migration is the default.

### Required follow-through

- [ ] Reclassify older ADRs so deferred upgrades always declare owner, review date, and trigger metrics — docs-policy — next ADR maintenance pass
- [ ] Add clearer review checklists for architecture proposals that claim major migration urgency — architecture review group — next governance pass
- [ ] Promote specific migrations into fuller ADRs only when their trigger evidence is concrete — owning team — ongoing

### Exit criteria for “implemented”

- [ ] New deferred architecture ADRs consistently include trigger metrics, owner, review date, and containment language
- [ ] Reviewers can distinguish "upgrade now" from "document now, defer implementation" without inference
- [ ] The repo no longer relies on informal architecture backlog items for major upgrade decisions

## Validation plan

- Required checks:
  docs review against `docs/ARCHITECTURE_EVOLUTION.md` and the ADR template
- Required manual QA:
  architecture reviewer can explain why a migration is now, later, or rejected using the ADR alone
- Runtime/operational signals to watch:
  repeated migration proposals without trigger evidence, deferred items without owner/review date, or broad rewrites justified only by preference
- How success will be measured after rollout:
  architecture proposals become easier to approve or defer consistently, and later ADRs stop conflating possibility with timing

## Trigger metrics (for revisit, escalation, or migration)

Re-open or escalate follow-on migration ADRs when one or more persist across two consecutive review cycles:

- recurring route or search-param defects show the current router posture is slowing safe change,
- duplicated API-boundary behavior causes repeated UX or reliability defects across features,
- escaped regressions cluster around integration behavior that the current testing depth cannot cover effectively,
- teams repeatedly spend measurable rework undoing architecture drift in the same subsystem.

## Rollout and rollback / containment

### Rollout plan

- Keep `docs/ARCHITECTURE_EVOLUTION.md` as the operating guide for this decision.
- Upgrade ADRs that depend on deferred migration logic into the current maturity format.
- Use follow-on ADRs to bind specific migration triggers when the evidence becomes concrete.

### Rollback/containment plan

- If the template becomes too heavy, keep the trigger/evidence/owner requirements even if section names are simplified.
- Do not revert to architecture proposals without owner, review date, or measurable triggers; that was the ambiguity this ADR is meant to remove.

## References

- [`docs/ARCHITECTURE_EVOLUTION.md`](../ARCHITECTURE_EVOLUTION.md)
- [`docs/architecture/adr/ADR-0001-core-web-architecture-baseline.md`](./ADR-0001-core-web-architecture-baseline.md)
- [`docs/architecture/adr/ADR_TEMPLATE.md`](./ADR_TEMPLATE.md)
