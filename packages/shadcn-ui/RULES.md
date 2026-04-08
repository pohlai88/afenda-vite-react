# Primitive Preservation and Anti-Drift Governance

> The system must make the correct UI easy to compose and the drifting UI hard to author.

This document is the governing doctrine for `@afenda/shadcn-ui` and all code that consumes it.
It is not advisory. Its rules are enforced by ESLint, import fences, and CI checks.

---

## Objective

**Do not** expand component coverage, build new primitives, or make wrappers more feature-rich.

**Do** preserve the default primitive system exactly enough that downstream components stay
consistent, governed, and resistant to drift.

The problem is not missing primitives. The problem is that every time teams touch final composed
components, they re-interpret the primitive layer and introduce visual, semantic, and behavioral
drift.

---

## The 4-Layer Architecture

Every UI element in Afenda passes through exactly 4 layers. Each layer has a single
responsibility and a hard boundary. Drift happens when a layer exceeds its responsibility.

```
Layer 1  →  Layer 2  →  Layer 3  →  Layer 4
Primitive    Governed     Semantic    Final
Canon        Semantic     Resolver    Components
             Constants
```

### Layer 1 — Primitive Canon

**Path:** `packages/shadcn-ui/src/components/ui/`

**What it is:** Vendor canon. Copied shadcn/ui primitives with Radix behavior, CVA variants, and
token-based theming. Treat these files like vendor code.

**Preservation rules:**

- Must stay structurally close to the shadcn/ui source copy
- No raw Tailwind palette colors (`bg-red-500`, `text-blue-300`)
- No extra CVA variants unless they are canonized in `src/lib/constant/component/`
- No feature-specific logic, domain terms, or business conditions
- No replacing default slots with custom structures
- `data-slot` attributes must be preserved exactly as copied
- `className` + `cn()` composition pattern is mandatory for all className output
- `asChild` via Radix `Slot` where appropriate — never reimplemented manually
- React 19 ref-as-prop pattern: no new `React.forwardRef`, no `displayName` in new code
- All Radix accessibility behavior (`aria-*`, `role`, focus management) must be preserved

**Existing enforcement:**

- ESLint `afenda-ui/no-raw-colors` — catches raw palette classes
- ESLint `afenda-ui/semantic-token-allowlist` — catches non-allowlisted color stems
- ESLint `no-restricted-imports` — blocks `@radix-ui/react-*` and `class-variance-authority`
  outside this package

---

### Layer 2 — Governed Semantic Constants

**Path:** `packages/shadcn-ui/src/lib/constant/`

**What it is:** The single source of truth for all UI semantic meaning. Tone, emphasis, density,
radius, elevation, surface, status, intent, severity — declared once, reused everywhere.

**Preservation rules:**

- Semantic meaning is declared once in this package — never recreated in feature code
- Each constant family fits Tier 1 (simple registry) or Tier 2 (governed system) from
  `docs/SEMANTIC_GOVERNANCE_ARCHITECTURE.md`
- `satisfies` governs authored truth — Zod governs runtime trust — CI governs repo behavior
- No ad hoc semantic maps recreated in components or features (enforced by ESLint + ast-grep)
- One canonical file per concept; one exported default when the concept has a default

**Existing enforcement:**

- 36 rule codes in `src/lib/constant/rule-policy.ts`
- CI scripts: `scripts/check-ui-drift.ts` (regex) and `scripts/check-ui-drift-ast.ts` (AST)

---

### Layer 3 — Semantic Resolver

**Path:** `packages/shadcn-ui/src/semantic/`

**What it is:** The composition layer. It maps governed constants to Tailwind class outputs.
It composes — it does not author.

**Preservation rules:**

- Must compose governed constants only — never invent new vocabularies or redefine tones
- Must not create shadow variants or second semantic authoring layers
- Every class decision flows through a governed helper:
  - `getToneBgClass()`, `getAlertToneClass()`, `getBadgeToneClass()`
  - `getSurfaceClass()`, `getPanelEmphasisClass()`
  - `getDensityGapClass()`, `getFieldGapClass()`
- Domain adapters in `src/semantic/domain/` translate business truth into governed choices
- The `src/semantic/internal/presentation.ts` resolver is the correct pattern

**What it must not do:**

- Invent new tones or emphasis levels
- Define `Record<SemanticTone, ...>` locally — these belong in `src/lib/constant/semantic/`
- Create component-specific override registries

**Existing enforcement:**

