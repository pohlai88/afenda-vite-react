# Functional Slice Closure Record

Use this template to close a bounded functional slice.

This is not a generic progress note and not a horizontal cleanup report.
It records whether one slice moved from a weak starting state to a durable end state with explicit evidence.

Use this after a slice is implemented and validated.

---

## 1. Slice Identity

- `slice_name`:
- `ownership_boundary`:
  - `apps/web`:
  - `apps/api`:
  - `packages/_database`:
- `source_of_truth`:
- `forbidden_dependency`:
- `status`:
  - `draft`
  - `in_progress`
  - `closed`
  - `closed_with_followup_debt`

---

## 2. Primary Contract

- `actor`:
- `point_a`:
- `action`:
- `point_c`:

Operational path:

1.
2.
3.
4.

---

## 3. Definition Of Done

- `ui`:
- `api`:
- `db`:
- `permission`:
- `truth`:
- `runtime_contract`:
- `failure`:
- `enforcement`:
  - `script_check`:
  - `lint_or_ast_rule`:
  - `boundary_rule`:
- `adoption_expansion`:
  - `newly_adopted_surfaces`:
  - `added_to_enforcement_immediately`:
- `removed_paths`:

---

## 4. Before State

Describe the exact pre-slice condition.

- existing dependency shape:
- coupling or ambiguity:
- permission weakness:
- truth/source weakness:
- runtime weakness:
- enforcement weakness:
- validation weakness:

---

## 5. After State

Describe the exact post-slice condition.

- final dependency shape:
- route or page ownership:
- api ownership:
- db/source ownership:
- permission enforcement:
- truth behavior:
- runtime behavior:
- enforcement behavior:

---

## 6. Files And Surfaces Touched

- files touched:
- routes touched:
- contracts touched:
- tests touched:
- enforcement touched:
- removed paths or fallback logic:

---

## 7. Validation Evidence

List only commands or checks actually executed.

- typecheck:
- lint:
- compliance:
- runtime verification:
- targeted tests:
- build:
- manual qa:

Validation not executed:

- ***

## 8. Evaluation Scorecard

Score from `0.0` to `10.0`.

- `boundary_clarity`:
- `truth_correctness`:
- `permission_correctness`:
- `api_contract_quality`:
- `frontend_separation`:
- `test_coverage_for_slice`:
- `refactor_safety`:
- `operational_maturity`:

Overall:

- `before_score`:
- `after_score`:
- `net_improvement`:

---

## 9. What Improved

Only list material improvements created by this slice.

-
-
- ***

## 10. Remaining Debt

Only list debt that still exists after the slice closes.

-
-
-

Mark each as one of:

- `blocking_next_slice`
- `non_blocking_followup`
- `separate_health_slice`

---

## 11. Lessons To Apply Immediately

Capture process improvements to carry into the next slice now.

- contract improvements:
- serializer or response-shape improvements:
- permission-boundary improvements:
- runtime-contract improvements:
- validation improvements:
- anti-drift improvements:

---

## 12. Anti-Patterns Exposed

Record the exact wrong patterns this slice revealed.

- shared convenience data reused across unrelated surfaces:
- permission enforced only in UI:
- fallback path masking missing authority:
- workspace projection leaking into truth surfaces:
- broad cleanup attempted instead of bounded closure:

Add specific notes:

-
- ***

## 13. Enforcement Upgrade Rule

Use this rule for every slice:

- if a slice introduces a new governed surface, add or update enforcement in the same slice
- do not leave adopted surfaces protected only by memory or review comments
- prefer lint/AST enforcement over script-only enforcement when the pattern is stable enough
- if full lint/AST enforcement is not yet reasonable, record the exact stopgap and the trigger for upgrading it
- if a runtime contract was guessed and later corrected, record the real contract source before closing the slice

---

## 14. Next Slice Recommendation

- `recommended_next_slice`:
- `why_this_next`:
- `must_not_mix_with`:

---

## 15. Closure Statement

Use one direct sentence:

`This slice is closed when ...`

Example:

`This slice is closed when the dedicated route, API contract, persistence source, permission gate, and proof evidence all align without fallback ambiguity.`
