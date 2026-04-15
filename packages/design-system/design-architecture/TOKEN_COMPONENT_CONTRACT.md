# AFENDA — Token → Component Contract

**Status:** Normative — this is the **contract** between design tokens and UI implementation.  
**Scope:** `packages/design-system/design-architecture/src/theme/` (`theme-tokens-layout.css`, `theme-density.css`, color themes) and consumers (`apps/web`, `ui-primitives`).

**Rules:** Language below uses RFC-style **MUST** / **MUST NOT** / **SHOULD** for implementers.

---

## Authority

| Layer                                  | Source of truth                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Color (light/dark)                     | `theme-tokens-light.css`, `theme-dark.css` — `--color-*`                                                |
| Layout, type, motion, spacing (static) | `theme-tokens-layout.css` — `@theme static`                                                             |
| Density (runtime)                      | `theme-density.css` — `:root`, `[data-density=*]`                                                       |
| shadcn variable names                  | `theme-shadcn-compat.css` — aliases into `--color-*`                                                    |
| AFENDA extensions (`--af-*`)           | `theme-afenda-extensions.css` — shell/status/density/motion aliases only (not mixed into shadcn compat) |

Semantic UI **MUST** use these tokens (or Tailwind theme keys bound to them). **MUST NOT** introduce ad hoc hex, raw `px` spacing scales, or one-off control heights for shell-grade UI.

### Token inventory (manual QA)

Cross-checked **2026-04-14**: every `--*` name referenced in sections 1–10 exists in the repo.

| Concern                                          | Files                                             |
| ------------------------------------------------ | ------------------------------------------------- |
| Color semantics (cards, surfaces, tables)        | `theme-tokens-light.css`, `theme-dark.css`        |
| Radii, type, spacing, static sizes, motion names | `theme-tokens-layout.css` (`@theme static`)       |
| Density / runtime scale                          | `theme-density.css` (`:root`, `[data-density=*]`) |

**Import order (canonical):** `theme-tokens-light.css` → `theme-dark.css` → `theme-keyframes.css` → `theme-reduced-motion.css` (`.motion-safe` / `prefers-reduced-motion` only; keyframes stay pure) → `theme-tokens-layout.css` → `theme-density.css` → `theme-shadcn-compat.css` (shadcn + semantic bridge only) → `theme-afenda-extensions.css` (`--af-*` only) (see `src/theme/theme.css` and app `index.css` / `local.css`). Density is loaded **before** AFENDA extensions so `--size-*` / `--spacing-*` resolve to effective runtime values inside `--af-*` aliases.

**Layering rule:** `theme-shadcn-compat.css` MUST NOT define `--af-*`. `theme-afenda-extensions.css` MUST NOT redefine shadcn names (`--background`, `--card`, …). See file headers for recommended use and cautions.

**Bridge architecture:** The shadcn compatibility layer stays a minimal, honest mapping to canonical `--color-*`. AFENDA extension aliases (`--af-*`) live in `theme-afenda-extensions.css` so richer product semantics do not pollute the compatibility contract. Extension aliases that mirror selection/code **MUST** stay in sync with canonical tokens: if `--color-selection`, `--color-selection-foreground`, `--color-code`, `--color-code-foreground`, `--color-code-highlight`, or `--color-code-number` are removed from `theme-tokens-light.css` / `theme-dark.css`, the corresponding `--af-selection-*` / `--af-code-*` lines MUST be removed from extensions.

---

## 1. Button system

### 1.1 Sizes

| Variant        | Height              | Font size      | Horizontal padding                                     | Radius        |
| -------------- | ------------------- | -------------- | ------------------------------------------------------ | ------------- |
| `xs`           | `--size-control-xs` | `--text-ui-xs` | `--spacing-compact-3` (0.5rem)                         | `--radius-sm` |
| `sm`           | `--size-control-sm` | `--text-ui-sm` | `--spacing-compact-4` (0.75rem)                        | `--radius-md` |
| `md` (default) | `--size-control-md` | `--text-ui-sm` | `--spacing-compact-6` (1rem)                           | `--radius-md` |
| `lg`           | `--size-control-lg` | `--text-ui-md` | `--spacing-compact-6` + optional `--spacing-compact-2` | `--radius-lg` |

### 1.2 Rules

