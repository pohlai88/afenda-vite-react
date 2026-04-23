# Wave C.3 Docs Truth Consolidation Slice Record

## 1. Slice Identity

- `slice_name`: `Wave C.3 — Docs Truth Consolidation`
- `ownership_boundary`:
  - `apps/web`: no runtime ownership changes
  - `apps/api`: no API ownership changes
  - `packages/_database`: no database ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`wave-c3-docs-truth-matrix.md`](./wave-c3-docs-truth-matrix.md)
- `forbidden_dependency`: runtime cleanup, package cleanup, performance work, naming waves, non-doc archive work
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer reviewing duplicate truth inside the active `docs/` surface
- `point_a`: active docs had already adopted metadata, but a small number of root docs were still surviving as pure redirects or moved stubs even though better canonical sources existed
- `action`: maintainer consolidates only the highest-confidence duplicate-truth docs, archives historical survivors, and regenerates the docs index
- `point_c`: active `docs/` is narrower, canonical/supporting boundaries are cleaner, and superseded root-level duplicates no longer appear in the generated docs surface

Operational path:

1. Review the active docs surface for the highest-confidence duplicate-truth clusters.
2. Delete pure redirect docs with no remaining active-truth value.
3. Archive superseded historical root docs that are no longer appropriate for the active docs surface.
4. Regenerate active docs indexes and keep repo health green.

## 3. Definition Of Done

- `ui`: not applicable
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: active docs no longer present superseded root-level redirect or moved-stub files as live truth
- `runtime_contract`: `script:generate-docs-readme`, storage governance, and root repo checks remain green after consolidation
- `failure`: duplicate root docs survive in the active docs index when a better canonical or runtime-owned source already exists
- `enforcement`:
  - `script_check`: `pnpm run script:generate-docs-readme`, `pnpm run script:check-storage-governance`, `pnpm run script:check-governance`
  - `lint_or_ast_rule`: focused ESLint on `scripts/generate-docs-readme.ts`
  - `boundary_rule`: active docs index must not surface deleted or archived superseded docs
- `adoption_expansion`:
  - `newly_adopted_surfaces`: docs duplicate-truth matrix and archive registration for superseded docs
  - `added_to_enforcement_immediately`: root docs index now omits the removed redirect and archived stub automatically
- `removed_paths`:
  - `docs/SHADCN_UI.md`
  - `docs/SHELL_COMPONENTS_GUARDRAILS.md` from active scope

## 4. Before State

- existing dependency shape: active docs still included a root-level `shadcn` redirect and a root-level moved shell guardrails stub
- coupling or ambiguity: root docs surface still mixed real active truth with compatibility or migration leftovers
- permission weakness: not applicable
- truth/source weakness: the metadata lane was complete, but duplicate-truth reduction had not yet removed the most obvious superseded root docs
- runtime weakness: not applicable
- enforcement weakness: docs metadata could classify superseded docs, but active-surface consolidation still relied on manual follow-through
- validation weakness: none blocking; the issue was active-surface precision, not missing gate coverage

## 5. After State

- final dependency shape: the active root docs surface is narrower; the shell and shadcn moved stubs no longer survive there
- route or page ownership: not applicable
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: active docs now point directly to the canonical dependency guide and runtime/package shell docs instead of preserving redundant root stubs
- runtime behavior: generated root docs index no longer renders the removed redirect or archived shell stub
- enforcement behavior: storage governance registers the new `archives/docs-superseded-2026-04-23/` root and docs generation stays clean without special-case root redirect debt

## 6. Files And Surfaces Touched

- files touched:
  - [`scripts/generate-docs-readme.ts`](../../scripts/generate-docs-readme.ts)
  - [`docs/SHELL_ARCHITECTURE.md`](../../docs/SHELL_ARCHITECTURE.md)
  - [`archives/README.md`](../../archives/README.md)
  - [`archives/docs-superseded-2026-04-23/README.md`](../../archives/docs-superseded-2026-04-23/README.md)
  - [`rules/storage-governance/storage-governance.config.json`](../storage-governance/storage-governance.config.json)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
  - [`wave-c3-docs-truth-matrix.md`](./wave-c3-docs-truth-matrix.md)
