# Wave C.6 Marketing Legacy Topology Retirement Slice Record

## 1. Slice Identity

- `slice_name`: `Wave C.6 — Marketing Legacy Topology Retirement`
- `ownership_boundary`:
  - `apps/web`: `src/marketing` topology, route ownership, and lane-local supporting docs only
  - `apps/api`: no API ownership changes
  - `packages/_database`: no database ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`wave-c6-marketing-legacy-topology-matrix.md`](./wave-c6-marketing-legacy-topology-matrix.md), [`apps/web/src/marketing/README.md`](../../apps/web/src/marketing/README.md), [`ADR-0006-marketing-feature-topology.md`](../../docs/decisions/ADR-0006-marketing-feature-topology.md)
- `forbidden_dependency`: docs-policy cleanup, runtime shell cleanup, package cleanup, performance work, unrelated canonical-policy work
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer closing the marketing-public lane after the structured topology became the live runtime surface
- `point_a`: legacy marketing `_components`, flat page files, a broad flagship panel bundle, and in-source prompt artifacts were retired in code but not yet closed as a bounded delete/quarantine lane
- `action`: maintainer validates that the runtime and tests now point only at the structured marketing topology, then records the legacy retirement and aligns the lane-owned topology contract with the live shape
- `point_c`: marketing-public keeps only active runtime files, explicit shared components, and route-owned page modules; the legacy topology is retired and documented as such

Operational path:

1. Verify that routing and tests use the new structured marketing paths.
2. Confirm that legacy `_components`, flat page files, and prompt artifacts are detached from the live runtime.
3. Align the marketing topology decision record and local feature README with the current structure.
4. Re-run marketing validation and root repo checks without mixing unrelated cleanup.

## 3. Definition Of Done

- `ui`: marketing runtime uses only the structured `components/` surface and route-owned nested page modules
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: marketing topology docs describe the live structure instead of the retired legacy paths
- `runtime_contract`: registry, routes, and focused marketing tests no longer depend on the retired topology
- `failure`: legacy marketing surfaces are still referenced, or the topology contract still treats retired paths as live design
- `enforcement`:
  - `script_check`: `pnpm run script:check-governance`
  - `lint_or_ast_rule`: root `pnpm run check`
  - `boundary_rule`: shared marketing primitives live under `components/`; route-owned pages live in nested domain folders; prompt/planning markdown does not live under `src/marketing`
- `adoption_expansion`:
  - `newly_adopted_surfaces`: none
  - `added_to_enforcement_immediately`: marketing topology docs now encode the retired-path rule directly
- `removed_paths`:
  - `apps/web/src/marketing/pages/_components/*`
  - flat page files under `apps/web/src/marketing/pages/*-page.tsx`
  - `apps/web/src/marketing/pages/landing/flagship/flagship-page-panels.tsx`
  - `apps/web/src/marketing/prompt/*.md`

## 4. Before State

- existing dependency shape: the structured marketing topology was already partly implemented, but the lane had not been closed and the topology decision record still described older structures
- coupling or ambiguity: legacy `_components`, flat page files, and prompt artifacts were gone from the live runtime yet not explicitly retired as a bounded lane
- permission weakness: not applicable
- truth/source weakness: ADR-0006 still described `shared/` and `pages/landing/variants/` instead of the live `components/` plus nested route-owned page folders
- runtime weakness: low; registry and tests were already on the new structure
- enforcement weakness: no explicit closure evidence existed for the legacy marketing topology retirement
- validation weakness: the lane had not yet been re-validated as a bounded delete/quarantine slice

## 5. After State

- final dependency shape: marketing runtime uses root orchestration files, `components/`, `pages/<domain>/...`, and focused tests only
- route or page ownership: company, legal, product, campaign, and regional pages live in nested route-owned folders; landing keeps `flagship/` plus ordered variant files in `pages/landing/`
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: marketing topology docs now describe the live shape and explicitly forbid reintroducing the retired legacy surfaces
- runtime behavior: registry and route modules remain on the structured marketing topology with no references to retired paths
- enforcement behavior: the lane now has explicit closure evidence and a documented rule against reintroducing `_components`, flat page files, or prompt markdown into the runtime feature tree

## 6. Files And Surfaces Touched

