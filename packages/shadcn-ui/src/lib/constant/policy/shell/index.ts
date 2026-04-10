/**
 * MODULE ENTRYPOINT — shell policy doctrine
 * Canonical export surface for shell-only policy, contract, registry, validation, provider, and selector modules.
 *
 * **Import path:** `@afenda/shadcn-ui/lib/constant/policy/shell` (see package `exports` and `README.md` in this folder).
 *
 * **Scope:** shell composition, slot, layout, metadata, tenant/workspace, search, state, overlay,
 * navigation, access, command, failure, responsiveness, observability, component registry,
 * validation, and runtime consumption surfaces.
 *
 * **Layer order (normalize imports):** policy → contract → registry → validation → runtime → vocabulary/manifest.
 * Leaf modules must not import this barrel when that would create a cycle; import peers directly instead.
 *
 * **Shell validation pipeline** (matches `validate-constants.ts` after registry key checks):
 * `validateShellRegistry` → `validateShellPolicyConsistency` → `validateShellStatePolicy` → `validateShellRuntimeContracts`.
 *
 * **State doctrine re-exports:** `./validation/validate-shell-state-policy` also exports `ShellStatePolicyIssueCode`,
 * `validateShellStateDoctrine`, `ShellStatePolicyUtils`, and related types (prefer that entry for state checks).
 *
 * **Distinct namespaces:** `ShellMetadataPolicyUtils` (policy) vs `ShellMetadataUtils` (contract) — use unique names
 * per module so `export *` stays unambiguous.
 */
// --- Policy (governance doctrine)
export * from "./policy/shell-policy"
export * from "./policy/shell-context-policy"
export * from "./policy/shell-slot-policy"
export * from "./policy/shell-layout-policy"
export * from "./policy/shell-metadata-policy"
export * from "./policy/shell-tenant-context-policy"
export * from "./policy/shell-workspace-context-policy"
export * from "./policy/shell-search-policy"
export * from "./policy/shell-state-policy"
export * from "./policy/shell-overlay-policy"
export * from "./policy/shell-navigation-policy"
export * from "./policy/shell-access-policy"
export * from "./policy/shell-command-policy"
export * from "./policy/shell-failure-policy"
export * from "./policy/shell-responsiveness-policy"
export * from "./policy/shell-observability-policy"

// --- Contract (schemas + registration truth)
export * from "./contract/shell-metadata-contract"
export * from "./contract/shell-component-contract"
export * from "./contract/shell-slot-contract"
export * from "./contract/shell-search-registration-contract"

// --- Registry (frozen key → row maps)
export * from "./registry/shell-component-registry"
export * from "./registry/shell-slot-registry"

// --- Validation (issue codes are exported alongside validators where applicable)
export * from "./validation/shell-registry-issue-codes"
export * from "./validation/validate-shell-registry"
export * from "./validation/shell-policy-consistency-issue-codes"
export * from "./validation/validate-shell-policy-consistency"
export * from "./validation/validate-shell-state-policy"
export * from "./validation/shell-runtime-contract-issue-codes"
export * from "./validation/validate-shell-runtime-contracts"

// --- Runtime (React provider + hooks + pure helpers)
export * from "./runtime/shell-provider"
export * from "./runtime/use-shell-metadata"
export * from "./runtime/shell-selectors"
export * from "./runtime/use-shell-selectors"
export * from "./runtime/shell-helpers"

// --- Vocabulary barrel + serialized manifest (drift baselines). Leaf keys: `shell-state-key-vocabulary.ts`.
export * from "./shell-values"
export * from "./shell-doctrine-manifest"
