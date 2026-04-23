# Wave DT.1 Package Modules Smoke Hardening Slice Record

## 1. Slice Identity

- `slice_name`: `Wave DT.1 — Package Modules Smoke Hardening`
- `ownership_boundary`:
  - `packages/_database`: package smoke test only
  - `rules/filesystem-governance`: bounded closure evidence only
  - `apps/web`: no ownership changes
  - `apps/api`: no ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`wave-dt1-package-modules-smoke-hardening-matrix.md`](./wave-dt1-package-modules-smoke-hardening-matrix.md), [`package-modules.smoke.test.ts`](../../packages/_database/src/__tests__/package-modules.smoke.test.ts)
- `forbidden_dependency`: schema changes, query behavior changes, docs-policy cleanup, performance-wave work
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer re-establishing repo green-state by fixing the one load-sensitive database test that failed only under aggregated workload
- `point_a`: `package-modules.smoke.test.ts` used the default 5s timeout and a bursty `Promise.all()` import of several heavy declarative barrels; the test passed in isolation but timed out under the combined Turbo/Vitest run
- `action`: maintainer hardens that one smoke test with an explicit timeout sized for aggregate workload and deterministic sequential module loading
- `point_c`: the database package keeps the same coverage-load proof, but the repo-wide `test:run` and full root `check` no longer fail on this timing-sensitive test

Operational path:

1. Confirm the failure reproduces only under aggregated repo workload.
2. Change the smoke test only; do not widen into schema or runtime behavior.
3. Re-run package-level `test:run`, repo-wide `test:run`, and full root `check`.

## 3. Definition Of Done

- `ui`: not applicable
- `api`: not applicable
- `db`: package module coverage-load test is stable under aggregate workload
- `permission`: not applicable
- `truth`: closure evidence states clearly that this slice hardens test workload sensitivity only
- `runtime_contract`: no database schema, query, or export contract changed
- `failure`: repo-wide `test:run` or root `check` still fail on `package-modules.smoke.test.ts`
- `enforcement`:
  - `script_check`: `pnpm run check`
  - `package_test`: `pnpm --filter @afenda/database run test:run`
  - `repo_test`: `pnpm run test:run`
- `adoption_expansion`:
  - `newly_adopted_surfaces`: none
  - `added_to_enforcement_immediately`: explicit timeout and deterministic load order for the package module smoke test
- `removed_paths`: none

## 4. Before State

- existing dependency shape: one database package smoke test imported the schema/relations/views/queries/migrations/audit/studio graph in parallel under the default test timeout
- coupling or ambiguity: the test looked like a simple import smoke, but its real workload was sensitive to aggregate transform/import pressure
- permission weakness: not applicable
- truth/source weakness: repo root `check` could fail even though the database package and isolated test were functionally healthy
- runtime weakness: none in product behavior
- enforcement weakness: the repo had one unstable quality gate in the database-truth lane
- validation weakness: the previous database test contract did not reflect real aggregate-run cost

## 5. After State

- final dependency shape: the database package still loads the same declarative module graph for coverage completeness
- route or page ownership: unchanged
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: closure evidence now records that this slice was pure test hardening, not schema or runtime change
- runtime behavior: unchanged
- enforcement behavior: package-level `test:run`, repo-wide `test:run`, and full root `check` now pass in this slice

## 6. Files And Surfaces Touched

- files touched:
  - [`package-modules.smoke.test.ts`](../../packages/_database/src/__tests__/package-modules.smoke.test.ts)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
  - [`wave-dt1-package-modules-smoke-hardening-matrix.md`](./wave-dt1-package-modules-smoke-hardening-matrix.md)
  - [`wave-dt1-package-modules-smoke-hardening.slice-record.md`](./wave-dt1-package-modules-smoke-hardening.slice-record.md)
- files removed: none
- routes touched: none
- contracts touched: none
- tests touched:
  - [`package-modules.smoke.test.ts`](../../packages/_database/src/__tests__/package-modules.smoke.test.ts)
- enforcement touched:
  - database package test stability under aggregate workload

## 7. Validation Evidence

- typecheck: `pnpm run check` (`pnpm run typecheck` phase)
- lint: `pnpm run check` (`pnpm run lint` phase)
- compliance: `pnpm run check` and `pnpm run script:check-governance`
- runtime verification: not applicable; no product runtime changed
- targeted tests: `pnpm --filter @afenda/database run test:run`
- repo-wide tests: `pnpm run test:run`
- build: `pnpm run check` (`pnpm run build` phase)
- manual qa: not executed

Validation not executed:

- manual browser QA, because this slice changes only database package test mechanics

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.7`
- `truth_correctness`: `9.5`
- `permission_correctness`: `8.1`
- `api_contract_quality`: `8.6`
- `frontend_separation`: `8.0`
- `test_coverage_for_slice`: `9.4`
- `refactor_safety`: `9.8`
- `operational_maturity`: `9.6`

Overall:

- `before_score`: `9.3`
- `after_score`: `9.6`
- `net_improvement`: `0.3`

## 9. What Improved

- The database package smoke test now reflects its true aggregate-workload cost instead of assuming an isolated-run timeout budget.
- Repo-wide `test:run` is stable again.
- Full root `check` is green again.

## 10. Remaining Debt

- The database package still has several slow tests under aggregate load; they now pass, but they remain part of the general test-runtime cost profile. `non_blocking_followup`
- Bundle-size and marketing/editorial audit debt remain separate health slices. `separate_health_slice`
- Reviewed-survival adoption remains a separate Wave B foundation lane. `separate_foundation_lane`

## 11. Lessons To Apply Immediately

- contract improvements: test timeout budgets should match real aggregate-workload cost for heavy coverage/import guards
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: do not widen a timing fix into a schema or runtime change
- validation improvements: reproduce the failing gate at package scope, repo-wide test scope, and root `check` scope before calling the slice closed
- anti-drift improvements: deterministic sequential imports are safer than bursty `Promise.all()` for heavy declarative coverage guards

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not applicable
- permission enforced only in UI: not applicable
- fallback path masking missing authority: isolated test passes can hide aggregate-workload failures
- workspace projection leaking into truth surfaces: not applicable
- broad cleanup attempted instead of bounded closure: avoided by limiting DT.1 to one smoke test and closure evidence only

Add specific notes:

- A flaky quality gate is repo debt even when the underlying code is correct.
- Test hardening is legitimate closure work when the failure mode is workload sensitivity, not product logic.

## 13. Enforcement Upgrade Rule

- heavy package coverage-load smoke tests must declare a realistic timeout budget explicitly
- when import cost is the point of the test, prefer deterministic load order over bursty parallel import spikes
- keep database-truth hardening slices test-bounded unless schema or query behavior is actually under change

## 14. Next Slice Recommendation

- `recommended_next_slice`: `pause closure slicing and reassess remaining non-doc debt only after the repo stays green through the current gate set`
- `why_this_next`: the immediate goal was re-establishing root green-state, and that goal is now met
- `must_not_mix_with`: unrelated schema expansion, runtime feature work, or policy cleanup without a new bounded slice

## 15. Closure Statement

`This slice is closed when the database package coverage-load smoke test is stable under the aggregated repo workload, repo-wide test:run passes, and full root check is green again without widening the lane into schema or runtime changes.`
