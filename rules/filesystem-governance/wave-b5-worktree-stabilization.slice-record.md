# Wave B.5 Worktree Stabilization Slice Record

## 1. Slice Identity

- `slice_name`: `Wave B.5 — Worktree Stabilization`
- `ownership_boundary`:
  - `apps/web`: authenticated runtime, marketing public surface, and Vite build boundary are separated into explicit lanes
  - `apps/api`: API/auth/ops changes stay in an API lane
  - `packages/_database`: schema and truth-layer changes stay in a database lane
- `source_of_truth`: [`repo-closure-program.md`](./repo-closure-program.md), [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
- `forbidden_dependency`: repo-wide delete waves before lane ownership is explicit
- `status`: `closed`

## 2. Primary Contract

- `actor`: maintainer closing cleanup and hardening work in a dirty integration worktree
- `point_a`: the repo was greening up, but the worktree still spanned too many domains at once to make deletion and quarantine defensible
- `action`: maintainer declares bounded cleanup lanes and records which active slices belong to which lane
- `point_c`: future cleanup and follow-up work can be reviewed by lane rather than by one unbounded mixed slice

Operational path:

1. Identify the persistent domains that are already active in the worktree.
2. Declare bounded lanes and their ownership surfaces.
3. Record those lanes in the slice register.
4. Use those lanes as the prerequisite for future delete/quarantine work.

## 3. Definition Of Done

- `ui`: app runtime and marketing public work are no longer treated as one generic web slice
- `api`: API/auth/ops work has its own bounded lane
- `db`: database/truth work has its own bounded lane
- `permission`: no new permission surface in this slice
- `truth`: governance/toolchain and documentation/policy are separated from runtime surfaces
- `runtime_contract`: follow-up slices can state which lane they touch and which lanes they must not mix with
- `failure`: broad cleanup is blocked until it names its target lane(s)
- `enforcement`:
  - `script_check`: documentation and slice-register evidence only
  - `lint_or_ast_rule`: not introduced in this slice
  - `boundary_rule`: lane ownership is recorded, not yet machine-enforced
- `adoption_expansion`:
  - `newly_adopted_surfaces`: bounded cleanup lanes in the slice register
  - `added_to_enforcement_immediately`: lane discipline becomes the stated closure rule for Waves C-E
- `removed_paths`: none

## 4. Before State

- existing dependency shape: many unrelated edits existed together across root config, app shell, marketing, API, database, docs, and rules
- coupling or ambiguity: cleanup work could sprawl because the worktree lacked a declared lane model
- permission weakness: none specific to this slice
- truth/source weakness: future delete/quarantine work risked crossing domains without clear ownership
- runtime weakness: not the focus of this slice
- enforcement weakness: slice boundaries existed in intent but not in an explicit lane register
- validation weakness: reviewability and rollback boundaries were weak

## 5. After State

- final dependency shape: the slice register declares bounded lanes for governance/toolchain, web runtime shell, marketing public, API/ops/auth, database/truth, and docs/policy
- route or page ownership: marketing/public and authenticated runtime are explicitly separated
- api ownership: API/auth/ops work is isolated from web and database cleanup
- db/source ownership: database/truth work is isolated from runtime and docs cleanup
- permission enforcement: unchanged
- truth behavior: future closure waves can be evaluated against explicit lane ownership
- runtime behavior: unchanged
- enforcement behavior: broad delete/quarantine work is now procedurally blocked until it names the lane boundary

## 6. Files And Surfaces Touched

- files touched:
  - [`repo-closure-slice-register.md`](./repo-closure-slice-register.md)
  - [`wave-b5-worktree-stabilization.slice-record.md`](./wave-b5-worktree-stabilization.slice-record.md)
- routes touched: none
- contracts touched: repo closure lane contract only
- tests touched: none
- enforcement touched: slice register discipline
- removed paths or fallback logic: none

## 7. Validation Evidence

- typecheck: not applicable
- lint: not applicable
- compliance: lane declarations recorded in the slice register
- runtime verification: not applicable
- targeted tests: not applicable
- build: not applicable
- manual qa: not applicable

Validation not executed:

- machine enforcement of cleanup lanes

## 8. Evaluation Scorecard

- `boundary_clarity`: `8.9`
- `truth_correctness`: `8.3`
- `permission_correctness`: `8.0`
- `api_contract_quality`: `8.0`
- `frontend_separation`: `8.6`
- `test_coverage_for_slice`: `6.0`
- `refactor_safety`: `8.8`
- `operational_maturity`: `8.7`

Overall:

- `before_score`: `6.1`
- `after_score`: `8.3`
- `net_improvement`: `2.2`

## 9. What Improved

- The repo now has explicit bounded cleanup lanes instead of one undifferentiated mixed worktree.
- Future delete/quarantine work has a declared precondition.
- Rollback and review discussion can happen by lane instead of by vague “repo cleanup.”

## 10. Remaining Debt

- Lane discipline is procedural, not yet machine-enforced. `non_blocking_followup`
- The worktree still contains many historical mixed edits; this slice only bounded the future cleanup surface. `non_blocking_followup`
- Delete/quarantine work remains deferred until lane-local follow-up slices are opened. `blocking_next_slice`

## 11. Lessons To Apply Immediately

- contract improvements: every cleanup wave after green must name its lane boundary explicitly
- serializer or response-shape improvements: not applicable
- permission-boundary improvements: not applicable
- runtime-contract improvements: not applicable
- validation improvements: even documentation-only stabilization work needs a closure record
- anti-drift improvements: a slice register is useful only if it tracks bounded lanes, not just generic wave names

## 12. Anti-Patterns Exposed

- shared convenience data reused across unrelated surfaces: not exposed here
- permission enforced only in UI: not exposed here
- fallback path masking missing authority: not exposed here
- workspace projection leaking into truth surfaces: not exposed here
- broad cleanup attempted instead of bounded closure: this was the exact anti-pattern Wave B.5 was created to stop

Add specific notes:

- A green repo can still be operationally weak if the worktree is carrying uncontrolled mixed slices.
- Stabilization is not deletion; it is the prerequisite that makes deletion reviewable.

## 13. Enforcement Upgrade Rule

- every future closure slice must name its cleanup lane(s)
- no Wave C delete/quarantine work may start without a lane-local ownership statement
- if a change spans multiple lanes, its record must explain why and state the rollback surface

## 14. Next Slice Recommendation

- `recommended_next_slice`: `Wave D — Marketing Canonical Policy`
- `why_this_next`: the public marketing surface still contained a live canonical ambiguity that could now be fixed without crossing into unrelated lanes
- `must_not_mix_with`: broad delete/quarantine work

## 15. Closure Statement

`This slice is closed when the repo has explicit bounded cleanup lanes and future delete/quarantine work is blocked from starting without naming its lane boundary.`
