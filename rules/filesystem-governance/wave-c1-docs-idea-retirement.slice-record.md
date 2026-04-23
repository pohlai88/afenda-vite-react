# Wave C.1 Docs Idea Retirement Slice Record

## 1. Slice Identity

- `slice_name`: `Wave C.1 — Docs Idea Retirement`
- `ownership_boundary`:
  - `apps/web`: no runtime ownership changes
  - `apps/api`: no API ownership changes
  - `packages/_database`: no database ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`storage-governance.md`](../storage-governance/storage-governance.md)
- `forbidden_dependency`: repo-wide doc cleanup, runtime or API changes, public IA changes, broad performance work
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer reviewing the active documentation surface
- `point_a`: `docs/__idea__/` was still indexed as an active documentation collection even though it contained ad hoc notes, planning fragments, and historical review material
- `action`: maintainer runs docs generation, storage governance, and root repo checks
- `point_c`: active `docs/` contains only governed active collections, while idea-stage historical material is either deleted or archived under storage governance

Operational path:

1. Remove `docs/__idea__` from the active docs surface.
2. Delete idea files with no valid survival basis.
3. Archive historically useful idea files under `archives/docs-idea-retired-2026-04-22/`.
4. Install minimum doc metadata support in the docs README generator for future active-doc classification.

## 3. Definition Of Done

- `ui`: not applicable
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: active docs no longer normalize idea-stage material as live source-of-truth
- `runtime_contract`: docs README generation and storage governance remain green after retiring `docs/__idea__`
- `failure`: archived idea material remains outside the active docs surface and cannot silently return through generated indexes
- `enforcement`:
  - `script_check`: `pnpm run script:generate-docs-readme`, `pnpm run script:check-storage-governance`, `pnpm run script:check-governance`
  - `lint_or_ast_rule`: generator front matter validation for `truthStatus` and `docClass`
  - `boundary_rule`: historical or delete-class docs are not rendered as active docs by the generator
- `adoption_expansion`:
  - `newly_adopted_surfaces`: minimum active-doc metadata contract in `scripts/docs/generate-docs-readme.ts`
  - `added_to_enforcement_immediately`: doc metadata parsing and hidden/archive filtering in generated readmes
- `removed_paths`: `docs/__idea__/`

## 4. Before State

- existing dependency shape: `docs/__idea__/` existed as a generated active collection under `docs/README.md`
- coupling or ambiguity: idea-stage planning, ad hoc notes, and historical review material were mixed with active docs
- permission weakness: not applicable
- truth/source weakness: active docs still linked to `docs/__idea__/working_ref.md` from `docs/SHELL_ARCHITECTURE.md`
- runtime weakness: not applicable
- enforcement weakness: docs generation could index any markdown collection under `docs/` without distinguishing active docs from historical or delete-class docs
- validation weakness: there was no minimum doc metadata contract for future classification work

## 5. After State

- final dependency shape: `docs/__idea__/` is gone; historical material lives under `archives/docs-idea-retired-2026-04-22/`
- route or page ownership: not applicable
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: active docs no longer point to idea-stage shell notes as a live reference
- runtime behavior: generated docs indexes render only active visible docs, not docs marked as historical-archive or delete
- enforcement behavior: storage governance registers the new archive root; docs generator understands `owner`, `truthStatus`, `docClass`, `relatedDomain`, and `supersededBy`

## 6. Files And Surfaces Touched

- files touched:
  - [`scripts/docs/generate-docs-readme.ts`](../../scripts/docs/generate-docs-readme.ts)
  - [`docs/SHELL_ARCHITECTURE.md`](../../docs/SHELL_ARCHITECTURE.md)
  - [`docs/VITE_FRONTEND_CI_GATES.md`](../../docs/VITE_FRONTEND_CI_GATES.md)
  - [`archives/README.md`](../../archives/README.md)
  - [`archives/docs-idea-retired-2026-04-22/README.md`](../../archives/docs-idea-retired-2026-04-22/README.md)
  - [`rules/storage-governance/storage-governance.config.json`](../storage-governance/storage-governance.config.json)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
