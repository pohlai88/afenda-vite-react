# Afenda Marketing Guidelines

Feature-level design and implementation standard for `apps/web/src/marketing`.

This document defines how Afenda's public marketing surface should look, read,
and behave. It is not a replacement for the global design system. It narrows
those standards into rules that fit the marketing feature's topology, flagship
doctrine, and shared page scaffolds.

---

## 1. Scope and authority

This document applies to all public marketing work under:

- `apps/web/src/marketing/pages/*`
- `apps/web/src/marketing/shared/*`
- `apps/web/src/marketing/marketing.css`
- marketing-root runtime files when they affect page presentation

Use this document together with:

- [`README.md`](./README.md)
- [`FLAGSHIP_IMPLEMENTATION_PLAN.md`](./FLAGSHIP_IMPLEMENTATION_PLAN.md)
- [`docs/decisions/ADR-0006-marketing-feature-topology.md`](../../../../docs/decisions/ADR-0006-marketing-feature-topology.md)
- [`docs/BRAND_GUIDELINES.md`](../../../../docs/BRAND_GUIDELINES.md)
- [`docs/DESIGN_SYSTEM.md`](../../../../docs/DESIGN_SYSTEM.md)
- [`docs/COMPONENTS_AND_STYLING.md`](../../../../docs/COMPONENTS_AND_STYLING.md)

External baseline used for this guideline:

- Vercel Web Interface Guidelines:
  `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`

If there is a conflict:

1. Repo architecture and topology rules win.
2. Global Afenda brand and design-system rules win.
3. This document defines marketing-specific implementation policy.

---

## 2. Marketing posture

Afenda marketing is not a generic startup site.

It must read as:

- benchmark-aware
- operationally serious
- editorially controlled
- product-led, not decoration-led

It must not read as:

- abstract SaaS theater
- gradient-heavy template work
- startup fluff with ERP words dropped in later
- disconnected route islands

The public surface should preserve Afenda's own identity even when it references
SAP, Oracle, Zoho, or QuickBooks as market benchmarks.

Working rule:

- benchmark the category
- preserve the Afenda point of view
- keep business ERP seriousness visible on every page

---

## 3. Canonical experience model

Marketing must behave like one system, not a pile of pages.

### 3.1 Canon over chaos

- `/`, `/marketing`, and `/marketing/flagship` are the canonical public face in
  flagship mode.
- Landing variants are exploration, not identity.
- Cross-links between flagship, product, company, legal, campaigns, and
  regional pages are required where they improve continuity.

### 3.2 Business-domain routing

Every page belongs to a real domain:

- `landing`
- `product`
- `company`
- `legal`
- `campaigns`
- `regional`

Do not hide meaning behind technical folder names or generic wrappers.

### 3.3 Entry point rule

The flagship is the marketing entry point.

- header identity links back to flagship
- footer directory can expose the full marketing tree
- every secondary page should route back into flagship, product, benchmark, or
  trust surfaces as appropriate

---

## 4. Visual system

### 4.1 Token ownership

Marketing uses the global design-system token layer only.

- use semantic tokens such as `bg-background`, `text-foreground`,
  `border-border`, `text-muted-foreground`, `bg-primary`, `text-primary`
- do not create a parallel color system inside page files
- do not hardcode raw brand hex values into JSX
- keep OKLCH token ownership in the app-level CSS system, not in marketing

### 4.2 Gradient scarcity

Afenda's brand gradient is intentional and rare.

Allowed:

- logo mark
- select hero atmospheres
- controlled ambient accents in `marketing.css`

Forbidden:

- gradient buttons
- gradient cards as a default recipe
- decorative gradient spam across entire pages

### 4.3 Surface language

Marketing surfaces should feel authored, not kit-assembled.

Preferred ingredients:

- warm neutral canvas
- strong border discipline
- controlled glass or atmospheric panels
- modest depth through shadow, not visual clutter
- sparse accent use for proof, benchmark, or status emphasis

Current shared surface classes already support this:

- `.flagship-card`
- `.flagship-canon-field`
- `.flagship-fragment-chip`
- `.flagship-grid`
- `.flagship-grain`

Promote new shared classes into `marketing.css` only when they represent a
cross-page visual primitive. Page-only fixes stay with the page.

### 4.4 Typography

Marketing typography must be clear, severe, and readable.

Required patterns:

- headings use `text-balance`
- longer supporting copy uses `text-pretty`
- dense numeric comparisons use `tabular-nums`
- uppercase mono kickers are reserved for metadata, not body copy
- negative tracking is allowed on display and section titles when it improves
  authority and density

