---
title: Repo guardrail todo
description: Governed execution roadmap for repository guardrail architecture, Repository Integrity Guard expansion, and promotion criteria.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
relatedDomain: governance-registry
order: 13
---

# Repo guardrail todo

This document is the working program spec for the repository guardrail architecture.

It is not only a checklist.
It is the planning surface for:

- what already exists
- which guardrails are missing
- what each missing guardrail must detect
- what evidence each one must produce
- what promotion conditions must be satisfied before the repo-truth layer becomes stricter

The intent is to keep this human-readable first, while making it structured enough to drive ADR, ATC, and future machine-readable coverage later.

## Current baseline

### Done

- Governance spine exists.
- Naming doctrine exists.
- Naming checker exists.
- `scripts/` ownership cleanup is done.
- Repository Integrity Guard V1 exists.
- `repo:guard` and `repo:guard:ci` are working.
- `GOV-TRUTH-001` is registered as warn-first.
- Standalone repo guard is green on a clean tree.

### Missing

- Major guardrails are implemented as first cuts.
- Repo-specific calibration is still incomplete.
- Promotion readiness is now blocked only by manual criteria, not live technical drift.

## Track 1 — Architecture documentation

### Highest priority

- [x] Write `ADR-0008-repository-integrity-guard-architecture.md`
  - Purpose of the repo-truth layer
  - Why it aggregates existing evaluators
  - Why it is warn-first in V1
  - Why evidence is self-managed but governance-readable
  - Why native scanners are intentionally small in V1

- [x] Write `ATC-0005-repository-integrity-guard-baseline.md`
  - Bound command surface
  - Bound report contract
  - Bound evidence paths
  - Bound native scanner scope for V1
  - Bound warn/block semantics
  - Promotion criteria from warned to blocking

### Follow-up

- [x] Link the new ADR from the repo-guard doctrine
- [x] Link the new ATC from the repo-guard doctrine
- [x] Add both to generated discovery surfaces
- [x] Ensure the repo-guard doctrine references ADR + ATC explicitly
- [x] Bind `GOV-TRUTH-001` to ADR-0008 and ATC-0005 through governance config references
- [x] Add repo-specific activation docs for truth map, activation plan, and false-positive logging

## Track 1.5 — Repo-specific activation surfaces

- [x] Create `REPO_GUARD_REPO_MAP.md`
- [x] Create `REPO_GUARD_ACTIVATION_PLAN.md`
- [x] Create `REPO_GUARD_FALSE_POSITIVE_LOG.md`
- [x] Link activation surfaces from the repo-guard doctrine
- [ ] Keep the repo map current as repo-guard policy tightens

## Track 2 — Repository Integrity Guard V1 hardening

### Immediate

- [ ] Review current `repo-guard-policy.ts` for missing exclusions or overreach
- [ ] Confirm protected generated paths are exactly correct
- [ ] Confirm current working-tree legitimacy rules are stable for daily use
- [ ] Decide whether `repo:guard` should stay purely local/human or be used in more workflows

### Follow-up

- [x] Add explicit repo-guard waiver registry instead of policy-local inline waivers
- [x] Add waiver expiry reporting in repo-guard output
- [ ] Add clearer human summary formatting for top findings
- [ ] Add new-violations-only comparison mode later

## Track 3 — Guardrail program spec

This section defines the missing guardrails as structured implementation contracts.

### Guardrail RG-STRUCT-001 — Placement / ownership guard

- Status: `partial`
- Owner: `governance-toolchain`
- Domain: `structure`
- Blocking: `false`

Contract:

- Detect file outside owner root.
- Detect app-local script leaking into root `scripts/`.
- Detect generated artifact outside approved paths.
- Detect feature code placed in a shared layer without approved ownership.

Evidence:

- `filePath`
- `expectedRoot`
- `actualRoot`
- `violatedPlacementRule`

Failure semantics:

- level: `fail`
- reasoning: breaks repository structure invariants

Dependencies:

- owner-root policy
- workspace topology map
- package ownership policy

Current implementation note:

- First cut is implemented inside the Repository Integrity Guard as a native scanner.
- Current coverage is grounded in declared rollout owner truth, runtime owners, and shared roots.
- Root `scripts/` leakage detection and broader repo-wide ownership families still need follow-through.

Promotion requirements:

- false positive rate < 2%
- CI usage for at least 1 full cycle
- no unresolved placement drift in protected roots

