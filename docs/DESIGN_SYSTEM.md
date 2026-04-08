# Afenda ERP — Design system

> **Philosophy: “Intentional craft”** — Every visual choice has a documented reason. When someone asks *why does it look like this?*, the answer should tie back to UX, accessibility, and ERP task clarity—not decoration alone.

This document is the **source of truth** for tokens, layout, motion, and component styling rules in **`apps/web`**. It extends [**Brand guidelines**](./BRAND_GUIDELINES.md) (logo, gradient, tenant-facing identity) and pairs with [**Components and styling**](./COMPONENTS_AND_STYLING.md) (React patterns, Tailwind/shadcn when adopted).

**Implementation today:** [`apps/web/src/index.css`](../apps/web/src/index.css) uses custom variables. New UI should converge on **semantic tokens** (`bg-primary`, `text-muted-foreground`, CSS variables)—avoid raw hex in JSX.

---

## Table of contents

1. [Design principles](#1-design-principles)
2. [Standards and references](#2-standards-and-references)
3. [Color system](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing and layout](#5-spacing-and-layout)
6. [Elevation and depth](#6-elevation-and-depth)
7. [Motion and animation](#7-motion-and-animation)
8. [Visual signature](#8-visual-signature)
9. [Component patterns](#9-component-patterns)
10. [Tenant branding](#10-tenant-branding)
11. [Anti-patterns](#11-anti-patterns)
12. [Accessibility](#12-accessibility)

---

## 1. Design principles

Shared vocabulary (inspired by common design-system practice: clarity, semantic color, hierarchy, guidance, proportionate feedback)—applied to **dense ERP** screens.

### 1.1 Clarity builds confidence

**Why:** Posting journals, approving requisitions, and releasing orders are high-impact. Users must see **whose data**, **what state**, and **what happens next**.

**Tactics**

- Labels and column headers that stand alone (no mystery abbreviations without glossary).
- Explicit **status** (draft, submitted, posted, paid) with consistent icons/colors (see [Color system §3.2.2](#3-color-system)).
- Confirmations for destructive or irreversible actions, with plain-language consequences.
- **Breadcrumbs** or context bar when depth > one level.
- Clear **tenant / org / entity** scope (“Acme Corp · EU ledger”).

**Anti-pattern:** Ornamental chrome that competes with tables and primary metrics.

### 1.2 Color encodes meaning

**Why:** Color is a **language**, not wallpaper. ERP modules should be **scannable**: users recognize Finance vs Inventory vs HR from consistent cues.

**Tactics**

- **Domain accent** — 3px **left border** on module cards ([Visual signature §8](#8-visual-signature)).
- **Fixed domain palette** ([Color system §3.2.3](#3-color-system)) — same hues for all tenants.
- **Status colors** for feedback only ([Color system §3.2.2](#3-color-system)).
- **Primary** — interactive emphasis (buttons, links, focus), plus brand identity; see [Brand guidelines](./BRAND_GUIDELINES.md).

**Anti-pattern:** Gradients on routine controls; multiple unrelated accent colors on one card.

### 1.3 Selective emphasis creates hierarchy

**Why:** If everything is loud, nothing wins. Reserve strong color and elevation for **one primary action** and **one hero** context per view when possible.

**Tactics**

- One **hero** region per page (page header or key KPI band).
- **Solid** `bg-primary` for the primary button—no gradient on buttons ([Brand guidelines](./BRAND_GUIDELINES.md) §4).
- Muted surfaces for secondary blocks; progressive disclosure for detail.
- **One brand gradient** in the product shell: logo mark + hero only ([Brand guidelines](./BRAND_GUIDELINES.md) §4).

**Anti-pattern:** Gradient buttons + gradient cards + heavy shadows everywhere.

### 1.4 Guide, don’t overwhelm

**Why:** Users are experts in their jobs, not in your navigation. Meet them with **defaults**, **empty states that teach**, and **short paths** for the 80% case.

**Tactics**

- Empty states with **one clear CTA** and short explanation (“No orders yet — create a sales order”).
- Step indicators on long wizards (posting, period close, onboarding).
- Tooltips for field-level help; sensible **defaults** on forms.
- **Limit primary CTAs** to one or two per viewport where possible.

**Anti-pattern:** Dashboards that show 20 equal-weight actions with no story.

### 1.5 Celebrate what matters

**Why:** Appropriate feedback reinforces correct workflows (posting succeeded, batch completed).

**Tactics**

- Match feedback **weight** to outcome (subtle toast vs stronger success pattern for period close).
- Human success copy where it fits (“Posted to the general ledger”) vs generic “Success”.
- **Don’t** use identical celebration for trivial and critical events.

**Anti-pattern:** Same toast for every save; noisy confetti for minor edits.

---

## 2. Standards and references

| Area | Reference | How we use it |
| --- | --- | --- |
| Usability | Nielsen’s heuristics (NN/g) | Visibility of status, error prevention, recognition |
| Color roles | Material / industry practice | Primary / secondary / accent + semantic status |
| Token naming | Semantic first (`primary`, `muted`) | Maps to CSS variables and Tailwind when adopted |
| Neutrals | 12-step style ramps (compare Radix) | Warm gray ~260 hue; tune for contrast |
| Color spaces | OKLCH for all color tokens | See [§3.1](#3-color-system) |
| Type scale | Major third (~1.25) | Dense dashboards ([§4.2](#4-typography)) |
| Accessibility | WCAG 2.1 AA | [§12](#12-accessibility) |

---

## 3. Color system

### 3.1 Why OKLCH

**OKLCH** is perceptually uniform: equal numeric steps read as even brightness steps—useful for **neutrals**, **status**, and **domain** colors. All theme tokens (`:root`, `.dark`, `.classic-dark`) use OKLCH triplets (`L C H`) exclusively. **Tenant brand** colors often arrive as hex; convert to OKLCH for ramps and **dark mode** pairs when you implement theming.

Benefits: predictable contrast work, harmonious palettes from a seed, cross-hue balance.

### 3.2 Palette structure

#### 3.2.1 Neutrals (warm gray, hue ~260)

Warmth reduces a clinical feel; slight blue undertone keeps ERP UIs professional.

| Step | OKLCH (reference) | Light mode | Dark mode |
| --- | --- | --- | --- |
| 1 | `oklch(99% 0.003 260)` | Page background | — |
| 2 | `oklch(97% 0.005 260)` | Card / panel | — |
| 3 | `oklch(94% 0.008 260)` | Muted surface | — |
| 4 | `oklch(90% 0.010 260)` | Borders | — |
| 5 | `oklch(80% 0.010 260)` | — | Muted text |
| 6 | `oklch(55% 0.010 260)` | Secondary text | Secondary text |
| 7 | `oklch(40% 0.012 260)` | Body text | — |
| 8 | `oklch(25% 0.015 260)` | Headings | — |
| 9 | `oklch(18% 0.015 260)` | — | Elevated surface |
| 10 | `oklch(14% 0.012 260)` | — | Page background |
| 11 | `oklch(10% 0.010 260)` | — | Deep surface |
| 12 | `oklch(06% 0.008 260)` | — | Near-black |

Map steps to tokens (`background`, `card`, `muted`, `border`, `foreground`, …). Maintain a **dedicated dark ramp**, not only inverted lightness.

#### 3.2.2 Status colors (fixed)

| Status | OKLCH | Usage |
| --- | --- | --- |
| Success | `oklch(62% 0.17 150)` | Posted, paid, completed |
| Warning | `oklch(75% 0.16 75)` | Pending approval, attention |
| Destructive | `oklch(58% 0.22 25)` | Errors, blockers, irreversible |
| Info | `oklch(62% 0.14 240)` | Tips, neutral announcements |

#### 3.2.3 Domain colors (fixed, ERP modules)

**Not** tenant-configurable—keeps module identity consistent across customers.

| Module | OKLCH (reference) | Notes |
| --- | --- | --- |
| Finance / GL | `oklch(58% 0.17 155)` | Emerald — money, fiscal |
| Inventory | `oklch(58% 0.15 230)` | Blue — stock, logistics |
| HR | `oklch(55% 0.18 290)` | Violet — people |
| Sales | `oklch(65% 0.17 55)` | Orange — pipeline, revenue |
| Manufacturing | `oklch(70% 0.16 75)` | Amber — orders, shop floor |
| Projects | `oklch(55% 0.17 265)` | Indigo — planning, WIP |
| Reporting / BI | `oklch(58% 0.14 175)` | Teal — analytics |
| Master data | `oklch(62% 0.19 15)` | Rose — items, customers, shared refs |

Use mainly for **accent bars**, **badges**, **progress** in that module—not for full-page fills.

#### 3.2.4 Brand (tenant-configurable defaults)

Primary, secondary, accent defaults and gradient rules: [**Brand guidelines**](./BRAND_GUIDELINES.md) §2. Expose as `--primary`, `--secondary`, `--accent`, gradient stops.

### 3.3 Color usage rules

1. **Primary** — interactive controls and brand (links, primary button, focus ring).
2. **Domain colors** — accent bar, subtle tints (~10% opacity), module-scoped progress—not full-card gradients.
3. **Status** — alerts, badges, inline validation.
4. **Neutrals** — canvas, text, borders.
5. **No color without meaning** — if it isn’t module, status, or interaction, use neutral.

---

## 4. Typography

### 4.1 Font

**Geist Variable** (`@fontsource-variable/geist`) — single family for UI and headings; differentiate with **weight** and **tracking**, not multiple families. See [Brand guidelines](./BRAND_GUIDELINES.md) §3.

### 4.2 Type scale

Major third ratio (~**1.25**), suited to data-heavy screens.

| Token / step | Size | Line height | Weight | Tracking | Usage |
| --- | --- | --- | --- | --- | --- |
| `xs` | 0.75rem | 1rem | 400 | normal | Captions, table meta |
| `sm` | 0.875rem | 1.25rem | 400 | normal | Labels, secondary |
| `base` | 1rem | 1.5rem | 400 | normal | Body, table cells |
| `lg` | 1.125rem | 1.75rem | 500 | normal | Lead sentences |
| `xl` | 1.25rem | 1.75rem | 600 | −0.01em | Section titles |
| `2xl` | 1.5rem | 2rem | 600 | −0.02em | Page sections |
| `3xl` | 1.875rem | 2.25rem | 600 | −0.025em | Page title |
| `4xl` | 2.25rem | 2.5rem | 700 | −0.03em | Hero / marketing |

### 4.3 Rules

1. Headings: **600–700** with tighter tracking for an editorial feel.
2. Body: **400**, normal tracking; long copy **45–75 characters** per line where possible (`max-w-prose` or column width).
3. Labels / nav: **500** where helpful.
4. **≤3 weights** on one screen when possible.
5. Align token names with your Tailwind theme when you add one.

---

## 5. Spacing and layout

### 5.1 Spacing scale

**4px** base (Tailwind-aligned): **4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80** (px). Use consistent steps for vertical rhythm in forms and lists.

### 5.2 Shell (reference)

```
Desktop:
┌──────────────────────────────────────────┐
│ App header (sticky, ~56px)               │
├──────────┬───────────────────────────────┤
│ Sidebar  │ Main content                  │
│ (wide or │ max-width container / fluid   │
│ narrow)  │ padding ~24px                 │
│          │ PageHeader → tables / forms   │
└──────────┴───────────────────────────────┘
```

Adapt to your navigation model; keep **one** consistent content padding.

### 5.3 Border radius

Drive from **`--radius`** (tenant/admin configurable in future). Multiplication-based derivation (not subtraction):

| Token | Formula | Usage |
| --- | --- | --- |
| `sm` | `calc(var(--radius) * 0.75)` | Chips, small controls |
| `md` | `calc(var(--radius) * 0.875)` | Inputs, buttons |
| `lg` | `var(--radius)` | Cards (base) |
| `xl` | `calc(var(--radius) * 1.5)` | Modals, large panels |
| `2xl` | `calc(var(--radius) * 2)` | Hero surfaces |

---

## 6. Elevation and depth

Depth comes from **shadows** and **borders**, not from gradient fills.

### 6.1 Shadow scale (reference)

| Token | Usage |
| --- | --- |
| `xs` | Inputs, subtle lift |
| `sm` | Default cards |
| `md` | Hovered cards, menus |
| `lg` | Modals, popovers |
| `xl` | Floating panels |

Example layered shadow (OKLCH black ink):

```css
/* Reference values — map to --shadow-sm, --shadow-md in theme */
.shadow-sm {
  box-shadow:
    0 1px 3px oklch(0% 0 0 / 0.08),
    0 1px 2px oklch(0% 0 0 / 0.04);
}
```

**Interactive cards:** transition `shadow-sm` → `shadow-md` on hover ([Brand guidelines](./BRAND_GUIDELINES.md) §5).

---

## 7. Motion and animation

### 7.1 Timing

| Token | Duration | Use |
| --- | --- | --- |
| `--duration-fast` | 100ms | Color, opacity |
| `--duration-normal` | 200ms | Shadows, small moves |
| `--duration-slow` | 350ms | Large transitions, emphasis |

### 7.2 Easing

| Token | Curve | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Exits, default |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` | Bidirectional |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Rare celebratory UI |

### 7.3 Principles

1. **Purpose** — motion explains state; it isn’t decoration.
2. **Duration matches weight** — small interactions faster; rare emphasis slower.
3. **`prefers-reduced-motion: reduce`** — provide non-animated equivalent (instant state change or opacity only).
4. **Consistency** — same interaction, same timing.

### 7.4 Patterns (when using Tailwind)

| Pattern | Example | When |
| --- | --- | --- |
| Button press | `active:scale-[0.98]` | Primary actions |
| Card hover | shadow sm → md | Clickable cards |
| Focus | `focus-visible:ring-2 ring-ring ring-offset-2` | All interactive |
| Entrance | opacity / translate, ~200ms | Page sections |
| Loading | skeleton shimmer, neutral | Table load |

---

## 8. Visual signature

Five elements that define Afenda ERP UI (aligns with [Brand guidelines](./BRAND_GUIDELINES.md) §5):

1. **Domain accent bar** — 3px left border, module color ([§3.2.3](#3-color-system)).
2. **Premium elevation** — layered shadows; hover increases elevation.
3. **Solid primary action** — `bg-primary`, no gradient on buttons.
4. **Brand moment** — primary → secondary gradient **only** on logo mark and hero ([Brand guidelines](./BRAND_GUIDELINES.md) §4).
5. **Warm neutral canvas** — not pure #fff; slight warm gray ([§3.2.1](#3-color-system)).

---

## 9. Component patterns

Illustrative **Tailwind-style** classes—adapt to your token names.

### 9.1 Cards

- Base: `rounded-lg border border-border bg-card shadow-sm`
- Domain: add `border-l-[3px] border-l-<domain-token>`
- Interactive: `transition-shadow hover:shadow-md cursor-pointer`
- Never: full-card gradient backgrounds

### 9.2 Buttons

- Primary: `bg-primary text-primary-foreground`
- Secondary: `bg-secondary text-secondary-foreground`
- Ghost: `hover:bg-accent` for toolbars
- `active:scale-[0.98]`, visible **focus** ring on keyboard

### 9.3 Page headers

- **Hero:** brand gradient rules in [Brand guidelines](./BRAND_GUIDELINES.md) §4—no decorative blur blobs.
- **Compact:** card-like; optional domain accent.

### 9.4 Progress

Solid fills—domain color for module-specific bars; **primary** for generic.

### 9.5 Stat / KPI tiles

Domain accent + icon on **muted domain tint** (~10% opacity)—no gradient header strip.

---

## 10. Tenant branding

Configurable **per organization** (when admin/settings exist)—**defaults** below. Implementation may inject CSS variables (e.g. from hex → OKLCH via **culori** or similar) on `document.documentElement`; until then, use static tokens from [Brand guidelines](./BRAND_GUIDELINES.md).

| Property | Typical control | Effect |
| --- | --- | --- |
| Primary / secondary / accent | Hex | Buttons, links, gradient endpoints |
| Neutral warmth | cool / neutral / warm | Shifts neutral ramp |
| Surface style | flat / elevated | Shadow treatment |
| Radius | sm / md / lg / xl | Maps to `--radius` scale |
| Font | dm-sans, system, … | Body + headings |
| Density | compact / default / comfortable | Spacing multiplier |
| Brand gradient | on / off | Logo + hero only if on |
| Logo / favicon URL | URL | Per [Brand guidelines](./BRAND_GUIDELINES.md) §1 |

**Domain colors** ([§3.2.3](#3-color-system)) stay fixed so modules stay recognizable across tenants.

Optional **presets** (Default, Corporate blue, Monochrome, …) can ship as named token bundles—product decision.

---

## 11. Anti-patterns

1. **Gradient abuse** — not on buttons, cards, progress, or icons; only brand moments ([Brand guidelines](./BRAND_GUIDELINES.md) §4).
2. **Decorative blur blobs** — large blurred gradients as background chrome; reads as generic AI UI.
3. **Hardcoded hex in components** — bypasses theme and tenant branding; use tokens.
4. **Everything emphasized** — competing gradients and heavy shadows on one screen.
5. **Invalid utilities** — e.g. `bg-linear-to-r` (not valid Tailwind); use `bg-gradient-to-r` or solids.

---

## 12. Accessibility

- **Contrast:** ≥ **4.5:1** normal text; ≥ **3:1** large text (18px+ or 14px+ bold) and key UI chrome.
- **Focus:** visible rings on all interactive elements; logical tab order; skip links where needed.
- **Motion:** respect `prefers-reduced-motion: reduce`; keep state changes perceptible without motion-only cues.
- **Semantics:** correct heading order, labels on icon-only controls, roles on custom widgets.

---

## Related docs

- [Brand guidelines](./BRAND_GUIDELINES.md) — Logo, gradient, typography summary
- [Components and styling](./COMPONENTS_AND_STYLING.md) — Codebase patterns, stack
- [shadcn/ui](./dependencies/shadcn-ui.md) — primitives path, `cn()`, forms, theming when Tailwind/shadcn are added
- [Performance](./PERFORMANCE.md) — Lists, re-renders, bundle size
