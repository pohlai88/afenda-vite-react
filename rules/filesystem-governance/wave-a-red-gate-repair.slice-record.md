# Wave A Red Gate Repair Slice Record

## 1. Slice Identity

- `slice_name`: `Wave A — Red Gate Repair`
- `ownership_boundary`:
  - `apps/web`: runtime i18n blockers, test stability, and lint blockers in the active web surface
  - `apps/api`: no API contract change required
  - `packages/_database`: no schema ownership in this slice
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`docs/TESTING.md`](../../docs/TESTING.md), [`docs/VITE_ENTERPRISE_WORKSPACE.md`](../../docs/VITE_ENTERPRISE_WORKSPACE.md)
- `forbidden_dependency`: broad deletion, archive moves, naming waves, and unrelated performance restructuring
- `status`: `closed`

## 2. Primary Contract

- `actor`: repository maintainer relying on root quality gates
- `point_a`: root `check` was red because lint, runtime i18n policy, the marketing registry test, and Windows/Turbo web test execution were not trustworthy together
- `action`: maintainer runs the root governance and quality gates
- `point_c`: root gates pass with runtime i18n scoped correctly, marketing/editorial findings demoted to audit, and the web test suite stable under Turbo

Operational path:

1. Runtime blockers are repaired without widening into broad cleanup.
2. The i18n validator blocks only active runtime-app debt and audits marketing/editorial debt separately.
3. The pathological marketing registry test stops loading every variant module in one assertion.
4. Root `check` completes green with meaningful sequential gates.

## 3. Definition Of Done

- `ui`: runtime hardcoded strings blocking `apps/web/src/app` are localized or removed
- `api`: no new API behavior required
- `db`: no schema changes required
- `permission`: unchanged in this slice
- `truth`: runtime-app versus marketing/editorial i18n policy is explicit and no longer conflated
- `runtime_contract`: root `check` and root `test:run` are trustworthy on the current Windows/Turbo path
- `failure`: marketing/editorial copy remains visible as audit warnings without red-gating runtime release
- `enforcement`:
  - `script_check`: `scripts/validate-i18n.ts`, root `check`, root `test:run`
  - `lint_or_ast_rule`: existing ESLint gates remain active; the trivial lint blocker is removed
  - `boundary_rule`: runtime-app i18n remains blocking, marketing/editorial remains audit-only during closure
- `adoption_expansion`:
  - `newly_adopted_surfaces`: reviewed-survival foundation was wired in parallel, but it is not the success criterion for Wave A
  - `added_to_enforcement_immediately`: root `check` now includes root-script sequencing and the file-survival governance step
- `removed_paths`: none

## 4. Before State

- existing dependency shape: root `check` mixed governance, lint, typecheck, tests, and build in one broad Turbo invocation
- coupling or ambiguity: runtime i18n debt and marketing/editorial copy debt were mixed into one blocking policy
- permission weakness: none introduced by this slice
- truth/source weakness: marketing/editorial hardcoded copy created false-positive runtime i18n failures
- runtime weakness: the marketing registry test loaded every variant module and the web Vitest worker pool could time out under Turbo on Windows
- enforcement weakness: red gates existed, but they were not trustworthy
- validation weakness: docs README generation also failed because of a duplicate title in the rules index

## 5. After State

- final dependency shape: root `check` runs governance, app-surface, i18n, lint, typecheck, test, and build as explicit sequential gates
- route or page ownership: unchanged except for runtime-app text moving onto shell locale keys
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: runtime-app i18n is blocking; marketing/editorial i18n is audit-only during closure
- runtime behavior: web tests run reliably under Turbo with constrained root concurrency and a Windows Vitest worker ceiling
- enforcement behavior: root `check`, root `test:run`, `script:validate-i18n`, `script:check-governance`, and docs README generation all pass

## 6. Files And Surfaces Touched

- files touched:
  - [`package.json`](../../package.json)
  - [`scripts/validate-i18n.ts`](../../scripts/validate-i18n.ts)
  - [`packages/vitest-config/src/vitest/defaults.ts`](../../packages/vitest-config/src/vitest/defaults.ts)
  - [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts)
  - [`apps/web/src/marketing/__tests__/marketing-page-registry.test.ts`](../../apps/web/src/marketing/__tests__/marketing-page-registry.test.ts)
  - [`apps/web/src/app/_platform/auth/__tests__/require-app-ready.test.tsx`](../../apps/web/src/app/_platform/auth/__tests__/require-app-ready.test.tsx)
  - [`apps/web/src/app/_features/events-workspace/components/events-workspace-pages.tsx`](../../apps/web/src/app/_features/events-workspace/components/events-workspace-pages.tsx)
  - [`apps/web/src/app/_features/hono/users/users.view.tsx`](../../apps/web/src/app/_features/hono/users/users.view.tsx)
  - [`apps/web/src/app/_features/events-workspace/__tests__/events-workspace-pages.test.tsx`](../../apps/web/src/app/_features/events-workspace/__tests__/events-workspace-pages.test.tsx)
  - [`apps/web/src/app/_platform/i18n/locales/en/shell.json`](../../apps/web/src/app/_platform/i18n/locales/en/shell.json)
  - [`apps/web/src/app/_platform/i18n/locales/id/shell.json`](../../apps/web/src/app/_platform/i18n/locales/id/shell.json)
  - [`apps/web/src/app/_platform/i18n/locales/ms/shell.json`](../../apps/web/src/app/_platform/i18n/locales/ms/shell.json)
  - [`apps/web/src/app/_platform/i18n/locales/vi/shell.json`](../../apps/web/src/app/_platform/i18n/locales/vi/shell.json)
  - [`rules/filesystem-governance/ui-operating-surface-baseline.slice-record.md`](./ui-operating-surface-baseline.slice-record.md)
