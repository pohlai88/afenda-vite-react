/**
 * GOVERNANCE METADATA — governance-version
 * Canonical version marker for the governed constant and semantic architecture.
 * Scope: provides a single reviewed version value for tooling, validation, or migrations.
 * Consumption: read this value instead of hardcoding governance version literals elsewhere.
 * Changes: increment intentionally when governance behavior or compatibility meaningfully changes.
 * Purpose: provide one reviewable version marker for governance-aware consumers.
 */
export const governanceVersion = '1' as const
