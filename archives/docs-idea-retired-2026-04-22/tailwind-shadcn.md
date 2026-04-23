Here is a consolidated reference. **Sources:** Context7 (`/websites/tailwindcss`, `/websites/ui_shadcn`), the [shadcn skill](file:///c:/NexusCanon/afenda-react-vite/.agents/skills/shadcn/SKILL.md) (semantic tokens + Tailwind v4 `@theme inline`), and your package’s generated [`bridge.css`](c:\NexusCanon\afenda-react-vite\packages\shadcn-ui\src\afenda-design-system\afenda-design-css\bridge.css) / [`tokens.css`](c:\NexusCanon\afenda-react-vite\packages\shadcn-ui\src\afenda-design-system\afenda-design-css\tokens.css) for **Afenda** extensions.

---

## shadcn + Tailwind CSS v4 — token & mapping reference

### 1. How the layers connect

| Layer                     | Role                                                         | Example                                                      |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **CSS custom properties** | Actual values; light in `:root`, dark in `.dark`             | `--background: oklch(...)`                                   |
| **`@theme inline`**       | Registers Tailwind v4 **theme variables** so utilities exist | `--color-background: var(--background)`                      |
| **Utilities**             | What you type in markup                                      | `bg-background`, `text-foreground`, `rounded-lg`             |
| **Dark variant**          | shadcn v4 commonly uses a custom dark selector               | `@custom-variant dark (&:is(.dark *));` then `dark:bg-muted` |

---

### 2. Tailwind v4 — theme variable **namespaces** (framework defaults)

These are the main `--*` prefixes Tailwind uses; each namespace drives matching utilities (see [Theme variables](https://tailwindcss.com/docs/theme)).

| Namespace                 | Examples                                                     | Typical utilities                                               |
| ------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- |
| `--font-*`                | `--font-sans`, `--font-serif`, `--font-mono`                 | `font-sans`, `font-mono`, …                                     |
| `--color-*`               | `--color-red-500`, `--color-background` (when you define it) | `bg-*`, `text-*`, `border-*`, `fill-*`, `stroke-*`, `ring-*`, … |
| `--text-*`                | Font sizes                                                   | `text-sm`, `text-base`, …                                       |
| `--font-weight-*`         | Weights                                                      | `font-medium`, …                                                |
| `--tracking-*`            | Letter-spacing                                               | `tracking-tight`, …                                             |
| `--leading-*`             | Line-height                                                  | `leading-normal`, …                                             |
| `--breakpoint-*`          | Custom breakpoints                                           | `3xl:*`, …                                                      |
| `--radius-*`              | Radii                                                        | `rounded-sm`, `rounded-lg`, …                                   |
| `--shadow-*`              | Box shadows                                                  | `shadow-sm`, …                                                  |
| `--spacing-*`             | Spacing scale                                                | `p-*`, `m-*`, `gap-*`, `w-*`, …                                 |
| `--ease-*`, `--animate-*` | Transitions / animations                                     | `ease-in-out`, `animate-spin`, …                                |

Default palette fonts (from Tailwind’s default `theme.css`) include `--font-sans`, `--font-serif`, `--font-mono` with system stacks.

---

### 3. Stock shadcn (Tailwind v4 manual) — **`:root` / `.dark` semantic variables**

These are the canonical **unprefixed** names shadcn documents (values are OKLCH in current defaults). They are the **source** for `@theme inline`.

| CSS variable                   | Typical role                                    |
| ------------------------------ | ----------------------------------------------- |
| `--radius`                     | Base radius; scaled by `--radius-*` in `@theme` |
| `--background`                 | Page / app background                           |
| `--foreground`                 | Default text                                    |
| `--card`                       | Card surface                                    |
| `--card-foreground`            | Text on card                                    |
| `--popover`                    | Popover / dropdown surface                      |
| `--popover-foreground`         | Text on popover                                 |
| `--primary`                    | Primary actions                                 |
| `--primary-foreground`         | Text/icons on primary                           |
| `--secondary`                  | Secondary actions                               |
| `--secondary-foreground`       | Text on secondary                               |
| `--muted`                      | Muted surfaces                                  |
| `--muted-foreground`           | Muted text                                      |
| `--accent`                     | Accent surfaces                                 |
| `--accent-foreground`          | Text on accent                                  |
| `--destructive`                | Danger/error actions                            |
| `--destructive-foreground`     | Text on destructive (when exposed in theme)     |
| `--border`                     | Default borders                                 |
| `--input`                      | Input borders                                   |
| `--ring`                       | Focus rings                                     |
| `--chart-1` … `--chart-5`      | Chart series colors                             |
| `--sidebar`                    | Sidebar background                              |
| `--sidebar-foreground`         | Sidebar text                                    |
| `--sidebar-primary`            | Sidebar primary                                 |
| `--sidebar-primary-foreground` | Text on sidebar primary                         |
| `--sidebar-accent`             | Sidebar accent                                  |
| `--sidebar-accent-foreground`  | Text on sidebar accent                          |
| `--sidebar-border`             | Sidebar border                                  |
| `--sidebar-ring`               | Sidebar focus ring                              |

Same keys are **overridden** under `.dark { ... }` for dark mode.

---

### 4. Stock shadcn — **`@theme inline` → Tailwind theme variable → utility**

Pattern: **`--color-<token>`** in `@theme inline` maps to utilities like **`bg-<token>`**, **`text-<token>`**, **`border-<token>`**, **`ring-<token>`**, **`fill-<token>`**, etc.

| `@theme inline` (theme var)           | Binds to                            | Example utilities                     |
| ------------------------------------- | ----------------------------------- | ------------------------------------- |
| `--color-background`                  | `var(--background)`                 | `bg-background`, `text-background`, … |
| `--color-foreground`                  | `var(--foreground)`                 | `text-foreground`, …                  |
| `--color-card`                        | `var(--card)`                       | `bg-card`, `border-card`, …           |
| `--color-card-foreground`             | `var(--card-foreground)`            | `text-card-foreground`                |
| `--color-popover`                     | `var(--popover)`                    | `bg-popover`                          |
| `--color-popover-foreground`          | `var(--popover-foreground)`         | `text-popover-foreground`             |
| `--color-primary`                     | `var(--primary)`                    | `bg-primary`                          |
| `--color-primary-foreground`          | `var(--primary-foreground)`         | `text-primary-foreground`             |
| `--color-secondary`                   | `var(--secondary)`                  | `bg-secondary`                        |
| `--color-secondary-foreground`        | `var(--secondary-foreground)`       | `text-secondary-foreground`           |
| `--color-muted`                       | `var(--muted)`                      | `bg-muted`                            |
| `--color-muted-foreground`            | `var(--muted-foreground)`           | `text-muted-foreground`               |
| `--color-accent`                      | `var(--accent)`                     | `bg-accent`                           |
| `--color-accent-foreground`           | `var(--accent-foreground)`          | `text-accent-foreground`              |
| `--color-destructive`                 | `var(--destructive)`                | `bg-destructive`                      |
| `--color-destructive-foreground`      | `var(--destructive-foreground)`     | `text-destructive-foreground`         |
| `--color-border`                      | `var(--border)`                     | `border-border`                       |
| `--color-input`                       | `var(--input)`                      | `border-input`                        |
| `--color-ring`                        | `var(--ring)`                       | `ring-ring`                           |
| `--color-chart-1` … `--color-chart-5` | `var(--chart-*)`                    | `bg-chart-1`, …                       |
| `--color-sidebar`                     | `var(--sidebar)`                    | `bg-sidebar`                          |
| `--color-sidebar-foreground`          | `var(--sidebar-foreground)`         | `text-sidebar-foreground`             |
| `--color-sidebar-primary`             | `var(--sidebar-primary)`            | `bg-sidebar-primary`                  |
| `--color-sidebar-primary-foreground`  | `var(--sidebar-primary-foreground)` | `text-sidebar-primary-foreground`     |
| `--color-sidebar-accent`              | `var(--sidebar-accent)`             | `bg-sidebar-accent`                   |
| `--color-sidebar-accent-foreground`   | `var(--sidebar-accent-foreground)`  | `text-sidebar-accent-foreground`      |
| `--color-sidebar-border`              | `var(--sidebar-border)`             | `border-sidebar`                      |
| `--color-sidebar-ring`                | `var(--sidebar-ring)`               | `ring-sidebar-ring`                   |

**Radius** (current shadcn docs use multipliers of `--radius`):

| `@theme inline` | Maps from                                                           | Example utility |
| --------------- | ------------------------------------------------------------------- | --------------- |
| `--radius-sm`   | `calc(var(--radius) * 0.6)` (or older: `calc(var(--radius) - 4px)`) | `rounded-sm`    |
| `--radius-md`   | `calc(var(--radius) * 0.8)`                                         | `rounded-md`    |
| `--radius-lg`   | `var(--radius)`                                                     | `rounded-lg`    |
| `--radius-xl`   | `calc(var(--radius) * 1.4)`                                         | `rounded-xl`    |
| `--radius-2xl`  | `calc(var(--radius) * 1.8)`                                         | `rounded-2xl`   |
| `--radius-3xl`  | `calc(var(--radius) * 2.2)`                                         | `rounded-3xl`   |
| `--radius-4xl`  | `calc(var(--radius) * 2.6)`                                         | `rounded-4xl`   |

**Fonts:** If you do not remap them in `@theme`, **`font-sans` / `font-mono`** come from Tailwind’s default `--font-sans` / `--font-mono`. To tie them to your own CSS vars, use e.g. `--font-sans: var(--font-family-sans);` inside `@theme` / `@theme inline` (as in your Afenda bridge).

---

### 5. “Semantics” / naming (shadcn skill)

| Idea                | Meaning                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Semantic tokens** | `--background`, `--primary`, `text-muted-foreground` — describe **role**, not raw hue                                                                     |
| **Avoid**           | `bg-blue-500` for product chrome; prefer **semantic** utilities                                                                                           |
| **Custom tokens**   | Define `--warning` in `:root` / `.dark`, then `--color-warning: var(--warning)` in `@theme inline` ([shadcn theming](https://ui.shadcn.com/docs/theming)) |

---

### 6. Variants — two different meanings

**A) Tailwind variants** (prefixes): `hover:`, `focus:`, `active:`, `disabled:`, `dark:`, `md:`, `lg:`, `data-*`, `group-*`, `peer-*`, arbitrary `[&_…]:`, etc.

**B) shadcn **component** `variant` props** (not CSS variables): e.g. `Button` — `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`; `Badge` — `default`, `secondary`, `destructive`, `outline`; overlays use **Radix**-style APIs. The skill tells you to prefer these **before** custom classes.

**C) Custom dark variant** (CSS):
`@custom-variant dark (&:is(.dark *));`
so `dark:` matches when an ancestor has `.dark` (matches shadcn’s pattern).

---

### 7. Afenda `@afenda/shadcn-ui-deprecated` — extra **`:root` variables** (abridged)

Your generated `tokens.css` adds **raw** and **semantic** layers, e.g. `--foreground-default`, `--brand-*`, `--warning-*`, `--success-*`, `--info-*`, `--destructive-*` scales, `--surface-*`, `--row-hover`, `--focus-ring-*`, `--selection-*`, `--disabled-*`, `--chart-6`…`--chart-10`, `--shadow-*`, etc.

**`bridge.css`** exposes them to Tailwind as **`--color-*`** (and `--font-sans` / `--font-mono`, `--radius-*`) so you get utilities like `text-foreground-default`, `bg-brand`, `bg-warning-subtle`, `border-border-control`, …

**Note:** Generated `bridge.css` maps shadow scale tokens to the **`--shadow-*`** theme namespace (`shadow-xs` … `shadow-xl`) so Tailwind `shadow-*` utilities resolve correctly. See `bridgeThemeVariableLine` in the token pipeline.

---

### 8. Official doc links

| Topic                                         | URL                                            |
| --------------------------------------------- | ---------------------------------------------- |
| Tailwind v4 theme / namespaces                | https://tailwindcss.com/docs/theme             |
| shadcn manual (Tailwind v4 + `@theme inline`) | https://ui.shadcn.com/docs/installation/manual |
| shadcn Tailwind v4 migration                  | https://ui.shadcn.com/docs/tailwind-v4         |
| shadcn theming                                | https://ui.shadcn.com/docs/theming             |

---

**Summary:** Stock shadcn is **`:root` / `.dark` variables** + **`@theme inline`** `--color-*` and `--radius-*` wiring. Tailwind v4 adds **namespace rules** (`--font-*`, `--color-*`, `--shadow-*`, …). Your **Afenda** package extends that with many more **`--color-*`** registrations in generated `bridge.css`.

---

## Global Default Token Policy (AFENDA canon)

Stable reference for the **package-global default layer** only. No feature truth, domain semantics, or workflow-local styling.

### Purpose

This policy governs the global default design token layer: which families are product-wide defaults, which names exist for **framework compatibility** (shadcn/Tailwind), how keys are classified, and how CSS is emitted.

### Scope

**In scope:** `token-constants.ts`, `token-contract.ts`, `raw-token-group-rules.ts`, `semantic-token-group-rules.ts`, `token-layer-boundary.ts`, `token-source.ts`, generated `tokens.css`, `bridge.css`, package-global `base.css`.

**Out of scope:** feature-specific semantics, business truth states, workflow styling, page/module-local visual vocabularies.

### Layer model

| Layer                    | Meaning                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Canonical default**    | AFENDA-owned, reusable defaults (typography, radius, surfaces, brand ladders, feedback, interaction, charts, shadows).                                          |
| **Bridge (policy term)** | Framework **compatibility vocabulary** — stock shadcn semantic names (`primary`, `card`, `sidebar-*`, …). In TypeScript we label this **`compat`** (see below). |
| **Forbidden**            | Any key not classified by raw + semantic rules in the pipeline.                                                                                                 |

### Naming: policy “bridge” vs `TokenDefinition.bridge`

- **Policy / docs “bridge”** = shadcn baseline **semantic** names (compatibility projection).
- **`TokenDefinition.bridge` in code** = whether a key is exposed for Tailwind / `@theme` tooling (includes many **raw** primitives). These are different concepts.
- **`TokenKeyAuthority` in code** uses `canonical` \| **`compat`** \| `forbidden` so `compat` matches this policy’s “bridge” vocabulary without colliding with `definition.bridge`.

### Classification (implemented, derived — no duplicated matrix)

Authoritative key sets remain in **`token-contract.ts`** and the raw/semantic matchers. **`classifyTokenKeyAuthority`** in `packages/shadcn-ui-deprecated` derives:

- **Raw** keys → `canonical`
- **Semantic** keys matching **shadcn baseline** (`SHADCN_BASELINE_SEMANTIC_PATTERN`) → **`compat`**
- **Other semantic** keys (shell, interaction, text, overlay, …) → `canonical`
- **Neither** → `forbidden`

Shared names such as `background` / `foreground` are **semantic** and shadcn-baseline–shaped → **`compat`**. Raw ladders (`foreground-default`, `brand-default`, …) stay **`canonical`**. No duplicate “matrix” list is maintained in TypeScript.

Module load calls **`assertPackageTokenAuthority(PACKAGE_TOKEN_KEYS)`** after existing boundary asserts.

### Canonical families (reference matrices)

Keys below are **human canon** for reviews; the **source of truth** for enforcement is still `token-contract.ts` + generated keys from `token-source.ts`.

**Typography (required):** `font-family-sans`, `font-family-mono`

**Radius:** `radius` (required); derived `@theme` / bridge: `radius-sm` … `radius-4xl` (via `BRIDGE_CUSTOM_MAPPINGS` + generated bridge)

**Foundation / surface / border / brand / feedback / interaction / chart / shadow:** align with `MUST_HAVE_RAW_TOKEN_KEYS`, `MUST_HAVE_SEMANTIC_TOKEN_KEYS`, and optional `SHOULD_HAVE_*` in `token-contract.ts` — including surfaces (`surface`, `surface-raised`, …), borders (`border-default`, …), brand scales, status scales, `chart-1`…`chart-10`, `shadow-xs`…`shadow-xl`, interaction (`row-hover`, `focus-ring-*`, …).

### Bridge compatibility list (shadcn-shaped semantics)

Approved **semantic** names for stock shadcn/Tailwind expectations (each classifies as **`compat`** when matched by `SHADCN_BASELINE_SEMANTIC_PATTERN`):

`background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `warning`, `warning-foreground`, `success`, `success-foreground`, `info`, `info-foreground`, `border`, `input`, `ring`, `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-border`, `sidebar-ring`

### Emission rules

| Artifact         | Owns                                                                                                                                                |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`tokens.css`** | Unprefixed CSS custom properties; light/dark values; no Tailwind namespace projection.                                                              |
| **`bridge.css`** | `@theme inline` projections: `--font-*`, `--radius-*`, `--color-*` for color utilities; **`--shadow-*`** for shadow scale (not `--color-shadow-*`). |
| **`base.css`**   | Consumes global defaults and platform helpers; no domain semantics.                                                                                 |

### Validation

Build / module load fails when: contract keys are missing, raw/semantic coverage fails, layer boundary has unknown keys, or token authority sees **forbidden** keys. CI may additionally run `pnpm --filter @afenda/shadcn-ui-deprecated test:run` and `tokens:check` where applicable.

### Open verification

1. **Shadow namespace:** resolved — generator emits `--shadow-xs` … `--shadow-xl` via `bridgeThemeVariableLine` (see [`bridge/bridge-theme-line.ts`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-token-source/bridge/bridge-theme-line.ts)).
2. **Compatibility aliases:** keeping `primary` / `secondary` / `accent` as shadcn compatibility is intentional unless you migrate call sites to stricter Afenda-only names.

### Code references

| File                                                                                                                                                                      | Role                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [`authority/token-key-authority.ts`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-token-source/authority/token-key-authority.ts)                   | `TokenKeyAuthority` labels                                         |
| [`authority/classify-token-key-authority.ts`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-token-source/authority/classify-token-key-authority.ts) | Derived classifier                                                 |
| [`authority/assert-token-key-authority.ts`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-token-source/authority/assert-token-key-authority.ts)     | `assertPackageTokenAuthority`                                      |
| [`canonical/token-source.ts`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-token-source/canonical/token-source.ts)                                 | Assert wired after boundary + bridge coverage                      |
| [`governance.ts`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-token-source/governance.ts)                                                         | Public exports: authority + classifier + `bridgeThemeVariableLine` |
| [`bridge/bridge-theme-line.ts`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-token-source/bridge/bridge-theme-line.ts)                             | `@theme` line shape per token key                                  |

**Package import:** `@afenda/shadcn-ui-deprecated/design-tokens/governance` (see `package.json` exports). Includes **`getTokenAuthorityEntries`** / **`serializeTokenAuthorityJson`** for stable, sorted snapshots (CI or artifacts).

---

## Skills evaluation — shadcn + Tailwind v4 parity

Aligned with the **shadcn** skill (semantic tokens, `@theme inline`, v4) and **Tailwind** theme namespaces (`--color-*`, `--radius-*`, `--shadow-*`, `--font-*`).

### Stock shadcn manual (`@theme inline`)

Official install maps **colors** to `--color-*`, **chart-1…5**, the **sidebar** token family, and **radius-sm…4xl** (see [shadcn installation manual](https://ui.shadcn.com/docs/installation/manual)). Afenda keeps those names in **`SHADCN_V4_MANUAL_THEME_COLOR_KEYS`** and **`SHADCN_V4_MANUAL_THEME_RADIUS_KEYS`** in [`parity/shadcn-theme-parity.ts`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-token-source/parity/shadcn-theme-parity.ts); Vitest asserts they remain present in `PACKAGE_TOKEN_KEYS` / `BRIDGE_CUSTOM_MAPPINGS`.

### Afenda extensions (beyond minimal stock)

| Area             | Examples                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------- |
| Status semantics | `warning`, `success`, `info` (+ `-foreground`); raw ladders (`*-default`, `*-subtle`, …) |
| Shell            | `surface*`, interaction (`row-hover`, `focus-ring-*`, …)                                 |
| Charts           | `chart-6` … `chart-10` in addition to stock `chart-1` … `chart-5`                        |
| Bridge           | `color-brand`, `--shadow-*` namespace for shadow scale                                   |

Listed in **`AFENDA_EXTENDED_GLOBAL_TOKEN_KEYS`** (same module).

### Component variants → token utilities (governed)

| Component  | Variants / notes                                                                                             | Typical token-backed utilities                                                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Button** | `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`                                            | `bg-primary`, `text-primary-foreground`, `border-input`, …                                                                                                |
| **Badge**  | `default`, `secondary`, `outline`, `success`, `warning`, `destructive`, `info` + emphasis `subtle` / `solid` | Maps to `toneClassMap` in [`tone.ts`](../../packages/shadcn-ui-deprecated/src/lib/constant/semantic/tone.ts) (`bg-success`, `text-success-foreground`, …) |
| **Alert**  | `default`, `destructive`, …                                                                                  | Uses semantic `bg-*` / `text-*` for status                                                                                                                |

**Rule (shadcn skill):** prefer **semantic** utilities (`bg-destructive`, `text-muted-foreground`) over raw palette classes (`bg-red-500`).

### Gaps intentionally not duplicated as CSS tokens

| Topic                        | Notes                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Per-component-only props** | `size`, `variant` on Button/Badge are **not** global CSS variables — they live under `lib/constant/component/*`.                                        |
| **`font-serif`**             | Wired: `--font-family-serif` in `tokens.css`, `--font-serif` in `bridge.css` (`TAILWIND_V4_FONT_BRIDGE_KEYS`).                                          |
| **Registry `cssVars`**       | shadcn registry blocks may declare extra `cssVars` for one-off components — keep out of global `token-source` unless promoted to package-global policy. |