- **MUST** set height via `var(--size-control-*)` (or Tailwind equivalent bound to those variables).
- **MUST NOT** use fixed Tailwind heights such as `h-9`, `h-10`, `h-11` for shell buttons unless they are proven equal to a token (they usually are not across density).
- **MUST** use `--text-ui-*` for label text inside buttons; **MUST NOT** use `text-base` / `text-lg` for button labels.

---

## 2. Input / form controls

### 2.1 Sizes

| Element    | Height                                                             | Font           | Line-height      |
| ---------- | ------------------------------------------------------------------ | -------------- | ---------------- |
| `input`    | `--size-control-md` (alias: `--size-input-height` in layout theme) | `--text-ui-sm` | `--leading-ui`   |
| `textarea` | min height `--size-control-lg`                                     | `--text-ui-sm` | `--leading-body` |
| `select`   | `--size-control-md`                                                | `--text-ui-sm` | `--leading-ui`   |

### 2.2 Spacing

| Relationship             | Token                      |
| ------------------------ | -------------------------- |
| label → control          | `--spacing-form-gap-tight` |
| control → helper / error | `--spacing-compact-2`      |

### 2.3 Rules

- **MUST NOT** use ad hoc `py-*` pairs that fight `--size-control-*` (vertical centering should respect control height).
- **MUST NOT** override form font sizes per screen; use `--text-ui-sm` / `--text-label` as specified.

---

## 3. Table system (critical)

### 3.1 Row

| Property                       | Token                                                                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Row height                     | `--size-table-row-height` (respect `[data-density]` overrides; comfortable default from layout; compact/spacious in `theme-density.css`) |
| Row height (compact reference) | `--size-table-row-height-compact` (2rem; also applied via `[data-density="compact"]` on `--size-table-row-height`)                       |
| Font size                      | `--text-table`                                                                                                                           |
| Line-height                    | `--leading-table`                                                                                                                        |

### 3.2 Header

| Property       | Token                        |
| -------------- | ---------------------------- |
| Height         | `--size-table-header-height` |
| Font size      | `--text-label`               |
| Letter-spacing | `--tracking-label`           |

### 3.3 States (semantic color only)

| State    | Token                        |
| -------- | ---------------------------- |
| Hover    | `--color-table-row-hover`    |
| Selected | `--color-table-row-selected` |
| Stripe   | `--color-table-row-stripe`   |
| Pinned   | `--color-table-pinned`       |

### 3.4 Rules

- **MUST NOT** use `text-sm` / `text-base` on table cells; use `--text-table` (e.g. `text-(length:--text-table)` or equivalent).
- **MUST NOT** set custom row `min-height` / `h-*` outside `--size-table-row-height` (and density-documented variants).
- **MUST NOT** inline arbitrary background/text colors for row state; use the table semantic tokens above.

---

## 4. Sidebar navigation

### 4.1 Item

| Property | Token                        |
| -------- | ---------------------------- |
| Height   | `--size-sidebar-item-height` |
| Font     | `--text-ui-sm`               |
| Radius   | `--radius-md`                |

### 4.2 States

| State             | Token                      |
| ----------------- | -------------------------- |
| Hover             | `--color-surface-hover`    |
| Active / selected | `--color-surface-selected` |

### 4.3 Rules

- **MUST NOT** inflate nav items beyond `--size-sidebar-item-height` (density may scale per `theme-density.css`).
- **MUST NOT** add feature-specific nav styling in feature packages; shell owns sidebar chrome.

---

## 5. Cards / panels

### 5.1 Card

| Property   | Token                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Padding    | `--spacing-panel-padding` (dense panels may use `--spacing-panel-padding-lg` where documented) |
| Radius     | `--radius-lg`                                                                                  |
| Background | `--color-card`                                                                                 |
| Text       | `--color-card-foreground`                                                                      |

### 5.2 Section (stack inside a view)

| Property                 | Token                   |
| ------------------------ | ----------------------- |
| Gap between blocks       | `--spacing-section-gap` |
| Section title typography | `--text-section-title`  |

### 5.3 Rules

- **MUST NOT** use arbitrary `p-5`, `gap-7`, etc.; map to `--spacing-compact-*`, `--spacing-panel-padding`, or `--spacing-section-gap`.
- **MUST** avoid nested ad hoc spacing; prefer one rhythm per card.

