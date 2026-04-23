# UI Operating Surface Baseline Slice Record

## 1. Slice Identity

- `slice_name`: `UI Operating Surface Baseline`
- `ownership_boundary`:
  - `apps/web`: authenticated app surfaces under `/app/*`, especially shell-owned page framing and the first operational pages
  - `apps/api`: no new business capability required; API remains unchanged unless a UI state requires explicit contract clarification
  - `packages/_database`: no schema ownership in this slice
- `source_of_truth`: app-surface composition law derived from [`docs/DESIGN_SYSTEM.md`](../../docs/DESIGN_SYSTEM.md), [`docs/COMPONENTS_AND_STYLING.md`](../../docs/COMPONENTS_AND_STYLING.md), and [`docs/APP_SHELL_SPEC.md`](../../docs/APP_SHELL_SPEC.md)
- `forbidden_dependency`: marketing composition patterns, route-local ad hoc page shells, and one-off state layouts that are not promoted into a deliberate app-surface baseline
- `status`: `in_progress`

## 2. Primary Contract

- `actor`: authenticated tenant user operating inside `/app/*`
- `point_a`: user navigates between `/app/events`, `/app/audit`, and `/app/partners` and encounters inconsistent page-owned surface language, state treatment, and section hierarchy
- `action`: user enters a core app route and interacts with its primary operating surface
- `point_c`: user experiences a consistent, deliberate Afenda app-surface language across core authenticated routes, with stable page framing, state handling, density rules, and action hierarchy

Operational path:

1. User enters an authenticated app route under `/app/*`.
2. The route renders through one canonical app-surface baseline instead of a route-local layout invention.
3. The page expresses primary context, state, and next actions through shared operating-surface rules.
4. User can move between core app routes without a break in visual doctrine or interaction expectations.

## 3. Definition Of Done

- `ui`:
  - core authenticated routes share one page-owned operating-surface baseline
  - page framing, header hierarchy, meta row, content rhythm, and state surfaces are visually and structurally consistent
  - loading, empty, forbidden, and failure states use the same baseline language
  - action placement and section density feel intentional rather than route-specific
  - the baseline is clearly distinct from public marketing composition
- `api`:
  - no new API is added unless a current route lacks data needed to support an explicit UI state
  - existing route contracts remain unchanged unless the UI slice exposes ambiguity that must be corrected explicitly
- `db`:
  - no schema changes required
- `permission`:
  - UI must respect existing permission-gated route access and state handling
  - baseline components must not hide permission ambiguity with decorative fallback states
- `truth`:
  - truth-read and workspace-read surfaces must remain visually distinguishable where their semantics differ
  - the UI baseline must not collapse truth surfaces into generic dashboard blocks
- `failure`:
  - page-level failure states are explicit, stable, and reusable
  - no blank shells, partial content flashes, or ad hoc error wrappers
- `removed_paths`:
  - no route-owned improvised page shells for core app surfaces
  - no reuse of marketing-only structural language in `/app/*`
  - no one-off state panels when a baseline surface already exists

## 4. Before State

- existing dependency shape:
  - shell chrome is relatively coherent, but page-owned surfaces are still route-specific
- coupling or ambiguity:
  - authenticated pages mix strong ideas with ad hoc composition
  - state treatment is not yet a first-class shared language
- permission weakness:
  - permission logic is improving structurally, but some UI states can still feel like local handling rather than baseline behavior
- truth/source weakness:
  - truth-correct routes now exist, but the UI vocabulary does not yet consistently communicate the distinction between workspace, audit, and partner surfaces
- runtime weakness:
  - navigating across core routes can feel like moving between individually designed pages rather than one disciplined operating system
- validation weakness:
  - page behavior is being validated slice by slice, but the visual/system baseline itself is not yet locked as a named contract

## 5. After State

- final dependency shape:
  - `/app/*` routes use one promoted operating-surface baseline for page-owned composition
- route or page ownership:
  - shell owns chrome
  - the app-surface baseline owns page framing and state language
  - each route owns only its domain-specific content blocks
- api ownership:
  - unchanged unless the slice uncovers contract gaps that block explicit UI states
- db/source ownership:
  - unchanged
- permission enforcement:
  - unchanged in source, but expressed more consistently in route-level UI states
