# Policy governance rollout

This folder contains governed policy constants for UI drift control, composition rules, and policy validation surfaces.

## Canonical vs compatibility exports

- Canonical policy truth should live in policy modules (for example `class-policy.ts`).
- Compatibility adapters may exist for legacy consumers, but they must be derived from canonical policy.
- Compatibility metadata must include a sunset target.

## Policy inventory: manifests vs contracts

**Manifest** (`*-policy-manifest.ts`, validated by `validate-policy-manifest.ts` and `scripts/check-policy-manifests.ts`) records **rollout truth**: lifecycle, consumers, fixture expectations, and notes. It is **not** a second copy of policy values—it documents how each canonical field is enforced and evolved.

**Contract** means a **separate structured governance surface** (often richer than a flat boolean map): extra fields like `allowed`, `enforcement`, `scope`, `rationale`, or wrapper-specific invariants. You add a contract **only when a second domain justifies it**, not for symmetry.

| Canonical policy | Manifest | Contract or extra surface |
| ---------------- | -------- | --------------------------- |
| `class-policy` | yes | — |
| `component-policy` | yes (`component-policy-manifest.ts` keys = **`componentPolicyContract`** rows) | **`componentPolicyContract`** in `component-policy.ts` (+ flat `componentPolicy` derived from it) |
| `import-policy` | yes | — |
| `metadata-ui` (`metadata-ui.ts`) | yes | — |
| `ownership-policy` | yes | — |
| `radix-policy` | yes | **`radixContractPolicy`** lives in **`radix-policy.ts`** (same module as `radixPolicy`) — primitive packages vs wrapper forwardRef/spread contract |
| `radixContractPolicy` | yes (`radix-contract-policy-manifest.ts`) | this *is* the contract policy object |
| `react-policy` | yes | — |
| `shadcn-policy` | yes | — |
| `tailwind-policy` | yes | — |
| `style-binding` | yes (`style-binding-policy-manifest.ts`) | — |
| Shell (`policy/shell/`) | `shell-doctrine-manifest.ts` + shell docs | **`shell/contract/*`**, registry, and multiple `shell/*/policy/*` modules |

**Outside this folder:** `rule-policy.ts` (repo: `packages/shadcn-ui/src/lib/constant/rule-policy.ts`) is the **UI drift rule-code registry** (severity, ESLint linkage). It is meta-configuration, not a drift policy blob, and does not use the same manifest pattern.

**Takeaway:** *manifest* = rollout and consumer tracking for **canonical policy objects**; *contract* = an **optional second layer** where the domain actually splits (Radix import vs wrapper behavior, component semantic rules table, shell). Missing a manifest on a small policy is **technical debt**, not a missing contract. Missing a contract on `tailwind-policy` is **correct** unless you introduce a second orthogonal surface.

## Lifecycle states

Policy manifest entries use lifecycle states:

- `enforced`: validated and CI-blocking with fixture-backed proof.
- `review-only`: linked to a consumer but non-blocking until confidence is promoted.
- `backlog`: field exists and is tracked but not yet wired to mature enforcement.
- `deprecated`: field scheduled for removal with explicit sunset intent.

## Enforcement eligibility

A field should only be marked `enforced` when all are true:

- an active consumer exists,
- CI blocking behavior is explicitly enabled,
- fixture coverage includes valid and invalid cases.

## Phased rollout model

- `phase-1-structure`: schema and manifest structure.
- `phase-2-objective-enforcement`: low-ambiguity enforcement (imports, inline style, raw classes).
- `phase-3-semantic-enforcement`: higher-ambiguity semantic mapping drift checks.
- `phase-4-legacy-removal`: remove compatibility adapters after migration.

## Legacy sunset rule

Any `compatibilityOnly` entry must declare `legacySunset` so compatibility exports do not become permanent shadow truth.

## Policy semantics (boolean prefixes)

Governed policies use consistent naming for intent:

- **`require*`** — Hard invariant. Violations are incorrect code and should be enforced when automation exists.
- **`allow*`** — Explicit exception gate. When `false`, the named escape hatch is disallowed and should be blocked.
- **`prefer*`** — Strong directional guidance. May be enforced heuristically or via review; not every violation is automatically blocking.

Paired `require*` / `allow*` fields (for example `requirePureRender` versus `allowMutationDuringRender`) are intentional: doctrine versus violation gate. Do not collapse them without a documented migration.

## Contributor checklist

When adding or modifying policy fields:

1. Update canonical policy field(s).
2. Add or update manifest entries (`class-policy-manifest.ts`, `component-policy-manifest.ts`, `import-policy-manifest.ts`, `metadata-ui-policy-manifest.ts`, `ownership-policy-manifest.ts`, `radix-policy-manifest.ts`, `radix-contract-policy-manifest.ts`, `react-policy-manifest.ts`, `shadcn-policy-manifest.ts`, `tailwind-policy-manifest.ts` as applicable).
3. If fixture coverage is claimed, add concrete `fixturePaths` entries.
4. Run `pnpm run script:check-policy-manifests` (legacy alias: `script:check-class-policy-manifest`).
5. For enforced metadata-ui fixture-backed entries, run `pnpm run script:check-metadata-ui-fixtures`.
6. Keep `validate-constants.ts` green.
7. Add/adjust fixtures before promoting lifecycle to `enforced`.
