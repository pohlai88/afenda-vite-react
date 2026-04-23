# Wave C.8 Shell Public-Surface Truth Alignment Slice Record

## 1. Slice Identity

- `slice_name`: `Wave C.8 — Shell Public-Surface Truth Alignment`
- `ownership_boundary`:
  - `apps/web`: shell README, shell breadcrumb doc, and route README
  - `docs`: app-shell supporting spec only
  - `apps/api`: no API ownership changes
  - `packages/_database`: no database ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`wave-c8-shell-public-surface-truth-matrix.md`](./wave-c8-shell-public-surface-truth-matrix.md), [`README.md`](../../apps/web/src/app/_platform/shell/README.md), [`breadcrumbs.readme.md`](../../apps/web/src/app/_platform/shell/docs/breadcrumbs.readme.md), [`README.md`](../../apps/web/src/routes/README.md), [`APP_SHELL_SPEC.md`](../../docs/APP_SHELL_SPEC.md)
- `forbidden_dependency`: broader shell refactors, docs-policy cleanup, package cleanup, performance work
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer closing one bounded shell truth-alignment slice after the shell route-handle path retirement
- `point_a`: shell docs still documented non-existent `AppShellBreadcrumb`, `AppShellHeader`, and `AppShellHeaderActions` surfaces, and route docs still claimed the root shell barrel was the route-metadata surface
- `action`: maintainer aligns shell docs with the live `ShellTopNav`, `ShellTopNavBreadcrumbs`, context-bar usage, and `shell-route-surface.ts`
- `point_c`: active shell truth surfaces now describe the real breadcrumb/top-nav runtime and the real route-composition surface only

Operational path:

1. Locate stale shell public-surface names and false route-surface claims.
2. Confirm the live runtime uses `ShellTopNav`, `ShellTopNavBreadcrumbs`, and curated shell surfaces.
3. Update shell, route, and app-shell docs to the live surface names only.
4. Re-run shell-focused validation and root repo checks.

## 3. Definition Of Done

- `ui`: not applicable
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: active shell docs no longer document `AppShellBreadcrumb`, `AppShellHeader`, or `AppShellHeaderActions` as live runtime surfaces
- `runtime_contract`: route docs point at `shell-route-surface.ts` for route composition, and shell docs point at `ShellTopNav` / `ShellTopNavBreadcrumbs`
- `failure`: stale fake shell surfaces remain in active shell/runtime docs
- `enforcement`:
  - `script_check`: `pnpm run script:check-governance`
  - `lint_or_ast_rule`: root `pnpm run check`
  - `boundary_rule`: active shell docs must not drift from the actual shell composition surfaces
- `adoption_expansion`:
  - `newly_adopted_surfaces`: none
  - `added_to_enforcement_immediately`: shell/runtime docs now encode the current curated surfaces directly
- `removed_paths`:
  - fake `AppShellBreadcrumb` / `AppShellHeader` / `AppShellHeaderActions` truth
  - false root-barrel route-surface claim

## 4. Before State

- existing dependency shape: runtime shell already used `ShellTopNav`, `ShellTopNavBreadcrumbs`, `ShellContextBar`, and curated route/layout surfaces
- coupling or ambiguity: shell docs preserved fake chrome names and an outdated root-barrel route-surface claim
- permission weakness: not applicable
- truth/source weakness: future refactors could follow stale shell docs instead of live runtime composition
- runtime weakness: low; runtime code already used the correct surfaces
- enforcement weakness: no explicit closure evidence existed for this public-surface truth drift
- validation weakness: the shell lane had not yet closed this shell-topology documentation debt

## 5. After State

- final dependency shape: shell docs point at `ShellTopNav`, `ShellTopNavBreadcrumbs`, shell-internal breadcrumb plumbing, and `shell-route-surface.ts`
- route or page ownership: unchanged
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: shell public-surface docs now match the live runtime/topology
- runtime behavior: unchanged
- enforcement behavior: the lane now has explicit closure evidence for shell public-surface truth alignment

## 6. Files And Surfaces Touched