- truth behavior:
  - truth-read surfaces and workspace-read surfaces remain compositionally related but semantically distinct
- runtime behavior:
  - user can move across core routes and encounter a stable system language rather than route-by-route improvisation

## 6. Files And Surfaces Touched

- files touched:
  - expected primary scope:
    - `apps/web/src/app/_platform/shell/*`
    - `apps/web/src/app/_platform/app-surface/*`
    - `apps/web/src/app/_features/events-workspace/*`
    - any newly promoted app-surface primitives under `_platform` or other approved app-level public boundary
- routes touched:
  - `/app/events`
  - `/app/audit`
  - `/app/partners`
- contracts touched:
  - page framing and state-surface contracts in the web app only
- tests touched:
  - route-adjacent page tests for the affected authenticated surfaces
- removed paths or fallback logic:
  - route-local improvised page wrappers and duplicated state surface patterns

## 7. Validation Evidence

List only commands or checks actually executed.

- typecheck:
  - required on `@afenda/web`
- lint:
  - required on `@afenda/web`
- compliance:
  - required: `pnpm run script:check-app-surface`
- targeted tests:
  - required for affected page and route surfaces
- build:
  - required on `@afenda/web`
- manual qa:
  - navigate across the first core authenticated routes and verify the baseline holds visually and behaviorally

Validation not executed:

- no repo-wide horizontal cleanup is required for this slice by default
- no full-suite signoff unless this slice deliberately takes ownership of that validation surface

## 8. Evaluation Scorecard

Score from `0.0` to `10.0`.

- `boundary_clarity`: target `9.0+`
- `truth_correctness`: target `8.0+`
- `permission_correctness`: target `8.0+`
- `api_contract_quality`: target `n/a` unless API changes are required
- `frontend_separation`: target `9.0+`
- `test_coverage_for_slice`: target `8.0+`
- `refactor_safety`: target `8.5+`
- `operational_maturity`: target `8.0+`

Overall:

- `before_score`: to be recorded at implementation start
- `after_score`: to be recorded at slice closure
- `net_improvement`: to be recorded at slice closure

## 9. What Improved

Only list material improvements created by this slice.

- core authenticated routes now share one operating-surface baseline
- state treatment is part of the system language, not route-specific filler
- future product slices can compose from a disciplined UI baseline instead of copying local page patterns

## 10. Remaining Debt

Only list debt that still exists after the slice closes.

- vendor chunk warning
  - `separate_health_slice`
- full-web test suite end-to-end execution status
  - `separate_health_slice`
- any route outside the chosen authenticated baseline scope
  - `non_blocking_followup`

## 11. Lessons To Apply Immediately

Capture process improvements to carry into the next slice now.

- contract improvements:
  - lock the page-owned UI contract before editing components
- serializer or response-shape improvements:
  - keep UI baseline work frontend-first unless explicit API ambiguity blocks it
- permission-boundary improvements:
  - make forbidden and blocked states part of the baseline, not custom route work
- validation improvements:
  - validate only the touched surfaces, but make visual and behavioral consistency part of the slice evidence
- anti-drift improvements:
  - promote reusable app-surface primitives early instead of copying near-identical wrappers into features

## 12. Anti-Patterns Exposed

Record the exact wrong patterns this slice revealed.

- shared convenience data reused across unrelated surfaces
- permission enforced only in UI
- fallback path masking missing authority
- workspace projection leaking into truth surfaces
- broad cleanup attempted instead of bounded closure

Add specific notes:

- route-local page shells become debt quickly when three or more authenticated surfaces need the same rhythm
- once a baseline surface exists, drift should be caught by a dedicated compliance check instead of waiting for review
- marketing-grade composition should not be imported into authenticated operating surfaces by accident

## 13. Next Slice Recommendation

- `recommended_next_slice`: `Events Operating Surface Baseline Application`
- `why_this_next`: it applies the new baseline to the first real authenticated product surface without widening the scope to every app route
- `must_not_mix_with`: vendor chunk work, full-suite cleanup, marketing redesign, auth refactor

## 14. Closure Statement

`This slice is closed when the first authenticated app surfaces share one deliberate operating-surface baseline, with explicit state handling and no route-local layout improvisation.`
