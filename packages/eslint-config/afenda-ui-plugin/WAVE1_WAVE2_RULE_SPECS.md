# Afenda UI — Wave 1 & Wave 2 ESLint rule specifications

This document is the **implementation contract** for splitting and hardening the `afenda-ui` ESLint plugin. It is aligned with the canonical policy in `packages/shadcn-ui/src/lib/constant/policy/class-policy.ts` (field names and intent). Enterprise catalog items that are **not** yet policy fields are called out under Wave 2 semantic rules with a **future policy extension** note.

**Convention:** Rule IDs use the `afenda-ui/` prefix (package `eslint-plugin-afenda-ui` / `plugins: { 'afenda-ui': ... }`).

**Shared infrastructure (all rules):**

- **Scope resolver:** `resolveClassGovernanceScope(filePath)` — single source of path→scope mapping (see §0). Rules must not duplicate glob logic.
- **Policy gate:** Each rule reads `classPolicy.<field>` (via `getClassPolicyForFile` or equivalent) and **returns early** when the policy allows the pattern for that scope (future: per-scope overrides; today policy is mostly global booleans).

### Manifest truthfulness (machine layer)

`packages/shadcn-ui/.../class-policy-eslint-rule-manifest.ts` (v2) binds each `classPolicy` field to **rule bindings** with explicit status:

| Status | Meaning |
| --- | --- |
| `implemented` | Rule is registered in `plugin-rule-registry.cjs` and is intended to fully enforce the field. |
| `partial` | Rule exists but only covers part of the policy (e.g. legacy monolith `no-raw-colors` vs split `no-raw-palette-classes`). |
| `planned` | Target rule id is **not** in the plugin yet; enforcement is not claimed. |

`validateClassPolicyEslintRuleManifest()` (in `validate-policy-manifest.ts`) asserts: shape coverage; every non-`planned` binding resolves to a real plugin rule; a `planned` binding that already exists in the plugin raises a **warning** (status should move to `implemented` / `partial`); every plugin rule is either referenced on some field or listed in `AFENDA_UI_RULE_IDS_OUTSIDE_CLASS_POLICY_MANIFEST` (semantic-only rules).

---

## §0 — Scope resolver (`class-governance-scope`)

**Purpose:** Every rule agrees whether a file is governed and which **lane** it belongs to.

**Suggested implementation:** `packages/eslint-config/afenda-ui-plugin/utils/class-governance-scope.cjs`

**Types:**

| Scope | Meaning |
| --- | --- |
| `ui-package` | `packages/shadcn-ui/src/**` — design-system owner |
| `feature-ui` | `apps/web/src/features/**` |
| `shared-app-ui` | `apps/web/src/share/**` (not `shared/` — repo uses `share`) |
| `app-shell` | `apps/web/src/share/**/shell-ui/**` or explicit `app-shell` path if introduced |
| `chart-interop` | `**/chart/**`, `**/charts/**` |
| `rich-content` | `**/rich-content/**`, `**/editor/**`, `**/markdown/**` |
| `null` | Outside governed UI; most rules **silence** |

**Tests:** `pnpm --filter @afenda/eslint-config test` — `afenda-ui-plugin/utils/class-governance-scope.test.cjs` (POSIX/Windows, ordering: `shell-ui` before generic `share`).

---

# Wave 1 — Foundational drift (highest value)

These six rules correspond directly to **boolean** flags in `classPolicy` today.

---

## 1. `afenda-ui/no-direct-radix-outside-ui`

| | |
| --- | --- |
| **Policy field** | `allowDirectRadixImportOutsideUiPackage` |
| **Family** | A — Primitive integrity |
| **Default severity** | `error` |
| **Implemented today** | Partially via `scripts/check-ui-drift-ast.ts` (import rules); **not** a dedicated ESLint rule yet |

### Purpose

Block direct `@radix-ui/*` imports outside the UI owner package so primitives stay centralized and wrappers stay consistent.