- files touched:
  - [`README.md`](../../apps/web/src/app/_platform/shell/README.md)
  - [`breadcrumbs.readme.md`](../../apps/web/src/app/_platform/shell/docs/breadcrumbs.readme.md)
  - [`README.md`](../../apps/web/src/routes/README.md)
  - [`APP_SHELL_SPEC.md`](../../docs/APP_SHELL_SPEC.md)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
  - [`wave-c8-shell-public-surface-truth-matrix.md`](./wave-c8-shell-public-surface-truth-matrix.md)
  - [`wave-c8-shell-public-surface-truth-alignment.slice-record.md`](./wave-c8-shell-public-surface-truth-alignment.slice-record.md)
- routes touched: route docs only
- contracts touched: none
- tests touched: none
- enforcement touched: bounded shell lane evidence
- removed paths or fallback logic:
  - fake shell chrome names in active docs

## 7. Validation Evidence

- typecheck: `pnpm run check` (`pnpm run typecheck` phase)
- lint: `pnpm run check` (`pnpm run lint` phase)
- compliance: `pnpm run script:check-governance`
- runtime verification: `pnpm run check`
- targeted tests: `pnpm --filter @afenda/web exec vitest run src/app/_platform/shell/__tests__/shell-public-surface.test.ts src/app/_platform/shell/__tests__/route-app-shell-parity.test.ts --configLoader bundle`
- build: `pnpm run check` (`pnpm run build` phase)
- manual qa: not executed

Validation not executed:

- manual browser QA, because this slice only corrected shell truth surfaces and did not change runtime behavior

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.3`
- `truth_correctness`: `9.5`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `9.0`
- `test_coverage_for_slice`: `8.6`
- `refactor_safety`: `9.7`
- `operational_maturity`: `9.2`

Overall:

- `before_score`: `9.3`
- `after_score`: `9.4`
- `net_improvement`: `0.1`

## 9. What Improved

- Shell docs no longer document non-existent breadcrumb/header surfaces as live runtime APIs.
- Route docs now point at `shell-route-surface.ts` instead of the root shell barrel for route composition.
- The runtime-shell lane has an evidence-backed closure record for shell public-surface truth alignment.

## 10. Remaining Debt

- Broader shell public-surface reduction is still a separate lane and was not mixed into this slice. `non_blocking_followup`
- Some shell internals remain intentionally non-public and may later need an explicit secondary surface if reuse becomes real. `non_blocking_followup`
- Bundle-size and marketing/editorial audit debt remain separate health slices. `separate_health_slice`

## 11. Lessons To Apply Immediately

- contract improvements: when shell runtime naming changes, shell docs and supporting app-shell docs must move in the same slice
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: curated secondary shell surfaces only work if docs stop pointing callers at the broad root barrel
- validation improvements: two focused shell tests plus the root gate are enough for shell truth-alignment slices
- anti-drift improvements: fake component names are still stale public surfaces even when no code imports them

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not applicable
- permission enforced only in UI: not applicable
- fallback path masking missing authority: docs can keep dead shell abstractions alive long after runtime moved on
- workspace projection leaking into truth surfaces: not applicable
- broad cleanup attempted instead of bounded closure: avoided by limiting C.8 to shell public-surface truth only

Add specific notes:

- Runtime correctness is not enough; the shell lane also needs public-surface correctness.
- Root barrels should not be documented as curated route surfaces when secondary surfaces already exist.

## 13. Enforcement Upgrade Rule

- when shell runtime naming changes, update shell READMEs and direct supporting docs in the same slice
- do not document the root shell barrel as the route surface if a curated route surface exists
- small shell cleanup lanes should stay naming/topology-specific unless runtime behavior actually changes

## 14. Next Slice Recommendation

- `recommended_next_slice`: `web-runtime-shell follow-up for another bounded stale surface or compatibility shim`
- `why_this_next`: the current shell lane proved a second shell-truth retirement pattern without widening into runtime churn
- `must_not_mix_with`: docs-policy rework, governance-toolchain policy changes, or unrelated app feature work

## 15. Closure Statement

`This slice is closed when active shell and app-shell docs describe only the live top-nav/breadcrumb and route-composition surfaces, with no fake shell public APIs left in active truth and repo green-state intact.`
