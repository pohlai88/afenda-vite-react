# Wave C.5 Root Supporting-Doc Retirement Slice Record

## 1. Slice Identity

- `slice_name`: `Wave C.5 — Root Supporting-Doc Retirement`
- `ownership_boundary`:
  - `apps/web`: no runtime ownership changes
  - `apps/api`: no API ownership changes
  - `packages/_database`: no database ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`wave-c5-root-supporting-doc-matrix.md`](./wave-c5-root-supporting-doc-matrix.md)
- `forbidden_dependency`: runtime cleanup, package cleanup, performance work, naming waves, non-doc archive work
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer closing the remaining root supporting-doc debt after earlier docs-policy waves narrowed the active docs surface
- `point_a`: the root `docs/` surface still exposed one supporting execution document as if it were active governing truth
- `action`: maintainer retires the migration plan from active docs, archives it as historical execution material, and updates active docs to stop pointing at it as live guidance
- `point_c`: the root `docs/` surface becomes canonical-only while historical migration evidence remains available in archive storage

Operational path:

1. Review the last root supporting doc against the canonical docs it depends on.
2. Move that supporting execution doc into archive storage.
3. Remove active-doc references that still normalize the doc as live truth.
4. Regenerate docs indexes and keep repo green.

## 3. Definition Of Done

- `ui`: not applicable
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: root `docs/` no longer exposes supporting execution material as active governing truth
- `runtime_contract`: docs generation and root repo checks remain green after the retirement
- `failure`: root `docs/` still contains a supporting execution doc or active docs still point to archived migration guidance as live truth
- `enforcement`:
  - `script_check`: `pnpm run script:generate-docs-readme`, `pnpm run script:check-governance`
  - `lint_or_ast_rule`: markdown-only lane; no new lint rule required beyond root validation
  - `boundary_rule`: supporting execution material belongs in archive once the migration is complete
- `adoption_expansion`:
  - `newly_adopted_surfaces`: none
  - `added_to_enforcement_immediately`: root docs index now renders only canonical root docs
- `removed_paths`:
  - `docs/TAILWIND_SHADCN_MIGRATION_PLAN.md`

## 4. Before State

- existing dependency shape: one remaining root supporting doc still lived beside canonical root docs
- coupling or ambiguity: active shell, components, and dependency docs still linked to the migration plan as if execution sequencing remained live guidance
- permission weakness: not applicable
- truth/source weakness: migration history and governing truth were still mixed in the root docs surface
- runtime weakness: not applicable
- enforcement weakness: docs generation still surfaced the migration plan because active docs linked to it and it remained in root `docs/`
- validation weakness: none blocking; the issue was truth precision in the active docs surface

## 5. After State

- final dependency shape: the migration plan lives under `archives/docs-superseded-2026-04-23/`
- route or page ownership: not applicable
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: active docs now point only to canonical styling and shell docs; migration sequencing is treated as historical context only
- runtime behavior: `docs/README.md` no longer lists a supporting migration doc at root
- enforcement behavior: root docs surface is canonical-only after docs README regeneration

## 6. Files And Surfaces Touched

- files touched:
  - [`archives/docs-superseded-2026-04-23/TAILWIND_SHADCN_MIGRATION_PLAN.md`](../../archives/docs-superseded-2026-04-23/TAILWIND_SHADCN_MIGRATION_PLAN.md)
  - [`archives/docs-superseded-2026-04-23/README.md`](../../archives/docs-superseded-2026-04-23/README.md)
  - [`archives/README.md`](../../archives/README.md)
  - [`docs/APP_SHELL_SPEC.md`](../../docs/APP_SHELL_SPEC.md)
  - [`docs/COMPONENTS_AND_STYLING.md`](../../docs/COMPONENTS_AND_STYLING.md)
  - [`docs/dependencies/shadcn-ui.md`](../../docs/dependencies/shadcn-ui.md)
  - [`docs/dependencies/tailwind-v4.md`](../../docs/dependencies/tailwind-v4.md)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
  - [`wave-c5-root-supporting-doc-matrix.md`](./wave-c5-root-supporting-doc-matrix.md)
- routes touched: none
- contracts touched: active docs truth boundaries only
- tests touched: none
- enforcement touched: docs README generation
- removed paths or fallback logic:
  - root copy of the migration plan exists only in archive storage

## 7. Validation Evidence

- typecheck: `pnpm run check` (`pnpm run typecheck` phase)
- lint: `pnpm run lint`
- compliance: `pnpm run script:generate-docs-readme`; `pnpm run script:check-governance`
- runtime verification: `pnpm run check`
- targeted tests: not applicable
- build: `pnpm run check` (`pnpm run build` phase)
- manual qa: not executed

Validation not executed:

- manual editorial review of lower-confidence supporting overlap outside this root supporting-doc slice

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.5`
- `truth_correctness`: `9.6`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `8.0`
- `test_coverage_for_slice`: `7.8`
- `refactor_safety`: `9.5`
- `operational_maturity`: `9.5`

Overall:

- `before_score`: `9.4`
- `after_score`: `9.6`
- `net_improvement`: `0.2`

## 9. What Improved

- The root docs surface no longer exposes a supporting migration plan as active truth.
- Active shell and styling docs now point only to canonical living docs, not archived execution history.
- Historical migration evidence remains preserved in archive storage instead of being deleted or left mixed with live docs.

## 10. Remaining Debt

- Lower-confidence supporting-doc overlap still exists and may need future review. `non_blocking_followup`
- Non-doc Wave C lanes remain separate and untouched by this slice. `separate_health_slice`
- Reviewed-exception adoption remains intentionally minimal and was not needed in this docs lane. `program_followup`

## 11. Lessons To Apply Immediately

- contract improvements: when a migration is complete, its execution plan should leave the active docs surface even if the historical file still has value
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: not applicable
- validation improvements: root supporting-doc debt can be removed without deleting historical evidence
- anti-drift improvements: active docs should not point at archived migration guidance as current truth

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not applicable
- permission enforced only in UI: not applicable
- fallback path masking missing authority: supporting migration docs can survive too long if canonical docs never explicitly sever active links
- workspace projection leaking into truth surfaces: historical execution material at root blurred the difference between active policy and finished rollout history
- broad cleanup attempted instead of bounded closure: avoided by limiting C.5 to the final root supporting doc

Add specific notes:

- Finishing a migration is not enough; the active docs surface must also forget the migration plan.
- Canonical-only root docs are easier to trust than mixed root docs with both policy and rollout history.

## 13. Enforcement Upgrade Rule

- completed migration plans should move to archive or be deleted; they must not remain in root active docs
- active canonical docs must not link to archived execution plans as living guidance
- root docs should remain canonical-first after supporting clusters are either grouped or retired

## 14. Next Slice Recommendation

- `recommended_next_slice`: `pause docs-policy and move to a non-doc Wave C lane`
- `why_this_next`: the root docs surface is now canonical-only, so the most strategic next closure work is outside the docs lane
- `must_not_mix_with`: reopening repo-wide docs cleanup, runtime cleanup in the same slice, or unrelated archive expansion

## 15. Closure Statement

`This slice is closed when the final root supporting doc is retired from active docs, historical execution material is archived cleanly, active docs stop pointing at it as live truth, and repo green-state remains intact.`
