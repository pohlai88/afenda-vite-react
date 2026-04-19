# ADR-0006: Marketing feature topology

- **Status:** Accepted
- **Date:** 2026-04-19
- **Owner:** Platform / web
- **Review by:** 2026-10-01
- **Related:** [ADR-0004](./ADR-0004-web-src-architecture-rpc-runtime-features.md) (web `src/` boundaries), [ADR-0005](./ADR-0005-zustand-client-ui-store-adoption.md) (client-store governance)

## Context

The public marketing surface in `apps/web/src/marketing` has grown from a
single landing implementation into a real feature boundary with:

- a standalone route tree
- a dedicated theme boundary
- a runtime homepage chooser
- an ordered set of landing variants
- future requirements for company, legal, product, campaign, and regional pages

The marketing surface initially evolved like many public-site codepaths do: as a
flat collection of landing pages and supporting files. Without a documented
topology, this kind of feature typically degrades into:

- flat page dumps
- generic folders such as `provider/`, `route/`, and `styles/`
- unclear ownership between canonical pages and experimental concepts
- mixing routing, layout, and content concerns
- junk-drawer `shared/` folders
- drift in homepage strategy between route code and feature intent
- reliance on alphabetical structure instead of architectural intent

This matters because the marketing feature is now large enough to warrant its
own directory governance and naming rules, and because the public surface must
support both a canonical flagship identity and controlled experimental variants
without confusing the two.

## Decision

1. **`apps/web/src/marketing` is a governed standalone feature boundary** for the public marketing surface.
2. **Root layer: `src/marketing` root is reserved for runtime/orchestration files only.**
   Approved root files are:
   - `marketing.config.ts`
   - `marketing-layout.tsx`
   - `marketing-loading-fallback.tsx`
   - `marketing-page-registry.ts`
   - `marketing-random-home.tsx`
   - `marketing-routes.tsx`
   - `marketing-theme-provider.tsx`
   - `marketing.css`
3. **Pages layer: pages must live under `pages/` and be grouped by business domain**, not by technical type.
   Approved page domains are:
   - `landing`
   - `company`
   - `legal`
   - `product`
   - `campaigns`
   - `regional`
4. **Landing substructure: landing pages are split into canonical vs experimental ownership**:
   - `pages/landing/flagship/` for the canonical public brand face
   - `pages/landing/variants/` for ordered editorial/experimental landing concepts
     Variants are exploration, not identity.
5. **Shared layer: `shared/` is role-based only**, with approved buckets:
   - `blocks`
   - `chrome`
   - `content`
   - `media`
   - `seo`
6. **`shared/content/` is limited to cross-page contracts only**:
   - navigation
   - metadata
   - shared links
   - cross-page copy contracts
     Page-local prose remains near the page that owns it.
7. **Naming policy:** stable system files use descriptive names; numeric prefixes are permitted only inside `pages/landing/variants/`, where sequence is part of the product meaning.
8. **Homepage strategy is controlled via `marketing.config.ts`.**
   Supported modes are:
   - `random`
   - `flagship`
9. **Current runtime remains exploration-first** until a flagship page is added:
   - `/` -> random-home
   - `/marketing` -> random-home
   - `/marketing/:slug` -> landing variants
10. **Preferred production end state is canon-first**:
    - `/` -> flagship page
    - `/marketing` -> flagship page or redirect to `/`
    - `/marketing/:slug` -> landing variants
11. **Prohibited patterns** include:
    - flat page dumps
    - generic structural folders with low semantic value
    - mixing canonical and experimental landing pages in the same ownership layer
    - uncontrolled `shared/content/` growth
12. **Generic structural folders must not be reintroduced**:

- `provider/`
- `route/`
- `styles/`
- `landing-pages/`

13. **This topology prioritizes long-term clarity over speed of addition.**

## Alternatives considered

### Option A: Keep a flatter, ad hoc marketing tree

- Pros:
  - fewer folders immediately
  - lower perceived upfront structure cost
- Cons:
  - encourages flat page dumps
  - obscures business ownership
  - scales poorly once legal/company/product pages are added

### Option B: Generic technical folders (`provider/`, `route/`, `styles/`, `landing-pages/`)

- Pros:
  - familiar at small scale
  - easy to scaffold quickly
- Cons:
  - weak domain meaning
  - encourages architectural drift
  - does not age well in alphabetical explorers

### Option C: Domain-driven marketing feature topology

- Pros:
  - clear runtime vs page vs shared boundaries
  - scales for real product websites
  - supports canonical vs experimental landing separation
  - alphabetical explorers reinforce architecture rather than obscure it
- Cons:
  - requires explicit governance
  - introduces more folders earlier than an ad hoc layout

## Consequences

### Positive

- Marketing can scale into a serious product website without collapsing into a flat dump.
- Canonical brand pages and experimental landing concepts are explicitly separated.
- The file tree remains legible in standard IDE alphabetical sorting.
- Route ownership and homepage strategy become explicit rather than accidental.
- Alphabetical explorers reinforce the intended architecture instead of obscuring it.
- Marketing is treated as a system, not a collection of pages.

### Negative

- More up-front structure means contributors must follow the topology rules instead of improvising local folder shapes.
- Some currently approved domains may remain scaffold-only until product work reaches them.

## Governance rules

1. Root contains only marketing runtime, orchestration, and feature-boundary files.
2. `pages/` is organized by business domain; never as a flat page dump.
3. `pages/landing/flagship/` is the canonical public brand surface.
4. `pages/landing/variants/` contains ordered editorial or experimental landing concepts only.
5. Numeric prefixes are permitted only inside `pages/landing/variants/` where sequence is intentional.
6. `shared/` is role-based only: `blocks`, `chrome`, `content`, `media`, `seo`.
7. `shared/content/` is limited to cross-page content contracts, navigation, metadata, and shared link maps; page-local content must remain near its page.
8. Generic structural folders must not be reintroduced: `provider/`, `route/`, `styles/`, `landing-pages/`.
9. Stable informational pages use descriptive names only: `about-page.tsx`, `pdpa-page.tsx`, `privacy-policy-page.tsx`.
10. New page groups must be added by business domain, not by technical type.
11. Canonical homepage strategy must be explicit in `marketing.config.ts`: flagship or random-variant mode.
12. Page-frame components are allowed only when they represent a real domain scaffold, not a thin wrapper with no domain meaning.
13. The system is designed for long-term clarity and control, not speed of addition.

## Final statement

This topology enforces **marketing as a system, not a collection of pages**.

## Validation plan

- `pnpm --filter @afenda/web typecheck`
- focused marketing route/runtime tests
- review of new files against the approved topology before merge

## Follow-up actions

- [ ] Add `pages/landing/flagship/` and `pages/landing/variants/` once the flagship page and variant relocation are implemented
- [ ] Introduce `shared/blocks`, `shared/chrome`, `shared/content`, `shared/media`, and `shared/seo` when the first real shared marketing primitives are added
- [ ] Switch `marketing.config.ts` to `flagship` mode when the canonical homepage is ready

## References

- Local feature doc:
  - [apps/web/src/marketing/README.md](../../apps/web/src/marketing/README.md)
- Related docs:
  - [docs/PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)
  - [docs/ARCHITECTURE_EVOLUTION.md](../ARCHITECTURE_EVOLUTION.md)
  - [docs/STATE_MANAGEMENT.md](../STATE_MANAGEMENT.md)
