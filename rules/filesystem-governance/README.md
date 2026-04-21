# Filesystem Governance

This ruleset governs path shape, naming, promoted layers, and anti-drift checks.

Artifacts in this directory:

- [`filesystem-governance.md`](./filesystem-governance.md): authoritative policy text
- [`filesystem-governance.config.json`](./filesystem-governance.config.json): machine-readable checker input
- [`refactor-planning.md`](./refactor-planning.md): practical repo refactor backlog against this policy
- [`repo-rollout-matrix.md`](./repo-rollout-matrix.md): zone-by-zone ownership and rollout guidance
- [`repo-backlog-screening.md`](./repo-backlog-screening.md): manual next-hotspot screening outside the current checker scope

How to use it:

1. Read the policy before adding directories or renaming cross-cutting modules.
2. Update the config when governance needs new promoted layers or denylist changes.
3. Run `pnpm run script:check-filesystem-governance` before and during refactors.
4. Use the rollout matrix to decide which repo area should be governed next.

Scope:

- This policy is generic enough for repo-wide reuse.
- The current config is intentionally narrow and functional-first: it enforces the most drift-prone issues first.
- The rollout plan documents which areas are already stable and which areas should be refactored next.
