# Plan: Global default token policy (canon doc + optional code enforcement)

This plan **supersedes / extends** the earlier “thin token-key authority” sketch by adding your **paste-ready Global Default Token Policy** as repo canon and aligning implementation choices.

## Goals

1. **Attach** the full policy (layers, families, bridge list, emission rules, validation rules, paste-ready TS snippets) to [`tailwind-shadcn.md`](tailwind-shadcn.md) as a **stable, reviewable** reference — “one time, lasts forever” for **global default only** (no feature truth).
2. **Optionally** land TypeScript modules (`token-ownership`, `token-family-matrix`, `classify-token-key`, `validate-global-default-tokens`) **without** drifting from the existing 6-module pipeline in `afenda-token-source/`.
3. **Verify** open items: shadow namespace (`--color-shadow-*` vs `--shadow-*`), necessity of full compatibility alias set.

## Documentation task (execute when approved)

- Append a new major section to [`docs/__idea__/tailwind-shadcn.md`](tailwind-shadcn.md):
  - **Global Default Token Policy** (purpose, scope, layer model, canonical families, bridge families, emission rules, validation rules).
  - **Paste-ready constants** appendix (the TS blocks you provided), with **import path note**: package code should use `@/lib/constant/schema/shared` (see [`packages/shadcn-ui-deprecated/tsconfig.json`](../../packages/shadcn-ui-deprecated/tsconfig.json)); docs may show `../schema/shared` as illustrative only.
  - **Naming clarification** (required in doc):
    - Policy term **`bridge`** = framework **compatibility vocabulary** (shadcn/Tailwind semantic names).
    - [`TokenDefinition.bridge`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-token-source/canonical/token-source.ts) = **Tailwind / `@theme` exposure** (includes many raw keys). **Do not conflate** the two in prose or variable names in new code; prefer `TokenOwnership.BRIDGE` vs `definition.bridge` in comments.

## Implementation strategy (hybrid — chosen)

**Principle:** Canon policy + full matrix stay in **docs** forever. **Code** adds matrix/helpers **only where enforcement or ergonomics need them**, without a second long-term source of truth that can drift unchecked.

1. **Always:** Append the Global Default Token Policy + family tables + paste-ready snippets to [`tailwind-shadcn.md`](tailwind-shadcn.md) (single human-reviewed canon).
2. **In code:** Keep authoritative keys in [`contract/token-contract.ts`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-token-source/contract/token-contract.ts) + existing raw/semantic rules.
3. **When “we need it”** (CI, generators, IDE clarity): introduce `token-family-matrix.ts` **as a re-export or thin wrapper** that either:
   - **re-exports** tuples derived from existing `MUST_HAVE_*` / contract exports, **or**
   - duplicates the matrix **only with** a parity test (`matrix required ⊆ emitted keys` and `matrix keys ⊆ contract ∪ known optional`) that fails CI on drift.

4. **Thin derived classifier** (optional, low cost): `classifyTokenKeyAuthority` from `isRawTokenKey` + `isSemanticTokenKey` + `SHADCN_BASELINE_SEMANTIC_PATTERN` avoids maintaining a separate compatibility allowlist in TS if the doc matrix is enough for humans.

**Avoid:** A free-standing giant matrix in TS with no parity test against `token-contract.ts`.

## Classification logic — fix overlap before enforcing

Your pasted `classifyTokenKey` checks **`compatibility.allowed` first**, then canonical families. Several names appear in **both** (e.g. `background`, `foreground`, `muted`, `muted-foreground` in **foundation.required** and **compatibility.allowed**). Result: they **always** classify as `bridge`, so foundation “required canonical” never applies to those keys.

**Resolution options** (pick one in implementation):

1. **Remove duplicates** from `foundation.required` (keep foundation for AFENDA-only names; list shared names only under `compatibility`).
2. **Two-axis model** in docs only: “canonical source value” vs “compatibility name” (same key can be both); classification returns one **primary** for policy (e.g. raw → canonical; semantic + shadcn pattern → compat).
3. **Classifier order change**: raw primitives → canonical; semantic matching `SHADCN_BASELINE_SEMANTIC_PATTERN` → `bridge`; other semantic → canonical; unknown → forbidden (matches existing rules, no giant matrix).

## Wiring (if Path B)

| Location | Action |
|----------|--------|
| `token-source.ts` | After existing asserts, call `validateGlobalDefaultTokens(packageTokenKeys)` or merge errors into one throw |
| `token-layer-boundary.ts` | Keep current raw/semantic partition; policy validation is **additional** (unknown = forbidden) |
| CI | Fail on non-empty validation errors; optional: script that prints report |

## Open verification tasks (from your note)

1. **Shadow namespace**: Confirm whether [`bridge.css`](../../packages/shadcn-ui-deprecated/src/afenda-design-system/afenda-design-css/bridge.css) should emit `--shadow-xs` (Tailwind convention) vs `--color-shadow-xs` (current); align policy + generator.
2. **Compatibility aliases**: Keep `primary` / `secondary` / `accent` for stock shadcn; document decision in policy appendix.

## Three-pass rollout (your recommendation)

1. Land **doc + matrix appendix** in `tailwind-shadcn.md`.
2. Run validation against **current** `PACKAGE_TOKEN_KEYS` / generated CSS (report-only first if needed).
3. Tighten bridge / namespaces after report.

## Out of scope

- Feature truth, domain semantics, workflow styling (explicitly excluded from policy).

---

## Checklist (execution)

- [x] Append Global Default Token Policy + paste-ready appendix to `tailwind-shadcn.md` (with naming + overlap note).
- [x] Hybrid: doc matrix is canon; derived classifier in `classify-token-key-authority.ts` (no duplicated TS matrix).
- [x] Overlap resolved by derived rules (shared semantics → `compat`; raw ladders → `canonical`).
- [x] Shadow namespace: generator uses `--shadow-*` via `bridge-theme-line.ts`; doc updated.
- [x] Run package tests after any code changes.
