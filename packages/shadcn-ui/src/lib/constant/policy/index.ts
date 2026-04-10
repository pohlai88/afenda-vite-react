/**
 * MODULE ENTRYPOINT — policy
 * Public export barrel for constant-layer policy modules.
 * Scope: re-exports canonical policy objects, manifests, schema helpers, and validators.
 * Layer order: base policies -> manifests -> validation/schema -> shell policy surface.
 * Boundaries: keep exports intentional so internal-only helpers stay private.
 * Purpose: provide one stable import surface for policy governance consumers.
 */
// --- Canonical policies
export * from "./class-policy"
export * from "./class-governance-scope"
export * from "./component-policy"
export * from "./import-policy"
export * from "./ownership-policy"
export * from "./radix-policy"
export * from "./react-policy"
export * from "./shadcn-policy"
export * from "./tailwind-policy"
export * from "./metadata-ui"
export * from "./style-binding"

// --- Manifest and rule metadata
export * from "./class-policy-manifest"
export * from "./class-policy-eslint-rule-manifest"
export * from "./component-policy-manifest"
export * from "./import-policy-manifest"
export * from "./ownership-policy-manifest"
export * from "./radix-contract-policy-manifest"
export * from "./radix-policy-manifest"
export * from "./react-policy-manifest"
export * from "./shadcn-policy-manifest"
export * from "./tailwind-policy-manifest"
export * from "./metadata-ui-policy-manifest"
export * from "./style-binding-policy-manifest"

// --- Validation and schema
export * from "./policy-manifest-schema"
export * from "./validate-policy-manifest"

// --- Shell policy subsystem
export * from "./shell"
