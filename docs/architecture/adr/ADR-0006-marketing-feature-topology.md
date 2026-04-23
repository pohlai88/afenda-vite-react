---
owner: docs-policy
truthStatus: canonical
docClass: canonical-doc
relatedDomain: decision-record
---

# ADR-0006: Marketing feature topology

- **Decision status:** Accepted
- **Implementation status:** Substantially implemented
- **Enforcement status:** Partial automation
- **Evidence status:** Partial
- **Date:** 2026-04-19
- **Owner:** Platform / web
- **Review by:** 2026-10-01
- **Scope:** `apps/web/src/marketing` topology, ownership layers, and public-route structure
- **Decision type:** Record existing baseline
- **Operational posture:** Active contract
- **Related governance domains:** GOV-DOC-001

## Context

The public marketing surface in `apps/web/src/marketing` has grown into a real feature boundary with:

- a standalone route tree,
- a dedicated theme/runtime boundary,
- a homepage selection strategy,
- canonical and experimental landing surfaces,
- company, legal, product, campaign, and regional page families.

Without a documented topology, public-site codepaths usually drift into flat page dumps, vague shared folders, and hidden ownership rules.
This ADR exists to make the marketing feature boundary explicit and durable.

## Decision summary

1. `apps/web/src/marketing` is a governed standalone feature boundary for the public marketing surface.
2. The marketing root is reserved for runtime/orchestration files, not general page or wrapper accumulation.
3. Pages live under `pages/` and are grouped by business domain rather than technical type.
4. Landing ownership distinguishes the canonical flagship surface from experimental/editorial variants.
5. Shared marketing abstractions remain structural only and must not become a generic route-specific junk drawer.

## Delivery classification

### What is immediately true

- Marketing already lives under its own feature boundary.
- The live marketing tree already contains explicit runtime files, domain page groups, and a governed shared surface.
- The repo already treats flagship identity and landing experimentation as distinct concerns.

### What is not yet true

- This ADR does not claim marketing topology is bound to a dedicated governance domain today.
- This ADR does not claim every route/detail rule is enforced by one central machine gate.
- This ADR does not claim future public aliases or experiments never need deliberate review.

### How this ADR should be used

- Treat as **binding policy** for marketing topology and ownership boundaries.
- Treat as **directional guidance** for adding new public pages and shared marketing abstractions.
- Do **not** use this ADR as justification for reviving flat page dumps or generic shared folders.

## Scope and boundaries

- In scope:
  `apps/web/src/marketing` root/runtime layer, page grouping, landing ownership, shared marketing surface, and public-route topology.
- Out of scope:
  overall `apps/web/src` root topology, Zustand adoption policy, and non-marketing feature boundaries.
- Affected repos/apps/packages:
  `apps/web/src/marketing` and companion marketing docs/tests.
- Interfaces/contracts touched:
  marketing root/runtime ownership, page grouping, alias policy, and shared-surface reuse rules.

## Architecture contract

### Required

- Marketing remains a standalone feature boundary under `src/marketing/`.
- Root marketing files are runtime/orchestration surfaces, not a general dumping ground.
- Page groups are organized by business domain.
- The canonical flagship surface remains distinct from editorial or experimental landing variants.
- Shared marketing abstractions remain structural rather than route-specific.

### Forbidden

- Flat page dumps or generic structural folders with weak ownership.
- Mixing canonical flagship ownership and experimental landing variants in one ambiguous layer.
- Recreating retired shared junk-drawer folders under new names.
- Silent duplicate route aliases that do not declare canonical ownership.

### Allowed exceptions

- Explicit public aliases are allowed only when they are intentionally declared and canonically owned.
- Shared abstractions are allowed when they are structural, reused, and not art-directed for one route family.

## Alternatives considered

### Option A: Keep a flatter ad hoc marketing tree

- Pros:
  less upfront structure.
- Cons:
  weak ownership and rapid drift once the public site grows.

### Option B: Domain-driven marketing topology

- Pros:
  clear runtime/page/shared ownership, scalable route families, explicit canonical vs experimental separation.
- Cons:
  requires discipline and cleanup when legacy paths exist.

## Consequences

### Positive

- Marketing can scale without collapsing into a flat set of pages.
- Canonical brand surfaces and experimental landing work remain distinct.
- Public-route ownership is easier to reason about in code review and maintenance.

### Negative

- Contributors must follow topology rules rather than improvising local shapes.
- Shared abstractions need stronger discipline to avoid becoming route-specific again.

## Evidence and enforcement matrix

| Contract statement                                                     | Source of truth                               | Current evidence                                      | Enforcement mechanism                                  | Gap / follow-up                                           |
| ---------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------- |
| Marketing is a standalone feature boundary                             | this ADR, marketing companion docs, live tree | `apps/web/src/marketing` structure                    | docs/review discipline and focused tests               | no dedicated marketing governance domain yet              |
| Runtime/orchestration stays at marketing root                          | live root files, marketing companion docs     | runtime file set in `src/marketing`                   | review discipline and file-survival governance context | root-file contract is not yet surfaced as a dedicated ATC |
| Pages group by business domain and shared abstractions stay structural | live page groups and shared components        | `pages/company`, `pages/legal`, `pages/landing`, etc. | marketing tests and review discipline                  | still partially manual rather than one dedicated CI gate  |

## Implementation plan

### Completed now

- Marketing already exists as a standalone feature boundary.
- The current tree already separates root orchestration from domain pages and shared components.
- Canonical flagship ownership already exists as a distinct landing surface.

### Required follow-through

- [ ] Keep reducing legacy alias debt only when a public route has an explicit canonical owner — platform / web — ongoing
- [ ] Continue removing stale companion-doc duplication and route-local structural leftovers — docs-policy — ongoing
- [ ] Evaluate whether marketing topology eventually warrants its own dedicated governance domain or ATC — governance-toolchain — future pass

### Exit criteria for “implemented”

- [ ] New marketing work follows the governed topology without introducing generic structural folders
- [ ] Canonical/experimental landing ownership remains explicit
- [ ] Companion docs describe the live marketing topology rather than legacy shapes

## Validation plan

- Required checks:
  focused marketing route/runtime tests and docs review
- Required manual QA:
  verify new marketing files land in the right ownership layer
- Runtime/operational signals to watch:
  route aliases without canonical ownership, new generic shared wrappers, or page-local composition moving into shared junk-drawer helpers
- How success will be measured after rollout:
  marketing continues to scale without flattening into ad hoc topology

## Trigger metrics (for revisit, escalation, or migration)

Re-open this ADR if one or more persist across two review cycles:

- contributors repeatedly need exceptions to the current marketing topology,
- shared marketing abstractions begin deciding route-specific composition,
- public-route aliasing becomes confusing enough that canonical ownership is no longer obvious.

## Rollout and rollback / containment

### Rollout plan

- Keep the current marketing topology as the baseline.
- Use companion docs as operating guides, not second decision records.
- Promote stronger enforcement only when the need is concrete.

### Rollback/containment plan

- If a topology rule proves too coarse, refine it explicitly rather than slipping back into flat structures.
- Do not reintroduce retired generic folders just to reduce short-term file movement.

## References

- [`docs/MARKETING_FRONTEND_CONTRACT.md`](../MARKETING_FRONTEND_CONTRACT.md)
- [`docs/PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md)
- [`docs/ARCHITECTURE_EVOLUTION.md`](../ARCHITECTURE_EVOLUTION.md)
