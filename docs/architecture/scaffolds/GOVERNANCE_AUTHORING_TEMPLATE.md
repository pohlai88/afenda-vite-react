---
title: Governance authoring template
description: Reusable scaffold for governance-aligned document frontmatter, envelope header annotation, naming, and section patterns.
status: template
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: doctrine
relatedDomain: governance-registry
order: 45
---

# Governance Authoring Template

Use this scaffold when creating a new governed document surface that must follow the repo's current governance model.

This file does not replace the canonical doctrine in:

- [`../governance/GOVERNANCE_CONSTITUTION.md`](../governance/GOVERNANCE_CONSTITUTION.md)
- [`../governance/NAMING_CONVENTION.md`](../governance/NAMING_CONVENTION.md)
- [`../../workspace/BOUNDARY_SURFACES.md`](../../workspace/BOUNDARY_SURFACES.md)

It is the practical authoring pattern that keeps format, metadata, naming, and section shape consistent.

## 1. Envelope model

Every governed document should be authored as an envelope with three layers:

1. **Metadata envelope**
   The YAML frontmatter that classifies the surface for humans, generators, and checks.
2. **Header envelope**
   The H1 title and opening statement that explain what the document is and how to use it.
3. **Body envelope**
   The bounded sections that express scope, rules, contracts, evidence, references, or templates.

The repo should not rely on body prose alone to classify a document.
The metadata envelope comes first.

## 2. Metadata pattern

### Canonical metadata keys

Use these keys unless the specific template for the surface says otherwise:

```yaml
---
title: [Human title]
description: [One-sentence purpose]
status: active | template | historical | retired
owner: [team-or-role]
truthStatus: canonical | supporting | historical
docClass: canonical-doc | supporting-doc | historical-archive | reviewed-exception | delete
surfaceType: docs | doctrine | rules
relatedDomain: [governance-or-domain-id]
order: [number]
---
```

### Meaning of the key set

- `title`
  Human-facing title for generated indexes and scanability.
- `description`
  Single-sentence summary of what the surface does.
- `status`
  Live posture of the document itself.
- `owner`
  Real owner of the surface.
- `truthStatus`
  Whether the document is canonical, supporting, or historical.
- `docClass`
  Repo-wide documentation governance classification.
- `surfaceType`
  Which surface class this document belongs to under the boundary doctrine.
- `relatedDomain`
  The governed domain or area this surface belongs to.
- `order`
  Read order in generated indexes where relevant.

## 3. Header annotation pattern

Use a strong header envelope immediately after frontmatter.

### Pattern

```md
# [Document title]

This document defines [what it governs or explains].
It should be used when [reader intent].
It does not replace [more canonical or more specific source], when that source exists.
```

### Why this matters

The first three lines should answer:

- what the surface is
- when to use it
- what it does not replace

That stops supporting docs from accidentally being treated as doctrine and stops doctrine from being mistaken for general notes.

## 4. Naming pattern

Follow the naming doctrine in [`../governance/NAMING_CONVENTION.md`](../governance/NAMING_CONVENTION.md).

### Root doctrine docs

Use durable, explicit, strongly self-identifying names:

```txt
GOVERNANCE_CONSTITUTION.md
NAMING_CONVENTION.md
BOUNDARY_SURFACES.md
```

### ADR and ATC docs

Use the governed ID plus context/purpose pattern:

```txt
ADR-0001-core-web-architecture-baseline.md
ATC-0004-web-src-topology-and-ownership.md
```

### Supporting scaffolds and templates

Use explicit subject-oriented names:

```txt
GOVERNANCE_AUTHORING_TEMPLATE.md
VITE_FRONTEND_FEATURE_TEMPLATE.md
REPO_GUARD_PROMOTION_REVIEW_TEMPLATE.md
```

### Rule artifacts

Rule artifacts should say what policy or governed surface they encode:

```txt
governance-waivers.md
filesystem-governance.md
generated-artifact-governance.md
```

Avoid weak names such as:

- `notes.md`
- `misc.md`
- `draft.md`
- `template.md`

## 5. Recommended body pattern

Not every governed document uses the same sections, but the body should still feel bounded and reviewable.

Use this default pattern unless the surface already has a stronger dedicated template:

```md
## Purpose

## Scope

## Required pattern

## Forbidden pattern

## Exceptions

## Enforcement or validation

## References
```

### Section intent

- `Purpose`
  Why the surface exists.
- `Scope`
  What is and is not covered.
- `Required pattern`
  Positive rules or expectations.
- `Forbidden pattern`
  Explicit anti-patterns.
- `Exceptions`
  Bounded allowed deviations.
- `Enforcement or validation`
  What check, review, or evidence keeps the rule real.
- `References`
  Canonical linked surfaces.

## 6. Surface-specific starting templates

### A. Root doctrine

Use this when the document is repo-wide authoritative governing text.

```md
---
title: [Title]
description: [One-sentence purpose]
status: active
owner: [owner]
truthStatus: canonical
docClass: canonical-doc
surfaceType: doctrine
relatedDomain: [domain]
order: [number]
---

# [Title]

This document defines the canonical doctrine for [area].
It should be used when [decision or placement question].

## Purpose

## Scope

## Required pattern

## Forbidden pattern

## Exceptions

## Enforcement or validation

## Related
```

### B. Owner-local doctrine

Use this rarely, and only when the owner has a durable bounded local policy or contract surface.
Place it under the owner's `docs/` surface.

```md
---
title: [Title]
description: [One-sentence purpose]
status: active
owner: [owner]
truthStatus: canonical
docClass: canonical-doc
surfaceType: doctrine
relatedDomain: [owner-domain]
order: [number]
---

# [Title]

This document defines the owner-local doctrine for [owner area].
It refines root doctrine for this bounded surface and does not replace repo-wide doctrine outside this owner.
```

### C. Supporting document

Use this for runbooks, handoffs, templates, migration notes, and non-canonical guidance.

```md
---
title: [Title]
description: [One-sentence purpose]
status: template | active
owner: [owner]
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: [domain]
order: [number]
---

# [Title]

This document is a supporting surface for [canonical area].
Use it to [specific reader task].
```

### D. Rule artifact or rules-side narrative

Use this only when the file is tied to enforcement posture, formal review, or machine consumption.

```md
---
title: [Title]
description: [One-sentence purpose]
status: active
owner: [owner]
truthStatus: canonical | supporting
docClass: canonical-doc | supporting-doc
surfaceType: rules
relatedDomain: [domain]
order: [number]
---

# [Title]

This document records a rules-side policy artifact for [domain].
It is tied to enforcement posture or formal review and is not a general governance archive note.
```

## 7. Authoring checks before merge

Before merging a new governed document, verify:

- metadata envelope is complete
- `surfaceType` matches the real surface
- `truthStatus` and `docClass` are not overstated
- header envelope explains use and limits
- naming is explicit and durable
- root placement is justified if the file lives at root scope
- owner-local doctrine, if used, is truly justified and lives under owner `docs/`

## 8. When to use a dedicated template instead

Do not force this generic scaffold when a stronger template already exists.

Use the dedicated templates for:

- ADRs: [`../adr/ADR_TEMPLATE.md`](../adr/ADR_TEMPLATE.md)
- ATCs: [`../atc/ATC_TEMPLATE.md`](../atc/ATC_TEMPLATE.md)

Use this scaffold for everything else that needs to follow the repo's current governance authoring contract.
