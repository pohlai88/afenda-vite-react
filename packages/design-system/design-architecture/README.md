# CANONICAL STYLESHEET — ARCHITECTURE & ENFORCEMENT

## 0. Intent (Read this first)

This file (`src/local.css`) is the **package-local Tailwind entry** exported as `@afenda/design-system/design-architecture/local.css`.

It is NOT just CSS.
It is a **controlled runtime surface** for:

* Tailwind v4 engine
* Design tokens (runtime variables)
* Dark mode
* Shared utilities
* Global base rules
* Shared interaction behavior

This document defines:

* how it is built
* how it is structured
* how it is validated
* how drift is detected and blocked

If a change cannot pass this document, it must not be merged.

---

## 1. Architecture Model

### Two systems (must not mix)

#### A. Token System (TypeScript side)

Owns:

* token vocabulary
* token values
* validation
* normalization

Output:

* stable semantic values

#### B. Stylesheet System (this file)

Owns:

* Tailwind wiring
* runtime CSS variables
* dark mode application
* utilities
* base rules
* shared component behavior

### Pipeline

```
Token Definitions (TS)
→ Token Validation
→ Token Normalization
→ Runtime Variables (@theme)
→ Canonical Stylesheet (local.css)
→ Tailwind Compilation
→ Vite Bundle
→ Browser
```

This file is the **only CSS assembly layer** in this pipeline.

---

## 2. Canonical Structure (ENFORCED ORDER)

The file MUST follow this exact order:

1. `@import "tailwindcss"`
2. `@source`
3. `@plugin`
4. `@custom-variant`
5. `@theme`
6. `.dark`
7. `@utility`
8. `@layer base`
9. `@layer components`

No reordering.
No duplication.
No omission.

---

## 3. Section Contracts

### 3.1 Tailwind Entry

```
@import "tailwindcss";
```

* must be first line
* nothing before it

---

### 3.2 Source + Plugins + Variant

```
@source "../..";
@plugin "...";
@custom-variant dark (...);
```

* defines scan boundary
* defines plugin surface
* defines dark-mode model

❌ Forbidden:

* redefining in other files

---

### 3.3 Theme Layer

```
@theme static { ... }
```

* defines runtime CSS variables
* must use semantic naming

Allowed:

* OKLCH
* color-mix
* keyframes

❌ Forbidden:

* feature tokens
* domain tokens
* layout rules

---

### 3.4 Dark Mode

```
.dark { ... }
```

* overrides variables only

❌ Forbidden:

* layout rules
* utilities
* component styling

---

### 3.5 Utilities

```
@utility ...
```

Must be:

* generic
* reusable
* token-based

❌ Forbidden:

* feature-specific logic
* raw color values

---

### 3.6 Base Layer

```
@layer base { ... }
```

Owns:

* body defaults
* UA alignment
* reduced motion

❌ Forbidden:

* feature UI
* layout systems

---

### 3.7 Components Layer

```
@layer components { ... }
```

Owns:

* shared interaction behavior

❌ Forbidden:

* business UI
* page-specific styling

---

## 4. Hard Rules (FAIL ON VIOLATION)

### RULE 1 — Single Entry

There must be exactly ONE global stylesheet.

---

### RULE 2 — No Raw Colors

Outside `@theme`, these are forbidden:

* `#hex`
* `rgb()`
* `hsl()`
* `oklch()`

---

### RULE 3 — Token Only Usage

Only use:

```
var(--color-*)
```

---

### RULE 4 — Dark Mode Ownership

Only `.dark` here controls semantic overrides.

---

### RULE 5 — No Feature Logic

Global CSS must never contain:

* business rules
* feature styles
* page layouts

---

## 5. Drift Detection (Executable Rules)

These are REQUIRED checks.

### 5.1 Structure Check

Verify order using script:

```ts
const requiredOrder = [
  '@import',
  '@source',
  '@plugin',
  '@custom-variant',
  '@theme',
  '.dark',
  '@utility',
  '@layer base',
  '@layer components'
]
```

Fail if order differs.

---

### 5.2 Raw Color Check

Regex scan:

```ts
/(#|rgb\(|hsl\(|oklch\()/
```

Fail if found outside `@theme`.

---

### 5.3 Duplicate Ownership Check

Fail if:

* another file contains `@theme`
* another file contains `.dark`

---

### 5.4 Utility Check

Fail if utility contains:

* raw colors
* feature keywords

---

### 5.5 Base Layer Check

Fail if base layer contains:

* feature selectors
* layout systems

---

### 5.6 Components Layer Check

Fail if:

* business logic detected
* feature-specific selectors detected

---

## 6. CI Integration

Required scripts:

```
scripts/check-css-structure.ts
scripts/check-css-colors.ts
scripts/check-css-ownership.ts
```

Run in CI:

```
pnpm test:css-governance
```

---

## 7. PR Checklist (BLOCKING)

* [ ] structure order unchanged
* [ ] no raw color usage
* [ ] no new stylesheet entry
* [ ] dark mode unchanged
* [ ] utilities still generic
* [ ] base still minimal
* [ ] components still shared

---

## 8. Final Rule

This file is not styling.

It is **architecture**.

If this file drifts, the entire design system loses control.
