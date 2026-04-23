# Wave C.7 Shell Route-Handle Path Retirement Slice Record

## 1. Slice Identity

- `slice_name`: `Wave C.7 — Shell Route-Handle Path Retirement`
- `ownership_boundary`:
  - `apps/web`: shell contract/docs and route docs only
  - `apps/api`: no API ownership changes
  - `packages/_database`: no database ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`wave-c7-shell-route-handle-path-matrix.md`](./wave-c7-shell-route-handle-path-matrix.md), [`apps/web/src/app/_platform/shell/shell-route-handle.ts`](../../apps/web/src/app/_platform/shell/shell-route-handle.ts)
- `forbidden_dependency`: broader shell refactors, docs-policy cleanup, package cleanup, performance work
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer closing one bounded shell delete/quarantine slice after the live route-handle augmentation moved out of `types/`
- `point_a`: the deleted `types/shell-route-handle.ts` path no longer existed, but shell contract comments and route docs still treated it as the active surface
- `action`: maintainer updates shell contract/docs to point only at `shell-route-handle.ts` and records the retirement as a bounded runtime-shell lane
- `point_c`: shell truth surfaces now reference only the live route-handle augmentation file, with no stale deleted-path guidance

Operational path:

1. Locate every remaining reference to the deleted `types/shell-route-handle.ts` path.
2. Confirm the live augmentation surface is `shell-route-handle.ts`.
3. Update the shell contract and route documentation to the live path only.
4. Re-run shell-focused validation and root repo checks.

## 3. Definition Of Done

- `ui`: not applicable
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: no active shell contract/doc references the deleted `types/shell-route-handle.ts` path
- `runtime_contract`: route-handle augmentation is documented only through `shell-route-handle.ts`
- `failure`: stale deleted-path references remain in active shell docs/contracts
- `enforcement`:
  - `script_check`: `pnpm run script:check-governance`
  - `lint_or_ast_rule`: root `pnpm run check`
  - `boundary_rule`: the shell route-handle augmentation has one active path surface only
- `adoption_expansion`:
  - `newly_adopted_surfaces`: none
  - `added_to_enforcement_immediately`: shell contract/docs now encode the live path directly
- `removed_paths`:
  - deleted-path references to `types/shell-route-handle.ts`

## 4. Before State

- existing dependency shape: `shell-route-handle.ts` was already the live augmentation file
- coupling or ambiguity: shell contract comments and route docs still pointed at the deleted `types/` path
- permission weakness: not applicable
- truth/source weakness: active documentation lagged behind the live shell augmentation surface
- runtime weakness: low; runtime code already used the correct file
- enforcement weakness: no explicit closure evidence existed for the old path retirement
- validation weakness: the shell lane had not yet closed this small but real stale-surface debt

## 5. After State

- final dependency shape: shell contract/docs point only at `shell-route-handle.ts`
- route or page ownership: unchanged
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: the shell route-handle augmentation has one documented active surface
- runtime behavior: unchanged; runtime already used the correct surface
- enforcement behavior: the lane now has explicit closure evidence for the deleted-path retirement

## 6. Files And Surfaces Touched

- files touched:
  - [`shell-route-metadata-contract.ts`](../../apps/web/src/app/_platform/shell/contract/shell-route-metadata-contract.ts)
  - [`README.md`](../../apps/web/src/routes/README.md)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
  - [`wave-c7-shell-route-handle-path-matrix.md`](./wave-c7-shell-route-handle-path-matrix.md)
  - [`wave-c7-shell-route-handle-path-retirement.slice-record.md`](./wave-c7-shell-route-handle-path-retirement.slice-record.md)
- routes touched: route docs only
- contracts touched: shell route metadata contract comment
- tests touched: none
- enforcement touched: bounded shell lane evidence
- removed paths or fallback logic:
  - stale deleted-path references only

## 7. Validation Evidence

- typecheck: `pnpm run check` (`pnpm run typecheck` phase)
- lint: `pnpm run check` (`pnpm run lint` phase)
- compliance: `pnpm run script:check-governance`
- runtime verification: `pnpm run check`
- targeted tests: `pnpm --filter @afenda/web exec vitest run src/app/_platform/shell/__tests__/shell-public-surface.test.ts src/app/_platform/shell/__tests__/route-app-shell-parity.test.ts --configLoader bundle`
- build: `pnpm run check` (`pnpm run build` phase)
- manual qa: not executed

Validation not executed:

- manual browser QA, because this slice only corrected contract/docs truth and did not change runtime behavior

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.2`
- `truth_correctness`: `9.4`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `8.8`
- `test_coverage_for_slice`: `8.6`
- `refactor_safety`: `9.6`
- `operational_maturity`: `9.1`

Overall:

- `before_score`: `9.2`
- `after_score`: `9.3`
- `net_improvement`: `0.1`

## 9. What Improved

- Shell contract/docs no longer point at a deleted route-handle path.
- The shell route-handle augmentation now has one explicit documented active surface.
- The runtime-shell lane has an evidence-backed closure record for this stale-path retirement.

## 10. Remaining Debt

- Broader shell public-surface reduction is still a separate lane and was not mixed into this slice. `non_blocking_followup`
- Shell docs outside this exact path-retirement target may still need future precision work. `non_blocking_followup`
- Bundle-size and marketing/editorial audit debt remain separate health slices. `separate_health_slice`

## 11. Lessons To Apply Immediately

- contract improvements: when a governed path moves, comments and local READMEs must be updated in the same wave or stale truth survives
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: a small shell lane can close stale-surface debt without reopening broader shell refactors
- validation improvements: two focused shell tests plus the root gate are enough for path-surface retirement
- anti-drift improvements: deleted path surfaces should not survive in explanatory comments

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not applicable
- permission enforced only in UI: not applicable
- fallback path masking missing authority: stale docs can preserve deleted paths long after the runtime moved
- workspace projection leaking into truth surfaces: not applicable
- broad cleanup attempted instead of bounded closure: avoided by limiting C.7 to one path-surface retirement

Add specific notes:

- Small stale paths still matter because they mislead future refactors.
- Runtime correctness is not enough; the contract surface has to tell the same truth.

## 13. Enforcement Upgrade Rule

- when a governed shell file moves, update route docs and shell contract comments in the same slice
- do not keep deleted path surfaces alive in comments, READMEs, or examples
- small shell cleanup lanes should stay path-specific unless runtime behavior actually changes

## 14. Next Slice Recommendation

- `recommended_next_slice`: `web-runtime-shell public-surface or dead-path follow-up`
- `why_this_next`: the current shell lane proved the path-surface cleanup pattern without widening into larger shell churn
- `must_not_mix_with`: docs-policy rework, governance-toolchain policy changes, or unrelated app feature work

## 15. Closure Statement

`This slice is closed when the deleted shell route-handle path is no longer referenced by active shell contract/docs, the live augmentation surface is explicit, and repo green-state remains intact.`
