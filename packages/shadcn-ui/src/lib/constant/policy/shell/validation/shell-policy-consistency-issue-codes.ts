/**
 * ISSUE CODES — shell policy consistency validator
 * Stable codes for CI and tests. Keep in sync with `validate-shell-policy-consistency.ts`.
 */
export const ShellPolicyConsistencyIssueCode = {
  WORKSPACE_TENANT_POLICY_INCOMPATIBLE: "workspace_tenant_policy_incompatible",
  SLOT_LAYOUT_ZONE_MISSING: "slot_layout_zone_missing",
  OVERLAY_LAYOUT_MISSING: "overlay_layout_missing",
  OVERLAY_STACK_PRIORITY_COLLISION: "overlay_stack_priority_collision",
  SEARCH_RESULT_CLASSES_EMPTY: "search_result_classes_empty",
  TENANT_SWITCHER_DISALLOWED: "tenant_switcher_disallowed",
} as const

export type ShellPolicyConsistencyIssueCode =
  (typeof ShellPolicyConsistencyIssueCode)[keyof typeof ShellPolicyConsistencyIssueCode]