- routes touched: none
- contracts touched: none beyond the existing docs metadata contract and active index generation
- tests touched: none
- enforcement touched: docs README generation and storage governance registration
- removed paths or fallback logic:
  - `docs/SHADCN_UI.md`
  - `docs/SHELL_COMPONENTS_GUARDRAILS.md` removed from active docs and archived

## 7. Validation Evidence

- typecheck: `pnpm run check` (`pnpm run typecheck` phase)
- lint: `pnpm run lint`; focused `pnpm exec eslint scripts/generate-docs-readme.ts --cache --cache-location .artifacts/eslint --max-warnings 0`
- compliance: `pnpm run script:generate-docs-readme`; `pnpm run script:check-storage-governance`; `pnpm run script:check-governance`
- runtime verification: `pnpm run check`
- targeted tests: not applicable
- build: `pnpm run check` (`pnpm run build` phase)
- manual qa: not executed

Validation not executed:

- manual editorial review of lower-confidence supporting-doc overlap outside the reviewed matrix

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.2`
- `truth_correctness`: `9.2`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `8.0`
- `test_coverage_for_slice`: `7.8`
- `refactor_safety`: `9.1`
- `operational_maturity`: `9.1`

Overall:

- `before_score`: `8.9`
- `after_score`: `9.2`
- `net_improvement`: `0.3`

## 9. What Improved

- The root docs surface no longer carries a pure `shadcn` redirect doc.
- The superseded shell guardrails stub is preserved historically under `archives/` instead of polluting active docs.
- Docs C.3 now has explicit evidence for reviewed duplicate-truth clusters, including retained clusters with no-action decisions.

## 10. Remaining Debt

- Lower-confidence duplicate-truth reduction across broader supporting-doc clusters remains open. `non_blocking_followup`
- Supporting scaffolds and canonical workspace docs are now explicitly reviewed, but not yet reduced beyond the high-confidence wins in this slice. `non_blocking_followup`
- Non-doc closure lanes remain separate and untouched by this slice. `separate_health_slice`

## 11. Lessons To Apply Immediately

- contract improvements: metadata adoption enables surgical consolidation because truth decisions can follow declared status instead of guesswork
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: not applicable
- validation improvements: duplicate-truth reduction should start with the highest-confidence superseded files, not broad doc rewrites
- anti-drift improvements: root redirect or moved-stub docs should be deleted or archived once a stronger canonical surface exists

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not applicable
- permission enforced only in UI: not applicable
- fallback path masking missing authority: redirect docs and moved stubs can survive too long once metadata exists unless a consolidation lane removes them
- workspace projection leaking into truth surfaces: root docs can accumulate compatibility notes that belong in dependency guides or runtime-owned READMEs
- broad cleanup attempted instead of bounded closure: avoided by limiting the slice to high-confidence duplicate-truth docs only

Add specific notes:

- A moved stub is still active-surface debt if the live owner already has a stronger source of truth.
- Canonical/supporting metadata is most valuable when it leads to deletion or archiving of redundant survivors.

## 13. Enforcement Upgrade Rule

- root-level redirect or moved-stub docs should not survive the active docs surface once a stronger canonical or runtime-owned source exists
- superseded historical docs belong under `archives/`, not `docs/`
- duplicate-truth review should record both removals and explicit no-action retention decisions in a bounded matrix

## 14. Next Slice Recommendation

- `recommended_next_slice`: `docs-policy C.4 — supporting-doc cluster review`
- `why_this_next`: the obvious redirect and moved-stub debt is removed, so the next docs lane can evaluate lower-confidence supporting-doc overlap without basic root-surface clutter
- `must_not_mix_with`: runtime cleanup, package cleanup, performance work, or non-doc archive work

## 15. Closure Statement

`This slice is closed when the active docs surface no longer includes the highest-confidence duplicate root docs, historical survivors are archived out of active scope, and repo green-state remains intact.`