### AST nodes visited

- `ImportDeclaration` — `source.value` matches `@radix-ui/react-*`
- Optional: `CallExpression` dynamic `import()` with string literal source

### Detection

1. Normalize file path; if `resolveClassGovernanceScope` is `ui-package`, **allow** (or still warn for non-approved subpaths if you add an allowlist later).
2. If scope is governed (`feature-ui`, `shared-app-ui`, `app-shell`, etc.) and `allowDirectRadixImportOutsideUiPackage === false`, report on the import node.
3. Match specifiers: namespace or named imports; all Radix entrypoints under `@radix-ui/`.

### Exceptions

- Test files: `*.test.ts(x)`, `*.spec.ts(x)` — optional off by default; prefer `eslint-disable` for rare cases.
- Storybook: `*.stories.tsx` — same.

### Messages

| messageId | Text |
| --- | --- |
| `radixImportOutsideUi` | Direct Radix import `{{package}}` is not allowed outside the governed UI package. Use `@afenda/shadcn-ui` primitives or approved wrappers. |

### Tests (invalid)

```ts
import * as Dialog from "@radix-ui/react-dialog"
import { Root } from "@radix-ui/react-dropdown-menu"
```

### Tests (valid — inside UI package)

```ts
// file: packages/shadcn-ui/src/components/ui/dialog.tsx
import * as DialogPrimitive from "@radix-ui/react-dialog"
```

---

## 2. `afenda-ui/no-cva-outside-ui`

| | |
| --- | --- |
| **Policy field** | `allowCvaOutsideUiPackage` |
| **Family** | A |
| **Default severity** | `error` |
| **Implemented today** | Drift / CI only |

### Purpose

Prevent ad hoc `class-variance-authority` variant systems outside the UI package.

### AST nodes visited

- `ImportDeclaration` from `class-variance-authority`
- `CallExpression` where `callee` is identifier `cva` (track `cva` from import binding)

### Detection

1. If file is `ui-package`, allow.
2. If `allowCvaOutsideUiPackage === false` and scope is governed, report import and any `cva(...)` call.

### Exceptions

- None in product UI; tests may disable.

### Messages

| messageId | Text |
| --- | --- |
| `cvaImport` | Importing `cva` from `class-variance-authority` is not allowed outside the governed UI package. |
| `cvaCall` | Do not define local `cva()` variant systems outside the governed UI package. |

### Tests

**Invalid (feature):**

```ts
import { cva } from "class-variance-authority"
export const row = cva("flex", { variants: { size: { sm: "text-sm" } } })
```

**Valid (UI package):** same snippet under `packages/shadcn-ui/src/`.

---

## 3. `afenda-ui/no-raw-palette-classes`

| | |
| --- | --- |
| **Policy field** | `allowRawPaletteClasses` |
| **Family** | B — Styling escape hatches |
| **Default severity** | `error` |
| **Implemented today** | **Partial:** `afenda-ui/no-raw-colors` (`raw-tailwind-color` message) overlaps; enterprise split isolates **palette namespace** only |

### Purpose

Reject Tailwind **palette** utilities (`bg-blue-500`, `text-zinc-700`, …) in governed scopes. Semantic utilities (`bg-background`, `text-destructive`, `border-border`) must **not** match.

### AST nodes visited

- `JSXAttribute` name `className` — literal, `cn()`, `clsx()`, `twMerge()`, `cva()` outputs
- `CallExpression` for those helpers — walk string args recursively (same pattern as current `no-raw-colors`)

### Detection

1. Regex for palette utilities: color family names (`slate`, `gray`, `zinc`, …) + shade `\d{2,3}` with standard prefixes (`bg-`, `text-`, `border-`, `from-`, `to-`, `via-`, …). Align regex with `RAW_TAILWIND_PALETTE_RE` in `check-ui-drift-ast.ts`.
2. Explicitly **exclude** known semantic token class stems used in the design system (maintain a small allowlist for `background`, `foreground`, `card`, `muted`, `accent`, `destructive`, `success`, etc., if they appear as full utilities — most are not `*-{family}-{n}`).
3. If `allowRawPaletteClasses === false` and scope governed, report.