- routes touched: none
- contracts touched: runtime locale contract only
- tests touched: marketing registry, events workspace, and auth readiness
- enforcement touched: root `check`, root `test:run`, runtime i18n validator, docs README generator
- removed paths or fallback logic: removed the duplicate-title condition and removed registry all-variant module loading from the test

## 7. Validation Evidence

List only commands or checks actually executed.

- typecheck: `pnpm run check` (`pnpm run typecheck` phase passed)
- lint: `pnpm run lint`; `pnpm run check` (`pnpm run lint` phase passed)
- compliance: `pnpm run script:check-governance`; `pnpm run script:validate-i18n`; `pnpm run script:generate-docs-readme`
- runtime verification: `pnpm run test:run`; `pnpm run check`
- targeted tests: `pnpm --filter @afenda/web exec vitest run src/app/_features/events-workspace/__tests__/events-workspace-pages.test.tsx src/marketing/__tests__/marketing-page-registry.test.ts --configLoader bundle`
- build: `pnpm run check` (`pnpm run build` phase passed)
- manual qa: not executed

Validation not executed:

- dedicated manual browser QA for the localized events workspace and users demo surfaces

## 8. Evaluation Scorecard

Score from `0.0` to `10.0`.

- `boundary_clarity`: `8.5`
- `truth_correctness`: `8.8`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `8.4`
- `test_coverage_for_slice`: `8.3`
- `refactor_safety`: `8.7`
- `operational_maturity`: `8.9`

Overall:

- `before_score`: `5.6`
- `after_score`: `8.6`
- `net_improvement`: `3.0`

## 9. What Improved

- Root quality gates are green again, including the previously failing root `check`.
- Runtime i18n now blocks only real app-runtime debt while marketing/editorial copy remains visible as audit.
- Turbo-driven web test execution is stable on the current Windows path instead of timing out on worker startup.

## 10. Remaining Debt

- Build still reports oversized web chunks and needs a Wave D chunk treatment matrix. `separate_health_slice`
- Marketing canonical/alias policy is still not explicit enough for closure beyond green. `blocking_next_slice`
- Worktree stabilization remains necessary because the repo is still carrying many mixed-domain edits. `blocking_next_slice`

## 11. Lessons To Apply Immediately

- contract improvements: quality gates should be sequenced when one broad Turbo invocation obscures the real failing surface
- serializer or response-shape improvements: not applicable in this slice
- permission-boundary improvements: do not mix permission and localization debt into the same gate
- runtime-contract improvements: default worker ceilings matter on Windows when one package owns a very large Vitest surface
- validation improvements: audit-only marketing/editorial findings keep the gate honest without hiding debt
- anti-drift improvements: each closure wave needs its own record and slice register status, not just passing commands

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not the main issue in this slice
- permission enforced only in UI: not exposed here
- fallback path masking missing authority: the old i18n policy masked real runtime debt behind marketing/editorial noise
- workspace projection leaking into truth surfaces: not exposed here
- broad cleanup attempted instead of bounded closure: this slice stayed bounded and avoided the wrong pattern

Add specific notes:

- A single “load every marketing variant module” assertion was not a test of truth; it was a worker-stability trap.
- A red gate is not useful unless its scope matches the actual contract it claims to enforce.

## 13. Enforcement Upgrade Rule

Use this rule for every slice:

- if a slice introduces a new governed surface, add or update enforcement in the same slice
- do not leave adopted surfaces protected only by memory or review comments
- prefer lint/AST enforcement over script-only enforcement when the pattern is stable enough
- if full lint/AST enforcement is not yet reasonable, record the exact stopgap and the trigger for upgrading it
- if a runtime contract was guessed and later corrected, record the real contract source before closing the slice

## 14. Next Slice Recommendation

- `recommended_next_slice`: `Wave B.5 — Worktree Stabilization`
- `why_this_next`: the repo is green, but cleanup still spans too many domains at once; deletion and quarantine should not begin until slice boundaries are reviewable
- `must_not_mix_with`: marketing canonical policy, chunk treatment, or broad dead-file deletion

## 15. Closure Statement

`This slice is closed when the root governance, runtime i18n, lint, tests, and build gates all pass with the web runtime test path stable under Turbo and the marketing/editorial audit demoted out of the runtime release gate.`