Do not introduce an alternate font system locally without a broader design
decision. Marketing inherits the app's approved typography stack.

---

## 5. Layout and page composition

### 5.1 Required shared scaffolds

Use the shared marketing page primitives before inventing new wrappers:

- `MarketingPageShell`
- `MarketingPageSection`
- `MarketingSectionHeading`
- `MarketingSectionKicker`
- `MarketingCallToActionPanel`

These are the approved page-frame primitives for:

- top rail and footer continuity
- section width and spacing rhythm
- CTA framing
- skip-link support
- mobile page-directory behavior

### 5.2 Shell behavior

`MarketingPageShell` owns:

- skip link
- top rail
- page directory navigation
- footer directory
- ambient background layer

Page files should not duplicate those responsibilities unless there is a clear,
domain-specific reason.

### 5.3 Section rhythm

Default marketing section rhythm is already established by
`MarketingPageSection`:

- `max-w-7xl`
- `px-6 md:px-10 lg:px-12`
- `py-20 md:py-24 lg:py-28`

Deviate only when a page needs a hero-specific top/bottom pacing rule.

### 5.4 Grid philosophy

Prefer CSS layout over JS measurement.

Preferred patterns:

- `grid`
- `flex`
- `minmax(0, ...)`
- `min-w-0`
- breakpoint-controlled column transitions

Do not measure layout in render for standard marketing composition.

---

## 6. Tailwind and CSS implementation rules

This feature follows the repo's Tailwind v4 CSS-first model and the marketing
feature's own art-direction boundary.

### 6.1 Tailwind usage

Prefer:

- semantic utilities over raw color utilities
- `size-*` when width and height match
- `gap-*` over ad hoc spacing hacks
- `touch-manipulation` on tap-heavy CTA controls
- `overflow-x-hidden` only when container overflow needs intentional control
- `focus-visible:*` over `focus:*` for keyboard focus styling

Avoid:

- raw `bg-blue-*`, `text-gray-*`, or similar utility colors
- arbitrary values when a shared token or existing spacing scale can solve it
- `transition-all`
- global selectors for route-specific layout

### 6.2 `marketing.css` contract

Allowed concerns in `marketing.css`:

- ambient background systems
- feature-level editorial typography helpers
- shared motion helpers
- reusable marketing atmosphere and glass surfaces
- flagship-specific cross-section classes

Forbidden concerns:

- one-off route fixes
- page-local copy styling hacks
- hidden duplicate token ownership
- isolated classes that only patch a single broken layout

### 6.3 Component escalation order

When a new pattern is needed, escalate in this order:

1. Existing shared marketing page primitives
2. Semantic Tailwind utilities in the page
3. Shared marketing CSS primitive in `marketing.css`
4. Shared marketing component under `pages/_components/`
5. Design-system primitive only if the pattern belongs beyond marketing

---

## 7. Accessibility and web interface baseline

Marketing pages must satisfy the same interaction quality bar as product UI.

### 7.1 Required rules

- include a skip link for the main content target
- maintain heading hierarchy from `h1` downward
- use semantic HTML before ARIA
- use links for navigation and buttons for actions
- icon-only controls need `aria-label`
- decorative icons need `aria-hidden="true"`
- images need `alt`, width, and height where applicable
- interactive elements need visible focus states
- hover states must not be the only interaction feedback
- reduced-motion users must receive a coherent equivalent experience

### 7.2 Text and overflow rules

- use `min-w-0` in flex/grid children where text may compress
- truncate or wrap long content intentionally
- handle empty states explicitly
- keep CTA labels specific, not vague

### 7.3 Locale and translation rules

Use `translate="no"` for:

- `Afenda`
- `NexusCanon`
- short brand initials and code-like identifiers

Use `Intl.*` for future locale-sensitive dates, times, numbers, or currencies on
marketing pages. Do not hardcode locale formats.

### 7.4 Touch and mobile rules

- important CTAs should use `touch-manipulation`
- horizontal mobile nav rails must remain scrollable and readable
- full-width sections should avoid accidental horizontal overflow
- safe content padding must be preserved on narrow screens

---

## 8. Motion rules

Motion is allowed in marketing, but only when it increases authority and
comprehension.

### 8.1 Required motion policy

- animate `transform` and `opacity` only
- support `prefers-reduced-motion`
- keep animations interruptible and non-blocking
- list transition properties explicitly

