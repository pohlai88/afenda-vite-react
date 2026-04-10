/**
 * GOVERNANCE ISSUE CODES — shell registry
 * Canonical codes for registry ↔ contract, slot policy, slot contracts, and parent-frame checks.
 * Scope: `validate-shell-registry`, CI, unit tests.
 * Purpose: const + derived union for autocomplete; wire values are stable (do not rename casually).
 *
 * Keep in sync with `validate-shell-registry.ts`.
 */
export const ShellRegistryIssueCode = {
  REGISTRY_KEY_CONTRACT_KEY_MISMATCH: "registry_key_contract_key_mismatch",
  DUPLICATE_CONTRACT_KEY: "duplicate_contract_key",
  SHELL_AWARE_MISSING_ZONE: "shell_aware_missing_zone",
  SHELL_AGNOSTIC_HAS_ZONE: "shell_agnostic_has_zone",
  SHELL_AGNOSTIC_HAS_DEPENDENCY: "shell_agnostic_has_dependency",
  OUTSIDE_SHELL_PROVIDER_WITH_REQUIRED_METADATA:
    "outside_shell_provider_with_required_metadata",
  MISSING_SLOT_MAPPING: "missing_slot_mapping",
  SINGLETON_SLOT_CONFLICT: "singleton_slot_conflict",
  SLOT_ZONE_MISMATCH: "slot_zone_mismatch",
  SLOT_KIND_NOT_ALLOWED: "slot_kind_not_allowed",
  STRUCTURAL_FRAME_SLOT_OWNER_MISMATCH: "structural_frame_slot_owner_mismatch",
  FRAME_COMPONENT_IN_NON_FRAME_SLOT: "frame_component_in_non_frame_slot",
  OCCUPANT_COMPONENT_IN_FRAME_SLOT: "occupant_component_in_frame_slot",
  SLOT_CONTRACT_ROLE_MISMATCH: "slot_contract_role_mismatch",
  SLOT_CONTRACT_ZONE_MISMATCH: "slot_contract_zone_mismatch",
  SLOT_CONTRACT_MISSING_FOR_POLICY_SLOT: "slot_contract_missing_for_policy_slot",
  FRAME_PARENT_FRAME_SLOT_MUST_BE_NULL: "frame_parent_frame_slot_must_be_null",
  OCCUPANT_PARENT_FRAME_MISSING: "occupant_parent_frame_missing",
  OCCUPANT_PARENT_FRAME_UNKNOWN: "occupant_parent_frame_unknown",
  OCCUPANT_PARENT_MUST_BE_STRUCTURAL_FRAME: "occupant_parent_must_be_structural_frame",
  OCCUPANT_PARENT_FRAME_ZONE_MISMATCH: "occupant_parent_frame_zone_mismatch",
  OCCUPANT_PARENT_FRAME_NOT_ACTIVE: "occupant_parent_frame_not_active",
} as const

/** Union of all `ShellRegistryIssueCode` string literals (use for `ShellRegistryIssue["code"]`). */
export type ShellRegistryIssueCode =
  (typeof ShellRegistryIssueCode)[keyof typeof ShellRegistryIssueCode]
