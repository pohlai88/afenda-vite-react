# Clean Rewrite Proposal

This document defines the proposed clean rewrite structure for `packages/_database/docs`.

## Goal

Rebuild the database documentation from a single principle:

> document the current package truth first, then document planned growth as planned growth

The rewrite should avoid mixing:

- active schema
- removed legacy structures
- target-state ERP architecture
- raw design exploration

## Proposed document set

### 1. `README.md`

Purpose:

- package docs index
- explain documentation policy
- point readers to the correct source of truth

### 2. `CURRENT_BASELINE.md`

Purpose:

- define the active schema surface
- define the current exported modules
- define what was removed in the restart
- define what downstream packages currently depend on

This is the most important operational doc.

### 3. `DATABASE_DOCTRINE.md`

Purpose:

- define enduring modeling principles
- tenant-first rules
- identity vs business principal rules
- migration and naming doctrine
- documentation hygiene rules

This file should be principle-level, not a feature inventory.

### 4. `GROWTH_SEQUENCE.md`

Purpose:

- define the approved rebuild order
- identity and tenant root
- tenant membership
- organization structure
- authorization
- MDM masters
- governance and stewardship
- richer audit enrichment

This separates current truth from future sequence.

### 5. `DB_STUDIO.md`

Purpose:

- describe the current DB Studio contract
- glossary snapshot behavior
- enum catalog behavior
- audit/studio read-only behavior

Only include what still exists.

### 6. `GLOSSARY_GOVERNANCE.md`

Purpose:

- explain how the business glossary is maintained
- define whether YAML is still primary
- define when DB-backed glossary workflows are introduced

This replaces the old fragmented governance wording.

## Documents that should not return in their old form

Do not restore old docs that describe removed or speculative surfaces as if they are active.

Examples of content that should not be reintroduced without explicit implementation:

- seed tooling as active package capability
- role and permission tables as current schema
- organization tables as already-present runtime truth
- broad ERP DDL mirrors presented as current package behavior

## Rewrite order

1. Write `CURRENT_BASELINE.md`.
2. Rewrite doctrine as `DATABASE_DOCTRINE.md`.
3. Add `GROWTH_SEQUENCE.md`.
4. Add `DB_STUDIO.md` only for active studio behavior.
5. Add `GLOSSARY_GOVERNANCE.md`.
6. Reintroduce source/reference material only in a clearly marked `reference/` or `source/` area.

## Content rules

- Current-state docs must match active code.
- Future-state docs must be labeled as proposal, target, or sequence.
- Source/reference files must be clearly marked as non-normative.
- A document should never mix current truth and future design without explicit section labels.

## Suggested next implementation

The next rewrite pass should create these concrete files:

- `CURRENT_BASELINE.md`
- `DATABASE_DOCTRINE.md`
- `GROWTH_SEQUENCE.md`
- `DB_STUDIO.md`
- `GLOSSARY_GOVERNANCE.md`

Until those exist, this proposal and the README are the clean baseline.