### Guardrail RG-TRUTH-002 — Generated artifact authenticity guard

- Status: `partial`
- Owner: `governance-toolchain`
- Domain: `truth-critical`
- Blocking: `false`

Contract:

- Detect orphan generated files.
- Detect stale generated outputs.
- Detect suspicious manual edits in generated files.
- Detect generated artifacts with missing or invalid source provenance.

Evidence:

- `filePath`
- `generatorSource`
- `expectedHash` or equivalent freshness proof
- `actualHash` or actual freshness state
- `sourceManifest`

Failure semantics:

- level: `fail`
- reasoning: breaks truth reproducibility

Dependencies:

- generator manifest
- spec-to-output mapping
- provenance or hash strategy

Current implementation note:

- First cut is implemented inside the Repository Integrity Guard as a native scanner.
- Current coverage binds governance-register outputs, design-system component-governance artifacts, and selected database generated artifacts to explicit provenance and canonical renderers.
- Wider generated-root provenance and authenticity coverage still need follow-through.

Promotion requirements:

- zero false positives in protected generated surfaces
- stable regeneration flow for all governed generators

### Guardrail RG-STRUCT-003 — Boundary / import regression guard

- Status: `partial`
- Owner: `governance-toolchain`
- Domain: `structure`
- Blocking: `false`

Contract:

- Detect forbidden cross-root imports.
- Detect shared code importing app-owned logic.
- Detect route code bypassing approved public surfaces.
- Detect package internals imported across package boundaries.

Evidence:

- `importer`
- `importTarget`
- `violatedRule`
- `boundaryType`

Failure semantics:

- level: `fail`
- reasoning: breaks architecture boundary invariants

Dependencies:

- workspace topology
- public-surface policy
- route/package boundary map

Promotion requirements:

- false positive rate < 2%
- rule coverage for all protected app/package roots

Current implementation note:

- First cut is implemented inside the Repository Integrity Guard as a native scanner.
- Current coverage is intentionally narrow and high-confidence: selected app-root cross-boundary drift, workspace-private path leakage, and package subpath import enforcement against declared `exports`.
- Full public-surface and package-internal boundary coverage still need follow-through.

### Guardrail RG-TRUTH-004 — Source / evidence mismatch guard

- Status: `partial`
- Owner: `governance-toolchain`
- Domain: `truth-critical`
- Blocking: `false`

Contract:

- Detect source changed but report not updated.
- Detect report changed without plausible source change.
- Detect partial cleanup states.
- Detect doctrine/config/evidence mismatch.

Evidence:

- `sourcePath`
- `evidencePath`
- `mismatchType`
- `expectedRefreshAction`

Failure semantics:

- level: `fail`
- reasoning: breaks repo truth traceability

Dependencies:

- evidence map
- generated surface map
- source-to-report bindings

Promotion requirements:

- stable evidence map across all governed reports
- no recurring mismatch churn over 1 full cycle

Current implementation note:

- First cut is implemented inside the Repository Integrity Guard as a native scanner.
- Current coverage is intentionally narrow and high-confidence: governance-register refresh, repo-guard discovery surfaces, and selected design-system and database evidence loops.
- Full source-to-evidence bindings for all governed reports and generated outputs still need follow-through.

### Guardrail RG-HYGIENE-005 — Duplicate / overlap guard

- Status: `partial`
- Owner: `governance-toolchain`
- Domain: `hygiene`
- Blocking: `false`

Contract:

- Detect suspicious duplicate filenames.
- Detect `copy`, `final`, `v2`, `draft`, and `new` patterns more intelligently.
- Detect duplicate generators for the same target.
- Detect overlapping docs with the same purpose.

Evidence:

- `candidatePath`
- `relatedPath`
- `overlapType`
- `heuristicReason`

Failure semantics:

- level: `warn`
- reasoning: hygiene drift is real but not always high-confidence enough to fail immediately

Dependencies:

- filename heuristics
- doc-title/index metadata
- generator target map

Promotion requirements:

- warning quality is stable
- false positive rate acceptable for advisory usage

Current implementation note:

- First cut is implemented inside the Repository Integrity Guard as a native scanner.
- Current coverage is intentionally narrow and advisory: suspicious tracked variant names and duplicate basenames inside duplicate-sensitive governed surfaces.
- Full semantic overlap detection for docs, generators, and logic still needs follow-through.