- Import fence prevents direct Radix/CVA usage outside this package

---

### Layer 4 — Final Components

**Path:** `apps/web/src/features/`, `apps/web/src/share/components/`

**What it is:** Domain-facing assembly. Thin. Boring. Consistent.

**Rule: Final components assemble — they do not author design doctrine.**

**Permitted:**

- Consuming primitives from `@afenda/shadcn-ui` or `@afenda/ui`
- Consuming semantic helpers from `@afenda/shadcn-ui/semantic`
- Wiring governed semantic types to component props
- Accessibility wiring (labels, ARIA attributes)
- Domain data rendering

**Forbidden — these patterns are drift:**

- Inline class maps: `Record<SomeTone, { className: string }>`
- New semantic vocabularies: local `"success" | "danger" | "caution"` when a canonical
  type exists
- Raw color classes: `bg-red-500`, `text-blue-700` (enforced by ESLint)
- One-off spacing logic: ad hoc `gap-[13px]`, `p-[7px]`, `rounded-[10px]`
- Local variant systems: `cva()` calls (enforced by import fence)
- Direct Radix imports: `@radix-ui/react-*` (enforced by import fence)
- Shadow semantic resolvers: local `Record<TruthSeverity, { ... className ... }>` maps

---

## Canonical Patterns vs. Drift Patterns

### className Composition

```tsx
// CORRECT — governed resolver + cn()
import { getTruthSeverityPresentation } from '@afenda/shadcn-ui/semantic'
import { cn } from '@afenda/ui/lib/utils'

const tone = getTruthSeverityPresentation(severity)
<div className={cn('rounded-lg border', tone.borderClassName)} />
```

```tsx
// DRIFT — shadow resolver in feature code
const toneClassMap: Record<TruthSeverity, { bg: string; text: string }> = {
  valid: { bg: 'bg-[var(--color-truth-valid)]', text: 'text-[var(--color-truth-valid)]' },
  // ... re-authoring what the governed package already owns
}
```

### Semantic Resolver Usage

```tsx
// CORRECT — consume governed helper
import { getAlertToneClass } from '@afenda/shadcn-ui/lib/constant'
const className = getAlertToneClass(tone, emphasis)
```

```tsx
// DRIFT — re-define tone mapping in component
const alertToneClassMap = {
  info: 'bg-info text-info-foreground',
  warning: 'bg-warning text-warning-foreground',
}
const className = alertToneClassMap[tone]  // shadow layer
```

### Composition with asChild

```tsx
// CORRECT — props spread, ref forwarded, accessible element preserved
function MyButton({ asChild, ...props }: React.ComponentProps<'button'> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="my-button" {...props} />
}
```

```tsx
// DRIFT — props not spread (breaks Radix event handlers and accessibility)
function MyButton({ onClick }: { onClick?: () => void }) {
  return <button onClick={onClick} />  // other props discarded
}
```

### Animation

```tsx
// CORRECT — use data-state CSS targeting with governed animation tokens
/* In globals.css */
[data-state="open"] { animation: var(--animate-fade-in) }
[data-state="closed"] { animation: var(--animate-fade-out) }
```

```tsx
// DRIFT — local @keyframes that duplicate @theme tokens
@keyframes myFadeIn { from { opacity: 0 } to { opacity: 1 } }
.MyDialog[data-state="open"] { animation: myFadeIn 200ms; }
```

### Icon Accessibility

```tsx
// CORRECT — decorative icon aria-hidden, meaningful icon labeled
<BellIcon aria-hidden="true" />
<Button aria-label={t('truth_alerts.aria_label_none', 'No truth alerts')}>
  <BellIcon aria-hidden="true" />
</Button>
```

```tsx
// DRIFT — icon-only button with no label
<Button>
  <BellIcon />  // no aria-label, no VisuallyHidden, screen reader gets nothing
</Button>
```

### Import Boundaries

```tsx
// CORRECT — consume from governed barrel
import { getTruthSeverityPresentation } from '@afenda/shadcn-ui/semantic'
import { Button } from '@afenda/ui/components/ui/button'
```

```tsx
// DRIFT — direct Radix import (blocked by ESLint import fence)
import * as DialogPrimitive from '@radix-ui/react-dialog'

// DRIFT — internal path import (bypasses barrel contract)
import { getBadgeClasses } from '@afenda/shadcn-ui/src/semantic/internal/presentation'

// DRIFT — shadow component in apps/web that overrides governed one
import { Button } from '@/components/ui/button'  // when it's a local copy
```

