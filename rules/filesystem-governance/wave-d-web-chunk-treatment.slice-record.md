# Wave D Web Chunk Treatment Slice Record

## 1. Slice Identity

- `slice_name`: `Wave D — Web Chunk Treatment`
- `ownership_boundary`:
  - `apps/web`: Vite manual chunk policy and measured bundle outputs
  - `apps/api`: no ownership
  - `packages/_database`: no ownership
- `source_of_truth`: [`docs/PERFORMANCE.md`](../../docs/PERFORMANCE.md), [`wave-d-web-chunk-treatment-matrix.md`](./wave-d-web-chunk-treatment-matrix.md)
- `forbidden_dependency`: broad route redesign or delete/quarantine work
- `status`: `closed_with_followup_debt`

## 2. Primary Contract

- `actor`: maintainer shipping the web app through the root build gate
- `point_a`: the web build passed, but the generic vendor chunk was too large to call the frontend healthy
- `action`: maintainer measures the bundle, splits route-bounded heavy stacks out of the generic vendor bucket, and records the treatment decision
- `point_c`: the build remains green, the generic vendor bucket is materially smaller, and the remaining debt is explicit by route/domain

Operational path:

1. Measure the current production and analyze builds.
2. Split clearly route-bounded heavy stacks out of the generic vendor bucket.
3. Rebuild and compare the before/after chunk surface.
4. Record the treatment matrix for the remaining debt.

## 3. Definition Of Done

- `ui`: route-bounded heavy stacks no longer ride in the generic always-on vendor bucket
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: bundle debt is explicit and measured instead of implied
- `runtime_contract`: build still passes after chunk refinement
- `failure`: large-chunk debt remains visible in the treatment matrix
- `enforcement`:
  - `script_check`: `pnpm --filter @afenda/web run build`; `pnpm --filter @afenda/web run build:analyze`
  - `lint_or_ast_rule`: not applicable
  - `boundary_rule`: route/domain ownership is the chunk split decision rule
- `adoption_expansion`:
  - `newly_adopted_surfaces`: auth, motion, and 3D dependency buckets
  - `added_to_enforcement_immediately`: measured chunk treatment matrix
- `removed_paths`: none

## 4. Before State

- existing dependency shape: almost every non-react dependency was coerced into a single generic vendor bucket
- coupling or ambiguity: route-only stacks inflated the always-on vendor surface
- permission weakness: not applicable
- truth/source weakness: bundle debt was described qualitatively, not recorded by route/domain
- runtime weakness: oversized `vendor` and `index` chunks
- enforcement weakness: no explicit treatment matrix existed
- validation weakness: analyze/build output was not converted into a durable closure artifact

## 5. After State

- final dependency shape: auth, motion, and 3D stacks are isolated from the generic vendor bucket
- route or page ownership: route-bounded heavy libraries map more closely to the routes that actually use them
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: the bundle treatment decision is recorded explicitly
- runtime behavior: production build stays green with a materially smaller generic vendor chunk
- enforcement behavior: the chunk treatment matrix now documents what is accepted versus deferred

## 6. Files And Surfaces Touched

- files touched:
  - [`vite.config.ts`](../../apps/web/vite.config.ts)
  - [`wave-d-web-chunk-treatment-matrix.md`](./wave-d-web-chunk-treatment-matrix.md)
  - [`wave-d-web-chunk-treatment.slice-record.md`](./wave-d-web-chunk-treatment.slice-record.md)
- routes touched: none directly
- contracts touched: build chunk ownership contract
- tests touched: none
- enforcement touched: manual chunk policy and build measurement evidence
- removed paths or fallback logic: none

## 7. Validation Evidence

- typecheck: included in `pnpm --filter @afenda/web run build`
- lint: not separately rerun for this slice
- compliance: measured chunk matrix
- runtime verification: `pnpm --filter @afenda/web run build`
- targeted tests: not applicable
- build:
  - `pnpm --filter @afenda/web run build`
  - `pnpm --filter @afenda/web run build:analyze`
- manual qa: not executed

Validation not executed:

- route-by-route runtime network profiling in the browser

## 8. Evaluation Scorecard

- `boundary_clarity`: `8.8`
- `truth_correctness`: `8.7`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `8.8`
- `test_coverage_for_slice`: `7.2`
- `refactor_safety`: `8.4`
- `operational_maturity`: `8.6`

Overall:

- `before_score`: `6.9`
- `after_score`: `8.2`
- `net_improvement`: `1.3`

## 9. What Improved

- The generic vendor bucket was reduced materially.
- Route-bounded auth and 3D stacks are no longer silently inflating the always-on vendor chunk.
- The remaining bundle debt now has an explicit treatment matrix.

## 10. Remaining Debt

- The generic `vendor` chunk is still too large. `blocking_next_slice`
- The main `index` entry still needs an eager-import audit. `blocking_next_slice`
- Drag/drop and chart splits remain deferred until usage proves they are meaningful contributors. `non_blocking_followup`

## 11. Lessons To Apply Immediately

- contract improvements: chunk policy should follow route/domain ownership, not arbitrary library size alone
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: the main entry is a bootstrap contract and must be audited separately from vendor splits
- validation improvements: always record build/analyze output as a durable treatment artifact
- anti-drift improvements: do not accept a “green build” as equivalent to a healthy frontend without a chunk treatment decision

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: generic vendor flattening is the bundle analogue of this anti-pattern
- permission enforced only in UI: not exposed here
- fallback path masking missing authority: not exposed here
- workspace projection leaking into truth surfaces: not exposed here
- broad cleanup attempted instead of bounded closure: avoided

Add specific notes:

- The chunk problem was partly self-inflicted by an over-coarse `manualChunks` policy.
- Splitting too aggressively would be another form of drift; route/domain ownership remains the filter.

## 13. Enforcement Upgrade Rule

- keep route/domain ownership as the first chunk split decision rule
- treat generic vendor growth and main-entry growth as separate problems
- keep the chunk treatment matrix updated when heavy route-bounded libraries are introduced or promoted into shared surfaces

## 14. Next Slice Recommendation

- `recommended_next_slice`: `Wave C — Delete and Quarantine (lane-local only)`
- `why_this_next`: green gates, bounded lanes, explicit canonical policy, and measured chunk treatment are now in place
- `must_not_mix_with`: new broad performance theory changes or unrelated marketing redesign

## 15. Closure Statement

`This slice is closed when the current heavy web chunks have explicit route/domain treatment decisions and the generic vendor bucket is materially smaller than before the wave.`
