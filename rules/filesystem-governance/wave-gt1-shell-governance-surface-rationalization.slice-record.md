# Wave GT.1 Shell Governance Surface Rationalization Slice Record

## 1. Slice Identity

- `slice_name`: `Wave GT.1 — Shell Governance Surface Rationalization`
- `ownership_boundary`:
  - `apps/web`: shell curated surface docs and shell public-surface test
  - `packages/eslint-config`: shell curated surface allowlist policy
  - `rules/filesystem-governance`: slice evidence and register update only
  - `apps/api`: no API ownership changes
  - `packages/_database`: no database ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`wave-gt1-shell-governance-surface-rationalization-matrix.md`](./wave-gt1-shell-governance-surface-rationalization-matrix.md), [`README.md`](../../apps/web/src/app/_platform/shell/README.md), [`index.js`](../../packages/eslint-config/src/index.js)
- `forbidden_dependency`: runtime shell cleanup, route composition changes, chunk/performance work, non-governance docs-policy cleanup
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer closing the first bounded `governance-toolchain` shell policy slice after `web-runtime-shell` verification
- `point_a`: `shell-governance-surface.ts` still existed as a curated shell entrypoint, but it exported only a strict subset of `shell-validation-surface.ts`; its surviving consumers were shell docs, the shell public-surface test, and ESLint policy docs/allowlists
- `action`: maintainer retires the duplicate governance alias, migrates policy references to `shell-validation-surface.ts`, and keeps validation/reporting truth on a single curated surface
- `point_c`: shell validation/reporting policy now has one canonical curated surface only: `shell-validation-surface.ts`

Operational path:

1. Verify `shell-governance-surface.ts` is a strict subset of `shell-validation-surface.ts`.
2. Update shell docs, shell public-surface tests, and ESLint boundary policy to reference the canonical validation surface only.
3. Remove the duplicate surface file.
4. Re-run focused shell governance validation and root checks.

## 3. Definition Of Done

- `ui`: not applicable
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: active shell and ESLint docs no longer describe `shell-governance-surface.ts` as a curated shell entrypoint
- `runtime_contract`: no runtime import path depends on the duplicate governance alias
- `failure`: the duplicate file remains, or curated policy docs/allowlists still treat it as a live shell surface
- `enforcement`:
  - `script_check`: `pnpm run script:check-governance`
  - `lint_or_ast_rule`: `pnpm run check`
  - `boundary_rule`: outside `_platform`, shell imports are allowed only through `shell-route-surface`, `shell-layout-surface`, `shell-command-surface`, or `shell-validation-surface`
- `adoption_expansion`:
  - `newly_adopted_surfaces`: none
  - `added_to_enforcement_immediately`: `shell-validation-surface.ts` becomes the sole curated validation/reporting shell surface
- `removed_paths`:
  - `apps/web/src/app/_platform/shell/shell-governance-surface.ts`

## 4. Before State

- existing dependency shape: shell validation/reporting had two curated names even though one was a strict subset of the other
- coupling or ambiguity: ESLint docs/allowlists and shell docs suggested both surfaces were live policy choices
- permission weakness: not applicable
- truth/source weakness: policy truth for shell validation/reporting was duplicated at the curated-surface level
- runtime weakness: low; the duplicate surface was not a runtime-only dependency
- enforcement weakness: shell public-surface tests still required the duplicate governance alias
- validation weakness: none in runtime behavior, but policy drift was still encoded as official guidance

## 5. After State

- final dependency shape: shell validation/reporting has one curated surface, `shell-validation-surface.ts`
- route or page ownership: unchanged
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: shell docs, shell public-surface tests, and ESLint boundary policy now point to one canonical validation/reporting surface only
- runtime behavior: unchanged
- enforcement behavior: the duplicate curated alias is removed from source, docs, tests, and lint policy

## 6. Files And Surfaces Touched

- files touched:
  - [`README.md`](../../apps/web/src/app/_platform/shell/README.md)
  - [`shell-public-surface.test.ts`](../../apps/web/src/app/_platform/shell/__tests__/shell-public-surface.test.ts)
  - [`index.js`](../../packages/eslint-config/src/index.js)
  - [`README.md`](../../packages/eslint-config/README.md)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
  - [`wave-gt1-shell-governance-surface-rationalization-matrix.md`](./wave-gt1-shell-governance-surface-rationalization-matrix.md)
  - [`wave-gt1-shell-governance-surface-rationalization.slice-record.md`](./wave-gt1-shell-governance-surface-rationalization.slice-record.md)
- files removed:
  - `apps/web/src/app/_platform/shell/shell-governance-surface.ts`