- routes touched: none
- contracts touched: active-doc front matter metadata contract in docs generator
- tests touched: none
- enforcement touched: docs README generation and storage governance registration
- removed paths or fallback logic:
  - `docs/__idea__/Landing-page-adhoc.md`
  - `docs/__idea__/PLAN-global-default-token-policy.md`
  - `docs/__idea__/turbo-ci-workspace-upgrade-test.md`
  - `docs/__idea__/README.md`
  - active-doc references to `docs/__idea__/working_ref.md`

## 7. Validation Evidence

- typecheck: `pnpm run check` (`pnpm run typecheck` phase)
- lint: `pnpm run lint`
- compliance: `pnpm run script:generate-docs-readme`; `pnpm run script:check-storage-governance`; `pnpm run script:check-governance`
- runtime verification: `pnpm run check`
- targeted tests: not applicable
- build: `pnpm run check` (`pnpm run build` phase)
- manual qa: not executed

Validation not executed:

- manual review of every remaining active doc for metadata adoption beyond the touched supporting docs

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.0`
- `truth_correctness`: `8.9`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `8.0`
- `test_coverage_for_slice`: `7.8`
- `refactor_safety`: `9.1`
- `operational_maturity`: `8.9`

Overall:

- `before_score`: `6.7`
- `after_score`: `8.8`
- `net_improvement`: `2.1`

## 9. What Improved

- `docs/__idea__/` no longer pollutes the active documentation surface.
- Historical idea material is preserved under governed archive storage instead of remaining mixed into active docs.
- The docs generator now supports minimum classification metadata for future systematic documentation cleanup.

## 10. Remaining Debt

- Remaining active docs outside this slice still need owner and truth-status adoption. `non_blocking_followup`
- The docs generator metadata contract is installed, but repo-wide enforcement is intentionally deferred to a later docs-policy slice. `non_blocking_followup`
- Runtime and toolchain slices remain separate from this documentation cleanup and must not be folded into later docs waves. `separate_health_slice`

## 11. Lessons To Apply Immediately

- contract improvements: active docs need explicit metadata support before repo-wide classification can be enforced safely
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: not applicable
- validation improvements: generated indexes should hide historical or delete-class docs by contract, not by convention
- anti-drift improvements: idea-stage material should move directly to storage governance or deletion, never linger as an active doc collection

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not applicable
- permission enforced only in UI: not applicable
- fallback path masking missing authority: the active docs index was masking the absence of a real doc lifecycle by surfacing idea material as normal docs
- workspace projection leaking into truth surfaces: idea-stage planning leaked into active documentation truth
- broad cleanup attempted instead of bounded closure: avoided by limiting the slice to `docs/__idea__` plus minimal supporting governance files

Add specific notes:

- A generated docs index should not make an idea folder look canonical.
- Historical value and active ownership are different survival bases and must be stored in different repo surfaces.

## 13. Enforcement Upgrade Rule

- active docs may declare `owner`, `truthStatus`, `docClass`, `relatedDomain`, and `supersededBy`
- docs marked `historical-archive` or `delete` must not render in active generated indexes
- idea-stage material belongs in archive or deletion, not in active `docs/` collections

## 14. Next Slice Recommendation

- `recommended_next_slice`: `docs-policy C.2 — active doc metadata adoption`
- `why_this_next`: the classification contract now exists, so the next docs-policy wave should apply owner and truth-status metadata to the remaining active docs without mixing in runtime cleanup
- `must_not_mix_with`: runtime shell refactors, marketing work, or repo-wide dead-file deletion

## 15. Closure Statement

`This slice is closed when the former idea-doc lane has been deleted or archived out of active scope, active docs no longer reference it as live truth, and repo green-state remains intact.`