### False-positive guards

- Do not flag `bg-blue` if your token system uses unconventional names — tune allowlist.
- Arbitrary **non-color** brackets `w-[37px]` belong to **`no-arbitrary-tailwind-values`**, not this rule.

### Messages

| messageId | Text |
| --- | --- |
| `rawPaletteClass` | Raw Tailwind palette utility `{{token}}` is not allowed. Use semantic/token-backed classes. |

### Tests

**Invalid:** `className="bg-blue-500 text-zinc-700"`  
**Valid:** `className="bg-background text-foreground"`  
**Valid (semantic intent):** `border-destructive` (not palette family-dash-number pattern)

---

## 4. `afenda-ui/no-arbitrary-tailwind-values`

| | |
| --- | --- |
| **Policy field** | `allowArbitraryValuesInFeatures` |
| **Family** | B |
| **Default severity** | `error` |
| **Implemented today** | CI `check-ui-drift-ast.ts` (`ARBITRARY_VALUE_RE`); not standalone ESLint |

### Purpose

Block `[...]` arbitrary Tailwind values (`w-[37px]`, `grid-cols-[1fr_280px]`, `rounded-[14px]`) in governed feature/shared UI.

### AST nodes visited

Same string extraction pipeline as palette rule.

### Detection

1. Regex `\b[\w/-]+-\[[^\]]+\]` (tune to match Tailwind v3/v4 arbitrary syntax; exclude `url()`, `calc()` if handled elsewhere).
2. Respect `isAllowedArbitraryValueByPolicy` from drift shared utils if ported, or duplicate minimal logic.
3. Chart / rich-content scopes: warn or off per policy extension.

### Exceptions

- Very narrow escapes: CSS variables only inside brackets `bg-[var(--x)]` — **policy decision**; default deny in features.

### Messages

| messageId | Text |
| --- | --- |
| `arbitraryValue` | Arbitrary Tailwind value `{{snippet}}` is not allowed in this scope. Use tokens, theme spacing, or a design-system primitive. |

### Tests

**Invalid:** `className="w-[37px] rounded-[14px]"`  
**Valid:** `className="w-full max-w-md"` (no brackets)

---

## 5. `afenda-ui/no-inline-styles`

| | |
| --- | --- |
| **Policy field** | `allowInlineStyleAttributeInProductUi` |
| **Family** | B |
| **Default severity** | `error` |
| **Implemented today** | **`afenda-ui/no-inline-style-theming`** only for **color keys** in `style={{...}}` — enterprise rule blocks **any** inline style when policy false |

### Purpose

When policy disallows inline styles in product UI, flag **any** `style={...}` JSX attribute in governed scopes (not only color keys).

### AST nodes visited

- `JSXAttribute` with name `style` and `JSXExpressionContainer` value

### Detection

1. If `allowInlineStyleAttributeInProductUi === false` and scope is product UI (not `chart-interop` / `rich-content` unless exempt), report the attribute node.
2. Optional: allow empty object or `undefined` — typically still disallow.

### Exceptions

- Third-party components wrapped: only if you add `eslint-disable-next-line` or a pragma comment convention.
- Legitimate layout hacks: route to chart/rich-content scope in resolver.

### Messages

| messageId | Text |
| --- | --- |
| `inlineStyle` | Inline `style` is not allowed in governed product UI. Use semantic classes, tokens, or an approved component. |

### Tests

**Invalid:** `<div style={{ width: 42 }} />`  
**Valid:** file under `chart-interop` scope with policy exception.

---

## 6. `afenda-ui/no-literal-color-values`