---

## 6. Dialog / modal

### 6.1 Structure

| Part              | Token                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| Header min-height | `--size-dialog-header-min-height`                                      |
| Content padding   | `--spacing-panel-padding-lg` (or `--spacing-panel-padding` if tighter) |
| Surface radius    | `--radius-xl`                                                          |

### 6.2 Motion

| Action | Token                  |
| ------ | ---------------------- |
| Enter  | `--animate-dialog-in`  |
| Exit   | `--animate-dialog-out` |

### 6.3 Rules

- **MUST** use dialog animation tokens for Radix/dialog surfaces aligned with `theme-keyframes.css`.
- **MUST NOT** invent one-off modal padding or radii.

---

## 7. Toolbar / filters

### 7.1 Toolbar

| Property     | Token                   |
| ------------ | ----------------------- |
| Height       | `--size-toolbar-height` |
| Internal gap | `--spacing-compact-3`   |

### 7.2 Filter bar

| Property | Token                      |
| -------- | -------------------------- |
| Height   | `--size-filter-bar-height` |

---

## 8. Typography usage

| Use case          | Token                                                            |
| ----------------- | ---------------------------------------------------------------- |
| Default body (UI) | `--text-ui-md`                                                   |
| Dense UI copy     | `--text-ui-sm`                                                   |
| Labels            | `--text-label`                                                   |
| Helper / hint     | `--text-helper`                                                  |
| Table cells       | `--text-table`                                                   |
| Section title     | `--text-section-title`                                           |
| KPI / metric      | `--text-metric` (hero metrics: `--text-metric-lg` where allowed) |

### Rules

- **MUST NOT** use Tailwind `text-base`, `text-lg`, `text-xl` for product chrome without mapping to a token above.
- **MUST** pair type with line-height tokens (`--leading-ui`, `--leading-body`, `--leading-table`, etc.) where readability matters.

---

## 9. Icon system

| Role    | Token            |
| ------- | ---------------- |
| Small   | `--size-icon-sm` |
| Default | `--size-icon-md` |
| Large   | `--size-icon-lg` |

Optional extra-small chrome: `--size-icon-xs` where needed.

### Rules

- **MUST NOT** use random `size-5`, `w-4 h-4` for shell icons; use `var(--size-icon-*)` (or width/height utilities bound to those variables).

---

## 10. Spacing system (allowed families)

| Family        | Tokens                                                  |
| ------------- | ------------------------------------------------------- |
| Tight stack   | `--spacing-compact-1` … `--spacing-compact-6`           |
| Panel padding | `--spacing-panel-padding`, `--spacing-panel-padding-lg` |
| Forms         | `--spacing-form-gap`, `--spacing-form-gap-tight`        |
| Section       | `--spacing-section-gap`                                 |

### Rules

- **MUST NOT** introduce raw pixel margins for new shell layouts.
- **SHOULD** prefer compact tokens for ERP-dense screens.

---

## 11. Enforcement (recommended)

This contract is **authoritative** for code review. Automated enforcement **SHOULD** be added incrementally:

| Mechanism         | Intent                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| ESLint / ast-grep | Disallow forbidden patterns (`h-10`, `text-base` in `ui-primitives`, arbitrary colors in JSX class strings where policy applies). |
| CI                | Optional: grep or custom script for banned literals in `packages/design-system/ui-primitives`.                                    |
| Human             | PR checklist: “Uses TOKEN_COMPONENT_CONTRACT for shell components.”                                                               |

**MUST NOT** block merges solely on automation until rules are implemented; **MUST** still follow this contract in new and refactored UI.

---

## 12. Reference implementation

- Theme assembly: [`src/theme/theme.css`](src/theme/theme.css)
- Layout tokens: [`src/theme/theme-tokens-layout.css`](src/theme/theme-tokens-layout.css)
- Density: [`src/theme/theme-density.css`](src/theme/theme-density.css)
- App stylesheet entry: [`apps/web/src/index.css`](../../../apps/web/src/index.css)

---

## Changelog

| Date       | Change                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-14 | Initial Director contract aligned to `theme-tokens-layout.css` / `theme-density.css`.                                                                         |
| 2026-04-14 | QA pass: token inventory table; table compact token; documented canonical theme import order; theme entry files reordered so density overrides follow layout. |