---

## Enforcement Matrix

| Drift pattern | Status | Mechanism |
|---|---|---|
| Raw Tailwind palette classes | ENFORCED | ESLint `afenda-ui/no-raw-colors` |
| Hardcoded color values | ENFORCED | ESLint `afenda-ui/no-raw-colors` |
| Non-allowlisted color stems | ENFORCED | ESLint `afenda-ui/semantic-token-allowlist` |
| Inline style theming | ENFORCED | ESLint `afenda-ui/no-inline-style-theming` |
| Direct `@radix-ui/*` imports | ENFORCED | ESLint `no-restricted-imports` |
| Direct `cva` imports | ENFORCED | ESLint `no-restricted-imports` |
| `Record<SemanticTone, className>` maps | ENFORCED | ESLint `afenda-ui/no-local-semantic-map` |
| `*ClassMap` / `*ToneMap` variable naming | ENFORCED | ast-grep `no-classname-string-map` |
| `cva()` outside governed package | ENFORCED | ast-grep `no-cva-outside-governed` |
| `Record<*, {className}>` inline objects | ENFORCED | ast-grep `no-inline-record-classmap` |
| Stem allowlist / @theme out of sync | ENFORCED | `scripts/check-stem-sync.ts` |

---

## Drift Vectors Reference

### Accessibility Drift

- **Removing `DialogTitle` or `DialogDescription`** — breaks screen reader announcements.
  Radix wires these with `aria-labelledby` / `aria-describedby` by composition.
- **Overriding focus management** — Radix manages focus automatically. Do not trap focus
  manually inside Radix overlays.
- **Replacing Trigger element types** — Radix Trigger defaults to `button`. Changing to `div`
  without adding `role="button"`, `tabIndex={0}`, and keyboard handlers breaks accessibility.
- **Stripping `aria-*` during prop spreading** — destructure only what you need; always spread
  `...rest` onto the DOM element.
- **Icon-only buttons without label** — every interactive element that has no visible text label
  requires `aria-label` or a `VisuallyHidden` child.

### className / Styling Drift

- **Raw palette classes** — `bg-red-500` means nothing to the design system; use `bg-destructive`.
- **`hsl(var(--...))` double-wrapping** — Tailwind v4 / `@theme inline` already wraps values.
  Use `var(--color-truth-valid)` or the Tailwind utility `bg-truth-valid` directly.
- **Bypassing `cn()`** — string concatenation creates non-mergeable class strings.
  Always use `cn()` for dynamic className composition.
- **Overriding `data-slot`** — `data-slot` is the targeting mechanism for Tailwind variant
  selectors within primitives. Changing it breaks those selectors.
- **`@apply` directive** — deprecated in Tailwind v4. Use utility classes directly.
- **`!important` overrides** — signals that the primitive structure is being fought. Fix the
  structure instead.

### Composition Drift (asChild / Slot / Ref)

- **Not spreading props in `asChild` target** — Radix clones the child and passes its own props
  and event handlers. If the child doesn't spread `...props`, accessibility breaks silently.
- **New `React.forwardRef` in post-React-19 code** — React 19 passes `ref` as a regular prop.
  Use `React.ComponentProps<typeof X>` and accept `ref` in props directly.
- **Extra DOM wrappers inside composition chains** — wrapping `Trigger asChild` in an extra
  `<span>` or `<div>` breaks the Slot merge and the composed event chain.
- **Manual `asChild` reimplementation** — always use Radix `Slot` for polymorphic rendering.

### Animation Drift

- **`tailwindcss-animate` plugin** — deprecated; use `tw-animate-css` instead.
- **Local `@keyframes`** — when the `@theme` block already provides `--animate-*` tokens,
  adding local `@keyframes` is duplication. Always check `@theme` first.
- **Mixing CSS and JS animation** — pick one per component. Radix handles CSS exit animations
  via `data-state="closed"` + animation suspension automatically; do not fight this.
- **`forceMount` without lifecycle control** — `forceMount` delegates unmounting to the caller.
  If you use it, you are responsible for the full mount/unmount lifecycle.

### Portal Drift

- **Removing Portal** — Dialog, Popover, DropdownMenu, Sheet rely on Portal for z-index
  stacking and scroll containment. Never remove it from primitive copies.
- **CSS selectors that cross the Portal boundary** — `.parent .dialog-content` selectors fail
  when Dialog.Content is portaled. Style the content directly.
