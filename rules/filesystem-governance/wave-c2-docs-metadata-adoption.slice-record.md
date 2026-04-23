# Wave C.2 Docs Metadata Adoption Slice Record

## 1. Slice Identity

- `slice_name`: `Wave C.2 — Docs Metadata Adoption`
- `ownership_boundary`:
  - `apps/web`: no runtime ownership changes
  - `apps/api`: no API ownership changes
  - `packages/_database`: no database ownership changes
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md), [`docs/DOCUMENTATION_SCOPE.md`](../../docs/DOCUMENTATION_SCOPE.md)
- `forbidden_dependency`: runtime cleanup, package cleanup, performance work, naming waves, non-doc archive work
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer or contributor relying on `docs/` as the active documentation surface
- `point_a`: active docs still lacked consistent ownership and truth-status metadata, so canonical and supporting material could not be distinguished mechanically
- `action`: maintainer runs docs generation and repo governance
- `point_c`: every active doc in scope carries minimum metadata, and docs generation fails if active docs try to survive without it

Operational path:

1. Inventory the remaining active docs under `docs/`, `docs/dependencies`, `docs/marketing`, and `docs/decisions`.
2. Apply minimum metadata to each active doc: owner, truth status, doc class, and related domain.
3. Require docs generation to reject active docs that are missing the minimum metadata set.
4. Regenerate active docs indexes and keep repo health green.

## 3. Definition Of Done

- `ui`: not applicable
- `api`: not applicable
- `db`: not applicable
- `permission`: not applicable
- `truth`: canonical vs supporting doc status is explicit across the active docs surface
- `runtime_contract`: `script:generate-docs-readme` and root governance fail if active docs in the covered surface lack metadata
- `failure`: active docs can no longer survive by omission of ownership or truth-status metadata
- `enforcement`:
  - `script_check`: `pnpm run script:generate-docs-readme`, `pnpm run script:check-governance`
  - `lint_or_ast_rule`: focused ESLint on `scripts/generate-docs-readme.ts`
  - `boundary_rule`: active visible docs must provide owner, truthStatus, docClass, and relatedDomain
- `adoption_expansion`:
  - `newly_adopted_surfaces`: root docs, dependency guides, marketing docs, and decision records
  - `added_to_enforcement_immediately`: docs generation now rejects active docs missing metadata
- `removed_paths`: none

## 4. Before State

- existing dependency shape: active docs were readable but not classifiable as canonical vs supporting by machine
- coupling or ambiguity: ownership and truth status depended on reader inference
- permission weakness: not applicable
- truth/source weakness: only a small subset of active docs had the new metadata contract from Wave C.1
- runtime weakness: not applicable
- enforcement weakness: the docs generator understood metadata fields but did not require them for active docs
- validation weakness: metadata drift in active docs would not block generation or governance

## 5. After State

- final dependency shape: active docs across root, dependencies, marketing, and decisions now carry minimum metadata
- route or page ownership: not applicable
- api ownership: unchanged
- db/source ownership: unchanged
- permission enforcement: unchanged
- truth behavior: active docs explicitly distinguish canonical-doc from supporting-doc
- runtime behavior: generated docs indexes stay green only when active docs satisfy the metadata contract
- enforcement behavior: `scripts/generate-docs-readme.ts` asserts required metadata on active visible docs

## 6. Files And Surfaces Touched

- files touched:
  - active docs under [`docs`](../../docs), [`docs/dependencies`](../../docs/dependencies), [`docs/marketing`](../../docs/marketing), and [`docs/decisions`](../../docs/decisions)
  - [`scripts/generate-docs-readme.ts`](../../scripts/generate-docs-readme.ts)
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
- routes touched: none
- contracts touched: active-doc metadata requirement for generated docs
- tests touched: none
- enforcement touched: docs README generation and root governance
- removed paths or fallback logic: removed the ability for active docs to remain metadata-free

## 7. Validation Evidence

- typecheck: `pnpm run check` (`pnpm run typecheck` phase)
- lint: `pnpm run lint`; focused `pnpm exec eslint scripts/generate-docs-readme.ts --cache --cache-location .artifacts/eslint --max-warnings 0`
- compliance: `pnpm run script:generate-docs-readme`; `pnpm run script:check-governance`
- runtime verification: `pnpm run check`
- targeted tests: not applicable
- build: `pnpm run check` (`pnpm run build` phase)
- manual qa: not executed

Validation not executed:

- manual editorial review of whether every owner assignment is the ideal long-term owner label

## 8. Evaluation Scorecard

- `boundary_clarity`: `9.1`
- `truth_correctness`: `9.0`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `8.0`
- `test_coverage_for_slice`: `7.8`
- `refactor_safety`: `9.0`
- `operational_maturity`: `9.0`

Overall:

- `before_score`: `7.1`
- `after_score`: `8.9`
- `net_improvement`: `1.8`

## 9. What Improved

- All 74 active docs in scope now carry minimum ownership and truth-status metadata.
- Canonical docs and supporting docs are now mechanically distinguishable in the active docs surface.
- Docs generation enforces the metadata contract instead of relying on convention.

## 10. Remaining Debt

- Doc metadata exists, but repo-wide higher-order duplication analysis is still a follow-up concern. `non_blocking_followup`
- Owner labels are now explicit, but later waves may still refine some owner names or domain boundaries. `non_blocking_followup`
- Non-doc closure lanes remain separate and untouched by this slice. `separate_health_slice`

## 11. Lessons To Apply Immediately

- contract improvements: minimum metadata becomes useful only once generation enforces it
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: not applicable
- validation improvements: metadata enforcement should attach to the active surface generator, not a later audit-only report
- anti-drift improvements: adopting metadata lane-wide is safer than mixing doc cleanup with runtime work

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not applicable
- permission enforced only in UI: not applicable
- fallback path masking missing authority: active docs were effectively surviving on reader interpretation instead of declared truth status
- workspace projection leaking into truth surfaces: docs without classification blurred canonical and supporting material
- broad cleanup attempted instead of bounded closure: avoided by staying inside the docs-policy lane

Add specific notes:

- Metadata support without enforcement only postpones ambiguity.
- Supporting docs are healthy when they are explicit, not when they impersonate canonical truth.

## 13. Enforcement Upgrade Rule

- active docs must declare `owner`, `truthStatus`, `docClass`, and `relatedDomain`
- supporting docs remain valid active docs as long as they are classified explicitly
- generator enforcement is the stop line for future active-doc drift in this surface

## 14. Next Slice Recommendation

- `recommended_next_slice`: `web-runtime-shell Wave C lane` or a later docs-policy duplication review, but not both together
- `why_this_next`: the docs surface is now classified enough that further docs work can focus on duplicate truth or owner refinement instead of basic metadata adoption
- `must_not_mix_with`: runtime cleanup, package cleanup, performance work, or non-doc archival changes

## 15. Closure Statement

`This slice is closed when the active docs surface carries explicit ownership and truth-status metadata throughout the bounded scope and docs generation refuses to render metadata-free active docs.`
