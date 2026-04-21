# Marketing Frontend Contract

This document defines the Phase 0 baseline for `apps/web/src/marketing`.

Use this with:

- [Design system](./DESIGN_SYSTEM.md)
- [Components and styling](./COMPONENTS_AND_STYLING.md)
- [Project structure](./PROJECT_STRUCTURE.md)

## Objective

The marketing frontend should ship a coherent public route tree with:

- one shared chrome layer
- page-owned composition
- explicit content ownership
- minimal shared UI surface

The goal is to keep marketing pages easy to debug, easy to delete, and hard to pollute with route-specific wrappers.

## Shared Marketing Surface

The shared marketing layer should stay limited to structural primitives:

- `MarketingPageShell`
- `MarketingPageSection`
- `MarketingSectionHeading`
- `MarketingSectionKicker`
- `marketing-reveal` helpers only when they remain purely behavioral

Anything outside this list starts page-local by default.

## Ownership Boundaries

### Shell owns

- top navigation
- skip link
- main landmark
- footer
- safe-area and base container behavior

### Section primitives own

- section spacing
- structural section wrapper behavior
- semantic heading/kicker presentation

### Page files own

- hero composition
- page rhythm
- CTA composition
- visual density
- background treatment
- route-specific narrative structure

### Content modules own

- copy
- static arrays
- route-specific labels and links

## Allowed

- shared structural wrappers with no route-specific art direction
- page-owned CTA sections
- page-owned hero layouts
- route-local decorative layers
- direct use of design-system primitives inside marketing pages
- motion helpers that do not decide layout or styling

## Disallowed

- shell-owned ambient backgrounds, grain, grids, or page identity
- shared helpers that decide hero layout
- shared helpers that decide CTA layout
- shared helpers that impose card rhythm across unrelated pages
- dead shell API surface
- route-specific visual rules hidden inside `_components`

## Reuse Rule

Do not add a new shared marketing component unless all conditions are true:

1. it is structural, not art-directed
2. it is reused unchanged by at least 3 pages
3. it does not decide route-specific composition
4. removing it would create obvious duplication of semantics, not just duplication of styling

If those conditions are not met, keep the code inside the page.

## Deletion Rule

Delete or localize a shared marketing component when any of the following becomes true:

- it owns page-specific layout decisions
- it exists mainly to style one route family
- it causes visual regressions across unrelated pages
- pages have to fight its layout contract instead of composing directly

## Definition of Done Before New Marketing Redesign Work

Before redesigning or extending a marketing page:

1. confirm the work stays within these boundaries
2. confirm the shared layer is still structural only
3. decide which file owns composition, content, and motion
4. document any new shared abstraction and why page-local code was insufficient

## Acceptance Checklist

Every new marketing change should be checked against this list:

- shell remains chrome-only
- no new shared route-specific wrapper was introduced
- CTA layout is page-owned
- hero layout is page-owned
- content lives with the route or a route-local content module
- tests lock behavior or route contract, not visual taste

## Phase 0 Baseline

This contract assumes the following cleanup has already happened:

- shell ambient background behavior removed
- shell badge API removed
- shared marketing CTA helper removed
- marketing pages own their closing CTA sections directly