- **`ReactDOM.createPortal` for overlay UI** — use the governed primitives; they handle Portal,
  cleanup, and accessibility automatically.

### Visually Hidden Drift

- **`sr-only` Tailwind class directly in JSX** — use the `VisuallyHidden` primitive instead.
  Raw `sr-only` misses edge cases (iOS, RTL, zoom) that `VisuallyHidden` handles.
- **`display: none` for accessible content** — removes from accessibility tree entirely.
  Use `VisuallyHidden` when content must be hidden visually but announced by screen readers.

### Tailwind v4 Drift

- **`tailwind.config.ts`** — Tailwind v4 is CSS-first via `@theme`. No config file.
- **`@tailwind base/components/utilities`** — replaced by `@import "tailwindcss"`.
- **`dark:` prefix on semantic color tokens** — unnecessary; theme switching works via CSS
  variable reassignment, not Tailwind's dark variant.
- **`hsl()` wrapping** — colors in `:root` / `.dark` use `hsl()` values; `@theme inline` then
  maps them directly via `var()`. Do not double-wrap in component code.

---

## PR Review Checklist

Every PR that touches `apps/web/src/features/` or `apps/web/src/share/components/` must answer:

- [ ] **Primitive structure preserved?** — Did the change leave shadcn/ui primitive files
      structurally identical to source, with only canonized variants added?
- [ ] **Governed semantic helpers used?** — Did the change consume `getTone*`, `getSurface*`,
      `getPanel*`, or domain resolvers from `@afenda/shadcn-ui/semantic` instead of
      reimplementing them?
- [ ] **New style meaning introduced?** — Did the change define new tones, emphasis levels,
      spacing rules, or color mappings that aren't in `src/lib/constant/`?
- [ ] **Tokens bypassed?** — Did the change use raw palette colors, hardcoded hex/rgb values,
      or inline style theming where semantic tokens exist?
- [ ] **Mapping logic duplicated?** — Did the change create a `Record<SemanticType, className>`
      object or a `*ClassMap` / `*ToneMap` variable outside the governed package?
- [ ] **Component structurally thin?** — Does the component do primarily assembly (composition +
      slot wiring + accessibility + data rendering) or did it grow its own design doctrine?

If any answer is "yes" for the forbidden patterns, the PR must be revised before merge.

---

## Severity of Violations

| Violation type | Severity | Action |
|---|---|---|
| Direct `@radix-ui/*` import in feature code | Error | Must fix — CI blocks merge |
| Raw palette class in component | Error | Must fix — CI blocks merge |
| `Record<SemanticTone, className>` in feature code | Error | Must fix — CI blocks merge |
| `cva()` in feature code | Error | Must fix — CI blocks merge |
| `*ClassMap` / `*ToneMap` variable outside governed package | Warning | Should fix this sprint |
| Missing `aria-label` on icon-only button | Warning (jsx-a11y) | Should fix this sprint |
| `sr-only` instead of `VisuallyHidden` | Warning | Should fix this sprint |
| `@keyframes` duplicating `@theme` token | Warning | Should fix next PR touching that file |

---

## File Header Conventions

All files in `packages/shadcn-ui/src/` must begin with an annotation header. Required headers
are defined in `docs/SEMANTIC_GOVERNANCE_ARCHITECTURE.md`.

| File type | Header |
|---|---|
| Public export barrel | `MODULE ENTRYPOINT` |
| Simple semantic lookup | `SEMANTIC REGISTRY` |
| Governed semantic system | `SEMANTIC SYSTEM` |
| Domain-to-UI adapter | `SEMANTIC ADAPTER` |
| Internal presentation resolver | `SEMANTIC PRESENTATION` |
| shadcn/ui primitive copy | `COPIED PRIMITIVE` |
| Governance rule policy | `GOVERNANCE POLICY` |

---

## Related Files

| Purpose | Path |
|---|---|
| Full governance architecture | `docs/SEMANTIC_GOVERNANCE_ARCHITECTURE.md` |
| Rule severity policy | `src/lib/constant/rule-policy.ts` |
| Semantic resolver (correct pattern) | `src/semantic/internal/presentation.ts` |
| Regex-based drift CI check | `scripts/check-ui-drift.ts` |
| AST-based drift CI check | `scripts/check-ui-drift-ast.ts` |
| Color stem allowlist | `packages/eslint-config/afenda-ui-plugin/semantic-color-stems.cjs` |
| Stem sync validation | `scripts/check-stem-sync.ts` |
