# Wave C.9 Shell Header-Actions Hook Retirement Slice Record

## 1. Slice Identity

- `slice_name`: `Wave C.9 — Shell Header-Actions Hook Retirement`
- `ownership_boundary`:
  - `apps/web`: shell hook file and shell README only
  - `apps/api`: no API ownership changes
  - `packages/_database`: no database ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`wave-c9-shell-header-actions-hook-matrix.md`](./wave-c9-shell-header-actions-hook-matrix.md), [`README.md`](../../apps/web/src/app/_platform/shell/README.md)
- `forbidden_dependency`: broader shell refactors, docs-policy cleanup, package cleanup, performance work
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer closing one bounded shell stale-surface slice after shell public-surface truth alignment
- `point_a`: the shell still carried `use-shell-header-actions.ts`, but the hook had no runtime consumers and no public surface; only shell docs still described it as active runtime wiring
- `action`: maintainer removes the dead hook and aligns the shell README with the real header-action runtime path
- `point_c`: shell header-action truth now reflects the actual code path only: route metadata -> validation -> resolver -> presentation consumer if needed

Operational path:

1. Verify `useShellHeaderActions` has no runtime or public-surface consumers.
2. Remove the dead hook file.
3. Update shell docs so they no longer describe a non-existent runtime hook dependency.
4. Re-run governance and root checks.

## 3. Definition Of Done

- `ui`: not applicable
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: active shell docs no longer claim a dedicated `useShellHeaderActions()` hook exists
- `runtime_contract`: shell header-action metadata remains governed through contract, validation, and resolver only
- `failure`: the dead hook file remains or active shell docs still describe it as part of runtime wiring
- `enforcement`:
  - `script_check`: `pnpm run script:check-governance`
  - `lint_or_ast_rule`: root `pnpm run check`
  - `boundary_rule`: active shell docs must not describe dead internal runtime shims as live surfaces
- `adoption_expansion`:
  - `newly_adopted_surfaces`: none
  - `added_to_enforcement_immediately`: shell docs now encode the real header-action runtime path directly
- `removed_paths`:
  - `apps/web/src/app/_platform/shell/hooks/use-shell-header-actions.ts`

## 4. Before State

- existing dependency shape: route metadata, validation, and resolver already existed; the hook was an unconsumed wrapper around them
- coupling or ambiguity: shell docs still described the hook as part of header-action runtime wiring
- permission weakness: not applicable
- truth/source weakness: future work could preserve or copy a dead wrapper because docs said it was active
- runtime weakness: low; no runtime surface depended on the hook
- enforcement weakness: no explicit closure evidence existed for the dead-hook retirement
- validation weakness: the shell lane had not yet closed this unused internal shim

## 5. After State

- final dependency shape: header-action metadata is governed by contract, validated by `validateShellMetadata`, and resolved by `resolveShellHeaderActions` without an unused wrapper hook
- route or page ownership: unchanged
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: shell docs now describe the real header-action runtime path only
- runtime behavior: unchanged
- enforcement behavior: the lane now has explicit closure evidence for dead-hook retirement

## 6. Files And Surfaces Touched

- files touched:
  - [`README.md`](../../apps/web/src/app/_platform/shell/README.md)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
  - [`wave-c9-shell-header-actions-hook-matrix.md`](./wave-c9-shell-header-actions-hook-matrix.md)
  - [`wave-c9-shell-header-actions-hook-retirement.slice-record.md`](./wave-c9-shell-header-actions-hook-retirement.slice-record.md)
- files removed:
  - `apps/web/src/app/_platform/shell/hooks/use-shell-header-actions.ts`
- routes touched: none
- contracts touched: none
- tests touched: none
- enforcement touched: bounded shell lane evidence

## 7. Validation Evidence

- typecheck: `pnpm run check` (`pnpm run typecheck` phase)
- lint: `pnpm run check` (`pnpm run lint` phase)
- compliance: `pnpm run script:check-governance`
- runtime verification: `pnpm run check`
- targeted tests: none required; the removed hook had no runtime consumers and no dedicated tests
- build: `pnpm run check` (`pnpm run build` phase)
- manual qa: not executed

Validation not executed:

- manual browser QA, because this slice removed an unused internal hook only

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.4`
- `truth_correctness`: `9.5`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `9.1`
- `test_coverage_for_slice`: `8.3`
- `refactor_safety`: `9.8`
- `operational_maturity`: `9.2`

Overall:

- `before_score`: `9.4`
- `after_score`: `9.5`
- `net_improvement`: `0.1`

## 9. What Improved

- The shell no longer carries an unused internal hook wrapper with no consumers.
- Shell docs no longer describe a dead hook as part of the header-action runtime path.
- The runtime-shell lane has an evidence-backed closure record for dead-hook retirement.

## 10. Remaining Debt

- Header-action presentation remains future-facing; a dedicated runtime hook should only return if a real multi-consumer surface appears. `non_blocking_followup`
- Broader shell public-surface reduction is still a separate lane. `non_blocking_followup`
- Bundle-size and marketing/editorial audit debt remain separate health slices. `separate_health_slice`

## 11. Lessons To Apply Immediately

- contract improvements: keep governed contracts and validation even when a convenience hook is removed
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: wrapper hooks should not survive without real consumers
- validation improvements: root governance plus root check are sufficient when a deleted shell shim has no public or tested surface
- anti-drift improvements: docs should name the real runtime path, not a dead abstraction

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not applicable
- permission enforced only in UI: not applicable
- fallback path masking missing authority: dead wrapper hooks can survive if docs keep naming them
- workspace projection leaking into truth surfaces: not applicable
- broad cleanup attempted instead of bounded closure: avoided by limiting C.9 to one dead internal hook

Add specific notes:

- Dead internal APIs are still repo debt even if they never escaped into a public surface.
- A governed resolver is enough; not every governed path needs a convenience hook.

## 13. Enforcement Upgrade Rule

- do not keep shell wrapper hooks without active consumers
- when a dead internal hook is removed, update the nearest shell README in the same slice
- keep shell cleanup lanes shim-specific unless runtime behavior actually changes

## 14. Next Slice Recommendation

- `recommended_next_slice`: `web-runtime-shell follow-up for another bounded stale surface or compatibility shim`
- `why_this_next`: the shell lane can keep removing low-risk stale surfaces without widening into broader runtime churn
- `must_not_mix_with`: governance-toolchain policy hardening, docs-policy rework, or unrelated feature work

## 15. Closure Statement

`This slice is closed when the dead shell header-actions hook is removed, active shell docs describe only the real header-action runtime path, and repo green-state remains intact.`