- routes touched: none
- contracts touched: none
- tests touched:
  - [`shell-public-surface.test.ts`](../../apps/web/src/app/_platform/shell/__tests__/shell-public-surface.test.ts)
- enforcement touched:
  - shell curated-surface allowlist language in [`index.js`](../../packages/eslint-config/src/index.js)
  - shell governance/readme policy docs

## 7. Validation Evidence

- typecheck: `pnpm run check` reached and passed the root `typecheck` phase before failing later in an unrelated package test
- lint: `pnpm run check` reached and passed the root `lint` phase before failing later in an unrelated package test
- compliance: `pnpm run script:check-governance`
- runtime verification: focused shell public-surface test plus root `pnpm run build`
- targeted tests: `pnpm --filter @afenda/web exec vitest run src/app/_platform/shell/__tests__/shell-public-surface.test.ts --configLoader bundle`
- build: `pnpm run build`
- manual qa: not executed

Validation not executed:

- manual browser QA, because this slice changes policy surfaces only and does not alter shell runtime behavior
- a fully green root `pnpm run check` within this slice; the temporary external blocker was resolved later in [`wave-dt1-package-modules-smoke-hardening.slice-record.md`](./wave-dt1-package-modules-smoke-hardening.slice-record.md)

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.6`
- `truth_correctness`: `9.7`
- `permission_correctness`: `8.2`
- `api_contract_quality`: `8.7`
- `frontend_separation`: `9.2`
- `test_coverage_for_slice`: `9.1`
- `refactor_safety`: `9.8`
- `operational_maturity`: `9.4`

Overall:

- `before_score`: `9.5`
- `after_score`: `9.6`
- `net_improvement`: `0.1`

## 9. What Improved

- The shell no longer exposes two curated names for the same validation/reporting policy surface.
- ESLint import-boundary policy now names one canonical shell validation entrypoint instead of a duplicate alias pair.
- Shell public-surface tests now enforce the canonical validation surface directly.

## 10. Remaining Debt

- `shell-validation-surface.ts` still carries both validation helpers and governance/reporting exports; if those need separate policy identities later, that should happen as a new deliberate governance slice, not by reintroducing an alias. `non_blocking_followup`
- Bundle-size and marketing/editorial audit debt remain separate health slices. `separate_health_slice`
- Reviewed-survival adoption remains a separate Wave B foundation lane. `separate_foundation_lane`
- Temporary repo-wide green-state drift caused by `packages/_database/src/__tests__/package-modules.smoke.test.ts` was resolved later in [`wave-dt1-package-modules-smoke-hardening.slice-record.md`](./wave-dt1-package-modules-smoke-hardening.slice-record.md). `resolved_followup`

## 11. Lessons To Apply Immediately

- contract improvements: do not keep duplicate curated surfaces when one is a strict export superset of the other
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: lint allowlists should name the canonical policy surface only
- runtime-contract improvements: governance aliases should not be preserved just because they are referenced in docs/tests
- validation improvements: focused shell surface tests plus root governance and root check are sufficient for curated-surface rationalization
- anti-drift improvements: policy docs and policy allowlists must move in the same slice as curated-surface retirement

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not applicable
- permission enforced only in UI: not applicable
- fallback path masking missing authority: duplicate curated aliases can survive long after they stop adding distinct value
- workspace projection leaking into truth surfaces: duplicate policy names create false choice in consumer guidance
- broad cleanup attempted instead of bounded closure: avoided by limiting GT.1 to one governance alias and its direct policy dependents

Add specific notes:

- A policy surface is still repo debt when it duplicates another curated surface exactly or by strict subset.
- Governance cleanup should remove duplicate official names before teams depend on both.

## 13. Enforcement Upgrade Rule

- do not add duplicate curated shell surfaces when an existing surface already owns the same policy contract
- when a curated shell surface is retired, update shell docs, shell public-surface tests, and ESLint boundary docs in the same slice
- keep governance-toolchain slices policy-bounded; do not widen them into runtime cleanup

## 14. Next Slice Recommendation

- `recommended_next_slice`: `governance-toolchain follow-up for the next duplicate or transitional policy surface only if it has the same high-confidence closure profile`
- `why_this_next`: the runtime shell lane is already verified; further closure should now focus on bounded policy truth, not runtime deletion
- `must_not_mix_with`: runtime shell feature work, route composition changes, performance waves, or docs-policy work outside direct governance surfaces

## 15. Closure Statement

`This slice is closed when shell validation/reporting policy uses one canonical curated surface only, the duplicate governance alias is removed from source/docs/tests/lint policy, and any remaining root-gate blocker is explicitly outside this bounded governance slice.`
