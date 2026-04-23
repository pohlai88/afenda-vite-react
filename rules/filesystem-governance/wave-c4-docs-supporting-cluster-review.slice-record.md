# Wave C.4 Docs Supporting-Doc Cluster Review Slice Record

## 1. Slice Identity

- `slice_name`: `Wave C.4 — Docs Supporting-Doc Cluster Review`
- `ownership_boundary`:
  - `apps/web`: no runtime ownership changes
  - `apps/api`: no API ownership changes
  - `packages/_database`: no database ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`wave-c4-docs-supporting-cluster-matrix.md`](./wave-c4-docs-supporting-cluster-matrix.md)
- `forbidden_dependency`: runtime cleanup, package cleanup, performance work, naming waves, non-doc archive work
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer reviewing active supporting docs after metadata adoption and high-confidence duplicate removal
- `point_a`: the root docs surface still mixed a dense Vite implementation pack with canonical workspace policy docs, which made supporting material look more authoritative than intended
- `action`: maintainer groups the implementation pack into a dedicated collection and narrows each supporting doc against its canonical policy anchors
- `point_c`: root `docs/` emphasizes canonical policy, while the supporting pack remains available through a dedicated `docs/scaffolds/` collection

Operational path:

1. Review the highest-overlap supporting-doc cluster.
2. Move the cluster into a dedicated docs collection instead of leaving it in root `docs/`.
3. Add explicit canonical anchors to each supporting doc in the cluster.
4. Regenerate docs indexes and keep repo health green.

## 3. Definition Of Done

- `ui`: not applicable
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: supporting implementation docs no longer read like root canonical docs
- `runtime_contract`: docs generation and root repo checks remain green after the collection move
- `failure`: root docs still mix dense supporting implementation packs directly into canonical policy surfaces
- `enforcement`:
  - `script_check`: `pnpm run script:generate-docs-readme`, `pnpm run script:check-governance`
  - `lint_or_ast_rule`: focused ESLint on `scripts/generate-docs-readme.ts`
  - `boundary_rule`: moved supporting docs survive through a dedicated docs collection, not as root canonical-looking docs
- `adoption_expansion`:
  - `newly_adopted_surfaces`: `docs/scaffolds/` as a governed supporting-doc collection
  - `added_to_enforcement_immediately`: root docs index now treats the Vite implementation pack as a collection, not individual root docs
- `removed_paths`: none

## 4. Before State

- existing dependency shape: five Vite support docs lived directly under root `docs/`
- coupling or ambiguity: blueprint, config template, feature template, performance defaults, and CI gates were supporting docs but visually sat beside canonical repo policy docs
- permission weakness: not applicable
- truth/source weakness: their relationship to canonical docs was implied, not stated
- runtime weakness: not applicable
- enforcement weakness: root docs generation had no structural distinction between canonical docs and dense supporting implementation packs
- validation weakness: none blocking; the issue was active-surface precision and supporting-doc placement

## 5. After State

- final dependency shape: the Vite implementation pack lives under `docs/scaffolds/`
- route or page ownership: not applicable
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: each moved support doc explicitly points to the canonical policy docs it depends on
- runtime behavior: root `docs/README.md` is narrower and exposes the pack through a collection entry instead of five separate root docs
- enforcement behavior: docs generation now treats `scaffolds/` as a governed docs collection with an explicit collection title and description

## 6. Files And Surfaces Touched

- files touched:
  - [`scripts/generate-docs-readme.ts`](../../scripts/generate-docs-readme.ts)
  - moved docs under [`docs/scaffolds`](../../docs/scaffolds)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
  - [`wave-c4-docs-supporting-cluster-matrix.md`](./wave-c4-docs-supporting-cluster-matrix.md)
- routes touched: none
- contracts touched: none beyond active docs collection layout
- tests touched: none
- enforcement touched: docs README generation
- removed paths or fallback logic:
  - root copies of the Vite implementation pack now live only in `docs/scaffolds/`

## 7. Validation Evidence

- typecheck: `pnpm run check` (`pnpm run typecheck` phase)
- lint: `pnpm run lint`; focused `pnpm exec eslint scripts/generate-docs-readme.ts --cache --cache-location .artifacts/eslint --max-warnings 0`
- compliance: `pnpm run script:generate-docs-readme`; `pnpm run script:check-governance`
- runtime verification: `pnpm run check`
- targeted tests: not applicable
- build: `pnpm run check` (`pnpm run build` phase)
- manual qa: not executed

Validation not executed:

- manual editorial review of non-Vite supporting clusters that were explicitly left out of this lane

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.3`
- `truth_correctness`: `9.3`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `8.0`
- `test_coverage_for_slice`: `7.8`
- `refactor_safety`: `9.2`
- `operational_maturity`: `9.2`

Overall:

- `before_score`: `9.2`
- `after_score`: `9.4`
- `net_improvement`: `0.2`

## 9. What Improved

- The root docs surface now emphasizes canonical policy docs instead of mixing in a five-file Vite support pack.
- The Vite implementation pack remains available but now lives as a dedicated supporting-doc collection.
- The moved support docs now state their canonical anchors explicitly instead of relying on implied hierarchy.

## 10. Remaining Debt

- Other supporting-doc clusters still need review, but they are lower-confidence than the Vite pack. `non_blocking_followup`
- Root supporting docs outside the moved Vite pack may still be narrowed later. `non_blocking_followup`
- Non-doc closure lanes remain separate and untouched by this slice. `separate_health_slice`

## 11. Lessons To Apply Immediately

- contract improvements: supporting docs become clearer when their canonical anchors are explicit in the body, not only in metadata
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: not applicable
- validation improvements: moving a support pack into its own collection can narrow root truth surfaces without deleting useful operational material
- anti-drift improvements: dense supporting packs should live in collections, not at root beside canonical docs

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not applicable
- permission enforced only in UI: not applicable
- fallback path masking missing authority: supporting docs can impersonate canonical truth if root placement is left unreviewed
- workspace projection leaking into truth surfaces: implementation templates at root blurred the difference between policy and starter material
- broad cleanup attempted instead of bounded closure: avoided by limiting C.4 to one supporting-doc cluster

Add specific notes:

- A supporting doc can be healthy and still belong outside the root docs surface.
- Collection placement is part of truth design, not just navigation.

## 13. Enforcement Upgrade Rule

- dense supporting implementation packs should prefer dedicated docs collections over root placement
- supporting docs should state their canonical anchors explicitly when they are likely to overlap policy docs
- root docs should bias toward canonical or cross-cutting documents first

## 14. Next Slice Recommendation

- `recommended_next_slice`: `docs-policy C.5 — remaining supporting-doc root review`
- `why_this_next`: the largest supporting cluster is now isolated, so the next docs lane can evaluate the smaller remaining root supporting docs without Vite-pack noise
- `must_not_mix_with`: runtime cleanup, package cleanup, performance work, or non-doc archive work

## 15. Closure Statement

`This slice is closed when the reviewed supporting-doc cluster is no longer mixed into the root docs surface, its canonical anchors are explicit, and repo green-state remains intact.`