### 8.2 Flagship rule

The flagship gets the strongest motion treatment, but even there motion should
stay restrained and architectural.

The flagship implementation plan already defines:

- one cinematic chamber
- restrained section reveals
- proof-first pacing
- reduced-motion parity

Do not spread cinematic behavior across every page.

### 8.3 Shared motion helpers

Prefer existing motion helpers:

- `getMarketingReveal`
- `MARKETING_EASE_OUT`
- `useReducedMotion`

Create new shared motion helpers only when multiple domains need the same motion
contract.

---

## 9. Copy and narrative rules

### 9.1 Voice

Marketing copy should be:

- direct
- specific
- operational
- proof-led

Avoid:

- vague transformation language
- empty adjectives
- generic "future of work" phrasing
- copy that sounds like a template for any B2B SaaS product

### 9.2 Style rules

Use:

- active voice
- Title Case for headings and CTA labels
- numerals for counts
- the real ellipsis character: `…`
- specific CTA labels such as `Open Trust Center` or `View Benchmark ERP`

Prefer second person and concrete consequence over abstract aspiration.

### 9.3 Afenda-specific narrative

The flagship and benchmark pages should preserve this logic:

- Afenda is benchmark-aligned
- Afenda is not derivative
- proof, continuity, and accountability are core claims
- finance, inventory, and operations remain the stable ERP scope

### 9.4 Domain ownership

Each domain owns distinct copy work:

- `landing`: canonical public narrative and variants
- `product`: system architecture, truth model, platform meaning
- `company`: legitimacy, identity, company posture
- `legal`: privacy, trust, governance, policy readability
- `campaigns`: time-bound benchmark or acquisition narratives
- `regional`: geo-specific business and policy context

Do not flatten these into one voice blob.

---

## 10. Page-type guidance

### 10.1 Flagship

The flagship should feel like system judgment, not a generic hero page.

Required qualities:

- canonical authority
- proof language
- serious ERP positioning
- one controlled cinematic chamber
- strong CTA close without theatrical noise

### 10.2 Campaigns

Campaign pages may be sharper and more comparative, but must still route back
to the product story and trust model.

### 10.3 Product pages

Product pages explain the mechanism beneath the narrative.

They should clarify:

- what the system does
- how proof is preserved
- why the record remains defensible

### 10.4 Company pages

Company pages establish legitimacy without dissolving into generic startup copy.

### 10.5 Legal pages

Legal pages must stay readable under pressure.

They should not become:

- wall-of-text dumps
- detached mini-sites
- unstructured compliance theater

### 10.6 Regional pages

Regional pages must carry real geo-specific meaning:

- policy
- localization
- entity complexity
- rollout context

They are not placeholders for country flags and generic geography language.

---

## 11. Anti-patterns

Flag these during implementation and review:

- flat page dumps
- route-specific wrappers with no domain meaning
- duplicate top rails or footer navigation inside page files
- raw color classes in marketing pages
- gradient-heavy "AI slop" surfaces
- multiple cinematic sections competing on one page
- `transition: all`
- icon-only controls without labels
- long text blocks without width control or wrapping strategy
- missing `translate="no"` on brand identifiers
- copy that could belong to any SaaS homepage
- legal pages with lower quality than the flagship

---

## 12. Delivery checklist

Before a new marketing page or significant revision is considered done:

- page is placed under the correct business domain
- route is registered in `marketing-page-registry.ts`
- route is mounted through `marketing-routes.tsx`
- page reuses the shared shell primitives where appropriate
- focus, skip link, headings, and link/button semantics are correct
- mobile layout and nav behavior are verified
- reduced-motion behavior is acceptable
- cross-links back into flagship or adjacent routes are intentional
- copy is specific and benchmark-aware without losing Afenda identity
- focused tests are added or updated when route/page behavior changes

Recommended validation:

- focused marketing Vitest suite
- `pnpm --filter @afenda/web typecheck`
- `pnpm --filter @afenda/web build`

---

## 13. Working shorthand for reviews

Prefer these review statements:

- "This improves the canon."
- "This belongs to a variant, not the flagship."
- "This strengthens proof."
- "This preserves Afenda's own identity."
- "This should stay in the shared shell."
- "This is page-local and should not enter `marketing.css`."
- "This reads like generic SaaS copy and needs more business consequence."

Avoid:

- "make it cooler"
- "add more wow"
- "make it more futuristic"
- "give it more sauce"

The standard is authority, clarity, proof, continuity, and implementation
discipline.
