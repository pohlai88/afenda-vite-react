# Filesystem Governance

## Purpose

This policy defines durable filesystem rules for ownership clarity, import safety, debugging speed, and long-term drift resistance.

The filesystem is treated as an architecture contract, not a convenience layer.

## Core Doctrine

- Every path must express ownership and runtime role.
- File names must describe responsibility, not implementation shape.
- Promoted layers are explicit and limited.
- Generic naming and casual nesting are the fastest route to architecture drift.

## Rule 1: Architecture Boundaries

Top-level directories are governed boundaries.

Approved root examples:

- `apps/`
- `packages/`
- `docs/`
- `scripts/`
- `rules/`

New root directories must not be introduced casually.

## Rule 2: Promoted `shared/` Policy

`shared/` is allowed only as a promoted architecture boundary.

Allowed:

- one app-level `shared/` or `share/` root
- one package-level reusable boundary when the package itself is the shared artifact

Forbidden:

- nested `shared/` folders inside features, pages, marketing sections, or submodules
- convenience `shared/` folders created to avoid naming local ownership

Decision rule:

- if code is used by one owner, keep it local
- if code is reused across unrelated owners, promote it intentionally

## Rule 3: Naming

Files must use semantic compound names.

Rules:

- minimum: 2 semantic labels
- preferred: 3 semantic labels
- maximum: 4 semantic labels
- every label must add ownership meaning

Good:

- `flagship-page.tsx`
- `flagship-page-panels.tsx`
- `flagship-page-editorial.ts`
- `auth-session-service.ts`

Bad:

- `page.tsx`
- `sections.tsx`
- `content.ts`
- `utils.ts`
- `helpers.ts`

Generic names are forbidden unless explicitly justified and whitelisted.

## Rule 4: Nesting

Nested folders are allowed only if each level introduces one of:

- ownership boundary
- runtime boundary
- import boundary
- deployment boundary
- governance boundary

If a level adds no architectural meaning, flatten it.

## Rule 5: Max Depth

Below a governed source root, prefer a maximum of four directory layers before the file.

Example:

- `apps/web/src/marketing/pages/landing/flagship/flagship-page.tsx`

Exceed this only with explicit architectural justification.

## Rule 6: Page-Owned Modules

Page-owned files should use the page name as the prefix.

Recommended pattern:

- `<page>-page.tsx`
- `<page>-hero.tsx`
- `<page>-panels.tsx`
- `<page>-editorial.ts`
- `<page>-motion.ts`
- `<page>.test.tsx`

## Rule 7: Import Direction

- routes may import features, platform, content, and promoted shared layers
- features may import promoted shared layers and platform contracts
- promoted shared layers must not import feature internals
- editorial/content files must not import rendering logic

## Rule 8: Split Criteria

Create a new file only if the split improves one of:

- ownership clarity
- import safety
- testability
- reuse
- bug localization

Do not split for aesthetic neatness alone.

## Rule 9: Anti-Drift Enforcement

The repository should enforce at least:

- promoted shared-layer checks
- denylisted generic file names
- max depth checks
- import boundary checks where practical

The checker may begin narrow and become stricter over time, but the policy should remain stable.
