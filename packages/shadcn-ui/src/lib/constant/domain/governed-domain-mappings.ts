/**
 * MODULE ENTRYPOINT — constant-domain
 * Export barrel for governed domain mapping constants.
 * Scope: re-exports canonical domain-to-UI mapping modules from one reviewed surface.
 * Consumption: import from this barrel when callers need multiple domain mappings.
 * Boundaries: keep exports aligned with canonical source modules and avoid duplicate mapping homes.
 * Changes: update source files first, then keep this barrel synchronized.
 * Purpose: provide one reviewable entry surface for domain mapping constants.
 */
export * from "./allocation"
export * from "./invariant"
export * from "./reconciliation"
export * from "./settlement"
