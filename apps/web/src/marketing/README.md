# Marketing Feature

## Purpose

This directory defines the **public marketing surface** of the application.

For the canonical homepage execution plan, see
[`FLAGSHIP_IMPLEMENTATION_PLAN.md`](./FLAGSHIP_IMPLEMENTATION_PLAN.md).

For feature-level visual, accessibility, and implementation rules, see
[`MARKETING_GUIDELINES.md`](./MARKETING_GUIDELINES.md).

It is:

- independent from `/app` (ERP shell)
- independent from `/auth` (auth surface)
- optimized for editorial, brand, and narrative clarity
- allowed to be expressive, but never structurally chaotic
- governed by strict topology and naming rules

This is not a page folder.

This is a **feature boundary**.

---

## Core Principles

### 1. Canon Over Chaos

There must always be a clear canonical public face.

- `pages/landing/flagship/` = brand truth
- `pages/landing/variants/` = exploration, not identity

Variants are allowed, but they do not become homepage truth unless explicitly configured.

### 2. No Flat Page Dumps

Pages are grouped by **business domain**, never by file type and never as one flat dump.

Allowed domains:

- `landing/`
- `product/`
- `company/`
- `legal/`
- `campaigns/`
- `regional/`

### 3. Separation of Concerns

| Layer     | Responsibility                |
| --------- | ----------------------------- |
| Root      | runtime + orchestration       |
| `pages/`  | business-facing page surfaces |
| `shared/` | reusable marketing primitives |
| config    | feature-level decisions       |

### 4. Controlled Experimentation

Landing variants may be experimental, but they:

- must live under `pages/landing/variants/`
- must not override the canonical homepage unless explicitly configured
- must not leak experimental patterns into shared primitives

### 5. Long-Term Clarity Over Speed

This system is not designed for speed of addition.

It is designed for long-term clarity and control.

---

## Topology

```text
marketing/
├── marketing.config.ts
├── marketing-layout.tsx
├── marketing-loading-fallback.tsx
├── marketing-page-registry.ts
├── marketing-random-home.tsx
├── marketing-routes.tsx
├── marketing-theme-provider.tsx
├── marketing.css
├── pages/
├── shared/
└── __tests__/
```

## Root Files

### `marketing.config.ts`

Defines stable feature-level decisions such as:

- homepage mode (`flagship` vs `random`)
- canonical homepage strategy
- feature-level switches
- future homepage and routing policy

### `marketing-layout.tsx`

Public shell boundary for marketing.

Owns:

- theme isolation
- root container
- outlet
- shell-level composition

Must not own:

- ERP shell concerns
- auth route composition
- page-specific business logic

### `marketing-routes.tsx`

Defines:

- public marketing route tree
- slug mapping
- legacy redirects

Must not contain:

- business copy
- page-local logic
- duplicated registry truth

### `marketing-page-registry.ts`

Single source of truth for:

- routable marketing pages
- landing variants
- slugs and identifiers
- page loaders

### `marketing-random-home.tsx`

Optional runtime for:

- session-based variant selection
- experimentation mode
- temporary exploration-first homepage behavior

This should only be active when enabled by `marketing.config.ts`.

### `marketing.css`

Feature-scoped art direction.

Allowed concerns:

- background systems
- editorial typography
- shell-level motion rules
- shared visual atmosphere

Must not contain:

- arbitrary page-specific hacks
- one-off layout fixes for individual pages

---

## Pages

`pages/` is organized by **business domain**, never as a flat page dump.

### `pages/_components/`

`pages/_components/` is the approved exception for reusable **page-frame
scaffolds** that support multiple marketing page domains.

Allowed concerns:

- page shells
- section scaffolds
- reusable CTA frames

Forbidden concerns:

- page-local prose
- route-only wrappers with no domain meaning
- generic utility dumping that belongs in `shared/`

### `pages/landing/`

Landing surfaces are split by purpose.

- `flagship/` = canonical homepage
- `variants/` = experimental/editorial concepts

### `pages/product/`

Explains system architecture, product capabilities, and platform meaning.

### `pages/company/`

Owns corporate identity, legitimacy, and trust surfaces.

### `pages/legal/`

Owns compliance, policy, trust, and governance pages.

### `pages/campaigns/`

Owns time-bound marketing efforts.

### `pages/regional/`

Owns geo-specific public surfaces.

---

## Shared

`shared/` is role-based only.

```text
shared/
├── blocks/   # editorial components
├── chrome/   # nav, footer, header, controls
├── content/  # shared content contracts
├── media/    # visuals, logos, embeds
└── seo/      # meta, canonical, structured data
```

### `shared/content/` rule

`shared/content/` is limited to **cross-page shared contracts** such as:

- navigation maps
- shared link maps
- marketing metadata
- cross-page copy contracts

It is **not** for page-local prose.

Page-specific content must remain near the page that owns it.

---

## Naming Rules

### Allowed

Use descriptive, stable names for informational pages:

- `about-page.tsx`
- `privacy-policy-page.tsx`
- `truth-engine-page.tsx`

### Numeric Prefix Rule

Numeric prefixes are allowed only in:

- `pages/landing/variants/`

Examples:

- `1.Moire-BW.tsx`
- `2.Kinetic-Absolutism-BW.tsx`

This is allowed because sequence is part of the editorial meaning.

### Forbidden

Do not use numeric prefixes for infrastructure:

- `01-layout.tsx`
- `02-marketing-routes.tsx`

Do not use vague, non-domain filenames:

- `random-page.tsx`
- `misc-page.tsx`
- `test-page.tsx`

Do not reintroduce generic structural folders:

- `provider/`
- `route/`
- `styles/`
- `landing-pages/`

---

## Anti-Patterns

Avoid these:

- flat page folders
- generic folders like `provider/`, `route/`, `styles/`
- page-specific logic inside `shared/`
- random homepage behavior without config control
- mixing flagship and experimental landing pages in the same ownership layer

---

## Extension Rules

When adding a new page:

1. Identify the business domain:
   - `product`
   - `company`
   - `legal`
   - `campaigns`
   - `regional`
2. Place the page under the correct domain folder
3. Register it in `marketing-page-registry.ts` if it is routable
4. Add the route in `marketing-routes.tsx`
5. Keep page-local logic and page-local content near the page

---

## Canonical Homepage

Homepage strategy must be explicit in [`marketing.config.ts`](./marketing.config.ts).

Supported modes:

- `flagship`
- `random`

Recommended production model:

- `/` -> flagship page
- `/marketing` -> flagship page or redirect to `/`
- `/marketing/:slug` -> landing variants

Temporary exploration model:

- `/` -> random
- `/marketing` -> random
- `/marketing/:slug` -> landing variants

Homepage behavior must never be implicit. It must be explicitly controlled through config.

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