- files touched:
  - [`apps/web/src/marketing/README.md`](../../apps/web/src/marketing/README.md)
  - [`ADR-0006-marketing-feature-topology.md`](../../docs/decisions/ADR-0006-marketing-feature-topology.md)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
  - [`wave-c6-marketing-legacy-topology-matrix.md`](./wave-c6-marketing-legacy-topology-matrix.md)
  - [`wave-c6-marketing-legacy-topology-retirement.slice-record.md`](./wave-c6-marketing-legacy-topology-retirement.slice-record.md)
- routes touched: none in this closure pass
- contracts touched: marketing topology contract only
- tests touched: none
- enforcement touched: bounded lane evidence and topology truth
- removed paths or fallback logic:
  - no reintroduction of legacy marketing `_components`, flat page files, or prompt docs

## 7. Validation Evidence

- typecheck: `pnpm run check` (`pnpm run typecheck` phase)
- lint: `pnpm run check` (`pnpm run lint` phase)
- compliance: `pnpm run script:check-governance`
- runtime verification: `pnpm run check`
- targeted tests: `pnpm --filter @afenda/web exec vitest run src/marketing/__tests__/marketing-page-registry.test.ts src/marketing/__tests__/marketing-routes.test.tsx src/marketing/__tests__/marketing-page-shell.test.tsx src/marketing/__tests__/marketing-page-scaffold.test.tsx src/routes/__tests__/route-marketing-parity.test.ts --configLoader bundle`
- build: `pnpm run check` (`pnpm run build` phase)
- manual qa: not executed

Validation not executed:

- manual browser review of every public marketing page, because this slice was topology retirement and truth alignment rather than new UI behavior

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.5`
- `truth_correctness`: `9.4`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `9.4`
- `test_coverage_for_slice`: `8.8`
- `refactor_safety`: `9.4`
- `operational_maturity`: `9.3`

Overall:

- `before_score`: `9.2`
- `after_score`: `9.4`
- `net_improvement`: `0.2`

## 9. What Improved

- The retired marketing topology is now an explicit closed lane instead of an implicit side effect of broader marketing refactors.
- The marketing topology decision record now matches the live runtime structure.
- The marketing source tree is explicitly protected from reintroducing prompt/planning markdown and generic `_components` buckets.

## 10. Remaining Debt

- Some legacy public route aliases remain intentionally active and should only be reduced when their canonical owner is explicit. `non_blocking_followup`
- Marketing/editorial i18n audit warnings remain a separate health slice and do not belong in this topology-retirement lane. `separate_health_slice`
- Bundle-size debt for marketing and generic vendor chunks remains tracked in Wave D, not here. `separate_health_slice`

## 11. Lessons To Apply Immediately

- contract improvements: lane-local READMEs and ADRs must be updated when the runtime topology materially changes, otherwise the repo keeps stale truth even after code is cleaned
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: route-owned nested page folders are easier to validate than flat page dumps
- validation improvements: a small focused marketing test pack is enough to prove topology retirement before the full root gate runs
- anti-drift improvements: runtime feature trees should not keep prompt/planning markdown once the page system is active

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: generic `_components` buckets invite weak ownership and broad coupling
- permission enforced only in UI: not applicable
- fallback path masking missing authority: flat page files and legacy wrappers can survive longer than they should if registry/test imports are not reviewed together
- workspace projection leaking into truth surfaces: prompt/planning markdown inside `src/marketing` blurred runtime ownership with ideation artifacts
- broad cleanup attempted instead of bounded closure: avoided by limiting C.6 to marketing topology retirement only

Add specific notes:

- A topology refactor is not closed until the old surface is explicitly retired.
- Prompt artifacts in a runtime source tree are structural debt, not harmless notes.

## 13. Enforcement Upgrade Rule

- if a marketing page move changes ownership shape, update the marketing topology contract in the same slice
- do not leave retired path rules implicit once the runtime has moved
- shared marketing primitives must stay under `components/`; page-local composition stays with the page
- in-source prompt/planning markdown under `src/marketing` is forbidden once the page system is active

## 14. Next Slice Recommendation

- `recommended_next_slice`: `governance-toolchain or web-runtime-shell Wave C lane`
- `why_this_next`: docs-policy is paused and marketing-public no longer has high-confidence delete/quarantine debt in active scope
- `must_not_mix_with`: reopening marketing docs cleanup, broad bundle work, or unrelated runtime feature work

## 15. Closure Statement

`This slice is closed when the live marketing topology contains only the structured runtime surface, the retired legacy topology is explicitly recorded, and root green-state remains intact.`