### Guardrail RG-ADVISORY-006 — Advanced document-control guard

- Status: `partial`
- Owner: `docs-policy`
- Domain: `advisory`
- Blocking: `false`

Contract:

- Detect orphan canonical docs.
- Detect draft docs pretending to be canonical.
- Detect missing parent doctrine links.
- Detect missing ADR/ATC linkage where required.

Evidence:

- `docPath`
- `documentClass`
- `missingLinkType`
- `expectedParent`

Failure semantics:

- level: `warn`
- reasoning: document legitimacy matters, but some cases remain advisory until the doctrine network is fuller

Dependencies:

- document metadata
- governance doctrine map
- ADR/ATC linkage policy

Promotion requirements:

- doctrine linkage rules stabilized
- canonical vs supporting classification trusted across governed docs

Current implementation note:

- First cut is implemented inside the Repository Integrity Guard as a native scanner.
- Current coverage is intentionally narrow and advisory: frontmatter presence, required governance metadata, and ADR/ATC linkage markers in governed doctrine surfaces.
- Full parent/child doctrine authority resolution and deeper document-network validation still need follow-through.

## Track 4 — Guardrail coverage model

The guardrail program should eventually report explicit coverage, not only findings.

### Target coverage shape

```txt
implemented
partial
missing
```

### Coverage intent

- [x] Add a machine-readable coverage summary for implemented guardrails
- [x] Mark partial guardrails explicitly
- [x] Mark missing guardrails explicitly
- [x] Allow the repo guard to report which parts of repository truth are still uncovered

### Initial target mapping

- Implemented:
  - existing filesystem governance
  - generated artifact governance
  - storage governance
  - naming convention
  - documentation governance
  - workspace/package topology
  - file survival / reviewed survival
  - dirty file scan
  - working tree legitimacy

- Partial:
  - generated artifact authenticity
  - placement / ownership
  - boundary / import regression
  - source / evidence mismatch
  - duplicate / overlap
  - advanced document control

- Missing:
  - none in the current roadmap set besides deeper hardening of partial guards

## Track 5 — Governance promotion plan

### Current

- [x] `GOV-TRUTH-001` is `warn`

### Promotion gate

Before promotion to block, the following must be true:

- [x] ADR exists
- [x] ATC exists
- [~] Truth-critical guards are implemented
- [~] Structure guards are implemented
- [~] Hygiene/advisory coverage is sufficiently mature
- [ ] False positive rate < 2%
- [ ] No unresolved fail findings for 1 full cycle
- [~] Waiver registry is explicit and audited
- [ ] Repo-specific activation plan has been exercised through one warned calibration cycle

### Final

- [ ] Promote `GOV-TRUTH-001` from `warn` to `block`
- [ ] Add repo guard into stronger CI posture only after stability review
- [ ] Update doctrine and ATC to reflect blocking status

## Suggested execution order

### Phase A

- [x] ADR-0008
- [x] ATC-0005

### Phase B

- [~] RG-STRUCT-001 placement / ownership
- [~] RG-TRUTH-002 generated artifact authenticity

### Phase C

- [~] RG-STRUCT-003 boundary / import regression
- [~] RG-TRUTH-004 source / evidence mismatch

### Phase D

- [~] RG-HYGIENE-005 duplicate / overlap
- [~] RG-ADVISORY-006 advanced document control

### Phase E

- [x] Waiver system hardening
- [x] Coverage reporting
- [~] Promotion review for `GOV-TRUTH-001`

### Phase F

- [x] Repo truth-map and activation docs
- [~] Warned-cycle calibration
- [~] Promotion decision record

## Definition of done for repository guardrail architecture

- [x] Doctrine exists
- [x] ADR exists
- [x] ATC exists
- [x] Guard is implemented
- [x] Guard has evidence output
- [x] Guard has stable CI behavior
- [~] Core missing guardrails are implemented
- [x] Coverage reporting exists
- [x] Waiver model exists
- [x] Promotion criteria are explicit
- [ ] Blocking rollout decision is documented

## Current status label

`Repository Integrity Guard V1 is green on a clean tree; all major roadmap guardrails, waiver hardening, activation docs, coverage reporting, and a first bounded warned-cycle review are in place; remaining work is repo-specific tightening, stable cycle evidence across time, and the final promotion decision.`