| | |
| --- | --- |
| **Policy field** | `allowHexRgbHslColorsInProductUi` |
| **Family** | B |
| **Default severity** | `error` |
| **Implemented today** | **`afenda-ui/no-raw-colors`** (`hardcoded-color`); enterprise split = literals anywhere, not only in className/cn |

### Purpose

Block hex/rgb/hsl/oklch **literals** in strings and inline style values when policy disallows.

### AST nodes visited

- String `Literal`, quasis of static `TemplateLiteral`
- `JSXAttribute` values for color-like props (`fill`, `stroke`, `color`, …)
- `Property` values inside `style` object expression for color keys

### Detection

1. Reuse `HARDCODED_COLOR_RE` from drift or `no-raw-colors`.
2. Gate on `allowHexRgbHslColorsInProductUi === false`.
3. Exclude files in chart/rich-content if policy allows.

### Messages

| messageId | Text |
| --- | --- |
| `literalColor` | Literal color value is not allowed. Use semantic tokens or mapped utilities. |

### Tests

**Invalid:** `"#fff"`, `'rgb(0,0,0)'`, `` `hsl(220 10% 50%)` ``  
**Valid:** semantic-only references with no literals in governed UI.

---

# Wave 2 — Architecture-critical semantic drift

These map to **`allowDirectTokenUsageInFeatures`** and to **semantic translation** concerns. The latter are **not yet** separate booleans on `classPolicy`; they are partially enforced by **`afenda-ui/no-local-semantic-map`** and **`check-ui-drift-ast.ts`** (semantic / truth rules).

---

## 7. `afenda-ui/no-direct-token-usage`

| | |
| --- | --- |
| **Policy field** | `allowDirectTokenUsageInFeatures` |
| **Family** | B / semantic boundary |
| **Default severity** | `error` |
| **Implemented today** | `check-ui-drift-ast.ts` (token import paths) |

### Purpose

Feature code must not import raw token maps or low-level token modules; use semantic adapters (badge, alert, shell slots).

### AST nodes visited

- `ImportDeclaration` — module specifier string
- Optional: `ExportNamedDeclaration` re-exports

### Detection

1. Maintain allowlist/denylist globs: e.g. `**/lib/constant/token/**`, `**/foundation/**` when imported from `apps/web/src/features/**`.
2. Use `allowDirectTokenUsageInFeatures`; if `false`, report imports from blocked paths from feature scope.
3. `ui-package` and `shared-app-ui` semantic owners: allow per `ownershipPolicy` / future matrix.

### Messages

| messageId | Text |
| --- | --- |
| `directTokenImport` | Direct import from `{{path}}` is not allowed in feature UI. Use a semantic adapter or shell contract. |

### Tests

**Invalid:** `import { colorTokens } from "@afenda/shadcn-ui/..."` from a feature file (exact path per denylist).

---

## 8. `afenda-ui/no-feature-variant-maps`

| | |
| --- | --- |
| **Policy field** | *Future:* e.g. `allowFeatureLevelVariantMaps` (not in `class-policy.ts` yet) |
| **Family** | C — Semantic translation |
| **Default severity** | `error` |
| **Overlap** | Narrower than `no-local-semantic-map`; focuses on **variant vocabulary** clones |

### Purpose

Disallow local objects mapping domain or UI states to **component variant names** (`success` → `"destructive"`, etc.) outside the UI package.

### AST nodes visited

- `VariableDeclarator` / `Property` with object literal
- Identifier names matching: `variantMap`, `variantsBy`, `*VariantMap`, `buttonVariantsBy*`

### Detection

1. Name heuristics from `LOCAL_VARIANT_FACTORY_NAME_RE` / drift (`check-ui-drift-ast.ts`).
2. Values match known variant vocabularies (badge, button, alert enums) — optional second pass to reduce noise.

### Exceptions

- Data-only maps (no UI variant strings) — require human review; start strict in `feature-ui`.

### Messages

| messageId | Text |
| --- | --- |
| `featureVariantMap` | Local variant mapping tables are not allowed in feature UI. Centralize in the design system or use a governed adapter. |

