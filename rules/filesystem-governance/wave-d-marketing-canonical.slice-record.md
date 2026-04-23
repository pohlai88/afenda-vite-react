# Wave D Marketing Canonical Slice Record

## 1. Slice Identity

- `slice_name`: `Wave D — Marketing Canonical Policy`
- `ownership_boundary`:
  - `apps/web`: marketing registry, marketing routes, and marketing route tests
  - `apps/api`: no API ownership
  - `packages/_database`: no database ownership
- `source_of_truth`: [`docs/MARKETING_FRONTEND_CONTRACT.md`](../../docs/MARKETING_FRONTEND_CONTRACT.md), [`repo-closure-program.md`](./repo-closure-program.md)
- `forbidden_dependency`: unrelated runtime cleanup or broad marketing redesign
- `status`: `closed`

## 2. Primary Contract

- `actor`: public visitor or maintainer opening marketing URLs directly
- `point_a`: `/marketing/benchmark-erp` silently loaded the flagship page module even though a dedicated ERP benchmark campaign page already existed
- `action`: visitor opens ERP benchmark marketing URLs
- `point_c`: `/marketing/campaigns/erp-benchmark` is the canonical ERP benchmark page, and `/marketing/benchmark-erp` is an explicit redirect alias

Operational path:

1. The registry distinguishes canonical routable pages from redirect aliases.
2. Navigation points to the canonical ERP benchmark page.
3. `/marketing/benchmark-erp` redirects to `/marketing/campaigns/erp-benchmark`.
4. Tests enforce the alias policy so the ambiguity cannot silently return.

## 3. Definition Of Done

- `ui`: public marketing navigation resolves ERP benchmark to one canonical route
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: no silent duplicate public flagship content remains behind the benchmark ERP shortlink
- `runtime_contract`: registry and routes encode canonical redirects explicitly
- `failure`: route tests fail if a canonical alias is not kept explicit
- `enforcement`:
  - `script_check`: route parity and marketing route tests
  - `lint_or_ast_rule`: not needed for this slice
  - `boundary_rule`: aliases live in explicit redirect metadata, not as duplicate page variants
- `adoption_expansion`:
  - `newly_adopted_surfaces`: canonical redirect metadata in the marketing registry
  - `added_to_enforcement_immediately`: tests covering redirect behavior and path disjointness
- `removed_paths`: implicit `BenchmarkERP` landing variant

## 4. Before State

- existing dependency shape: benchmark ERP existed as a landing variant slug that imported the flagship page module
- coupling or ambiguity: the registry mixed canonical landing variants with a public alias that was not actually its own page
- permission weakness: none
- truth/source weakness: public canonical intent was ambiguous
- runtime weakness: users could bookmark an alias without any explicit redirect or canonical policy
- enforcement weakness: tests did not fail on hidden flagship duplication
- validation weakness: there was no explicit alias metadata to inspect

## 5. After State

- final dependency shape: benchmark ERP is a canonical redirect to the routed ERP benchmark campaign page
- route or page ownership: campaign page owns ERP benchmark content; alias metadata owns the shortlink
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: one canonical benchmark ERP page exists
- runtime behavior: `/marketing/benchmark-erp` redirects to `/marketing/campaigns/erp-benchmark`
- enforcement behavior: registry tests, route tests, and truth-engine CTA tests lock the policy

## 6. Files And Surfaces Touched

- files touched:
  - [`marketing-page-registry.ts`](../../apps/web/src/marketing/marketing-page-registry.ts)
  - [`marketing-routes.tsx`](../../apps/web/src/marketing/marketing-routes.tsx)
  - [`truth-engine-page-editorial.ts`](../../apps/web/src/marketing/pages/product/truth-engine/truth-engine-page-editorial.ts)
  - [`marketing-page-registry.test.ts`](../../apps/web/src/marketing/__tests__/marketing-page-registry.test.ts)
  - [`marketing-routes.test.tsx`](../../apps/web/src/marketing/__tests__/marketing-routes.test.tsx)
  - [`truth-engine-page.test.tsx`](../../apps/web/src/marketing/__tests__/truth-engine-page.test.tsx)
  - [`route-marketing-parity.test.ts`](../../apps/web/src/routes/__tests__/route-marketing-parity.test.ts)
- routes touched:
  - `/marketing/benchmark-erp`
  - `/marketing/campaigns/erp-benchmark`
- contracts touched: marketing canonical redirect contract
- tests touched: registry, routes, truth engine CTA, route parity
- enforcement touched: explicit alias metadata and redirect tests
- removed paths or fallback logic: removed the hidden `BenchmarkERP` landing variant

## 7. Validation Evidence

- typecheck: `pnpm --filter @afenda/web run build`
- lint: not separately rerun for this slice; covered later by root `check`
- compliance: route parity test and registry invariants
- runtime verification: alias route redirect test
- targeted tests: `pnpm --filter @afenda/web exec vitest run src/marketing/__tests__/marketing-page-registry.test.ts src/marketing/__tests__/marketing-routes.test.tsx src/marketing/__tests__/truth-engine-page.test.tsx src/routes/__tests__/route-marketing-parity.test.ts --configLoader bundle`
- build: `pnpm --filter @afenda/web run build`
- manual qa: not executed

Validation not executed:

- manual browser verification of the benchmark ERP redirect

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.1`
- `truth_correctness`: `9.2`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `8.8`
- `test_coverage_for_slice`: `8.9`
- `refactor_safety`: `8.8`
- `operational_maturity`: `8.7`

Overall:

- `before_score`: `6.8`
- `after_score`: `8.9`
- `net_improvement`: `2.1`

## 9. What Improved

- The benchmark ERP shortlink is now explicit alias policy instead of hidden duplicate flagship content.
- Navigation and CTA surfaces point to the canonical page.
- The route contract is enforced by tests instead of by convention.

## 10. Remaining Debt

- Other marketing aliases still need the same level of explicit review. `non_blocking_followup`
- No canonical metadata is yet exposed into `<link rel="canonical">` or document head management. `non_blocking_followup`
- Marketing/editorial copy remains audit-only i18n debt. `separate_health_slice`

## 11. Lessons To Apply Immediately

- contract improvements: alias routes should be redirect metadata, not fake page variants
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: route truth should be encoded in the registry, not inferred from module reuse
- validation improvements: route parity tests should cover aliases as first-class entries
- anti-drift improvements: do not let shortlinks become silent duplicate content

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: the landing variant registry was carrying a non-variant alias
- permission enforced only in UI: not exposed here
- fallback path masking missing authority: the fallback was content-level, not permission-level
- workspace projection leaking into truth surfaces: not exposed here
- broad cleanup attempted instead of bounded closure: avoided

Add specific notes:

- A public alias is not a variant when it owns no unique content.
- Duplicate content becomes governance debt unless the canonical intent is explicit in code.

## 13. Enforcement Upgrade Rule

- canonical aliases must live in redirect metadata
- canonical aliases must not be registered as standalone landing variants unless they own distinct content
- tests must prove alias paths are disjoint from canonical page paths and landing variant slugs

## 14. Next Slice Recommendation

- `recommended_next_slice`: `Wave D — Web Chunk Treatment`
- `why_this_next`: the repo is green and the public canonical ambiguity is closed, so the next remaining health debt is the oversized web bundle
- `must_not_mix_with`: broad delete/quarantine work

## 15. Closure Statement

`This slice is closed when the ERP benchmark public shortlink redirects to one canonical campaign page and the registry can no longer hide that alias as a duplicate flagship variant.`