---

## 9. `afenda-ui/no-status-to-class-mapping`

| | |
| --- | --- |
| **Policy field** | *Future:* `allowFeatureLevelStatusToClassMapping` |
| **Family** | C |
| **Overlap** | **`afenda-ui/no-local-semantic-map`** (ClassMap / Tailwind in object) |

### Purpose

Block **status → Tailwind class** maps and **ternary className** from status to raw semantic utilities in feature code.

### AST nodes visited

- Object literals with keys like `pending`, `complete`, `failed` and string values matching `text-*`, `border-*`, `bg-*`
- `JSXAttribute` `className` with `ConditionalExpression` comparing status-like identifiers to string classes

### Detection

1. Reuse `FORBIDDEN_SUFFIXES` and `TAILWIND_CLASS_RE` patterns from `no-local-semantic-map-rule.cjs`.
2. Add conditional-expression heuristic: left side member/identifier containing `status`, `state`, right side string with utility pattern.

### Messages

| messageId | Text |
| --- | --- |
| `statusToClass` | Do not map status/state to class strings in feature code. Use a governed semantic component or adapter. |

---

## 10. `afenda-ui/no-truth-to-variant-mapping`

| | |
| --- | --- |
| **Policy field** | *Future:* `allowFeatureLevelTruthToVariantMapping` |
| **Family** | C |
| **Overlap** | Drift `UIX-AST-TRUTH-*`, `TRUTH_MAPPING_IMPORT_SOURCES` |

### Purpose

Block mappings from **truth / reconciliation / settlement / invariant** domain states to badge/alert/icon variants in feature folders.

### AST nodes visited

- Same as §8–9, plus type references: `TruthSeverity`, `ReconciliationState`, imports from `domain/*`

### Detection

1. Import graph: if file imports from `truth-ui`, `reconciliation`, `settlement` and defines object literal mapping to `success|warning|destructive`, report.
2. Variable names: `reconciliationVariant`, `truthToBadge`, `severityToVariant`.

### Messages

| messageId | Text |
| --- | --- |
| `truthToVariant` | Do not map truth/reconciliation domain state to visual variants in feature code. Use `packages/shadcn-ui` governed mappers. |

---

## Appendix — Relationship to existing plugin rules

| Existing rule | Relation to Wave 1/2 |
| --- | --- |
| `afenda-ui/no-raw-colors` | Monolith; split into `no-raw-palette-classes`, `no-arbitrary-tailwind-values` (non-color brackets), `no-literal-color-values` for clearer messages and policy mapping. |
| `afenda-ui/no-inline-style-theming` | Subset of `no-inline-styles` (color-only); keep until `no-inline-styles` fully replaces or delegate color-specific logic. |
| `afenda-ui/no-local-semantic-map` | Overlaps Wave 2 **§8–10**; specialize or narrow as policy fields land. |
| `afenda-ui/no-direct-semantic-color` | Complements literal/palette rules; keep. |

---

## Appendix — CI vs ESLint (from architecture doc)

| Concern | ESLint | CI / scorecard |
| --- | --- | --- |
| Imports (Radix, CVA, tokens) | Yes | Redundant backup |
| className string tokens | Yes | Token count / density trends |
| Nested `cn()` depth | Hard | Yes |
| Repo-wide dashboards | No | Yes |

---

## Appendix — Implementation order (reiterated)

1. `no-direct-radix-outside-ui`
2. `no-cva-outside-ui`
3. `no-raw-palette-classes` (or split from `no-raw-colors`)
4. `no-arbitrary-tailwind-values`
5. `no-inline-styles` (generalize `no-inline-style-theming`)
6. `no-literal-color-values` (split `hardcoded-color` path)
7. `no-direct-token-usage`
8. `no-feature-variant-maps`
9. `no-status-to-class-mapping`
10. `no-truth-to-variant-mapping`
