# Filesystem Governance

This ruleset governs path shape, naming, promoted layers, and anti-drift checks.

Artifacts in this directory:

- [`filesystem-governance.md`](./filesystem-governance.md): authoritative policy text
- [`filesystem-governance.config.json`](./filesystem-governance.config.json): machine-readable checker input
- [`governance-done-checklist.md`](./governance-done-checklist.md): baseline stop line for “governance done” vs future tightening
- [`repo-closure-program.md`](./repo-closure-program.md): green-first repo closure doctrine, reviewed-exception policy, and wave execution order
- [`reviewed-exceptions.json`](./reviewed-exceptions.json): fixed ledger for non-obvious retained files that survive by reviewed exception
- [`repo-closure-slice-register.md`](./repo-closure-slice-register.md): active closure slices and must-not-mix boundaries while cleanup is in progress
- [`functional-slice-closure-record.template.md`](./functional-slice-closure-record.template.md): closure artifact template for bounded functional slices, including runtime-contract and enforcement-upgrade fields
- [`ui-operating-surface-baseline.slice-record.md`](./ui-operating-surface-baseline.slice-record.md): draft control record for the app-surface baseline slice before wider UI refactors
- [`refactor-planning.md`](./refactor-planning.md): practical repo refactor backlog against this policy
- [`repo-rollout-matrix.md`](./repo-rollout-matrix.md): zone-by-zone ownership and rollout guidance
- [`repo-backlog-screening.md`](./repo-backlog-screening.md): manual next-hotspot screening outside the current checker scope

How to use it:

1. Read the policy before adding directories or renaming cross-cutting modules.
2. Update the config when governance needs new promoted layers or denylist changes.
3. Run `pnpm run script:check-filesystem-governance` before and during refactors.
4. Use the rollout matrix to decide which repo area should be governed next.
5. Treat root `pnpm run check` and the pre-commit hook as the automatic enforcement path, not as optional documentation.
6. Use the governance done checklist as the stop line for MVP work; do not reopen foundational governance debates if the baseline checklist remains green.
7. When a slice adopts a new governed surface, update enforcement in the same slice rather than deferring it to a later cleanup wave.
8. Treat the reviewed-exception ledger as the only allowed survival proof for non-obvious retained files inside active scope.

Scope:

- This policy is generic enough for repo-wide reuse.
- The current config is intentionally narrow and functional-first: it enforces the most drift-prone issues first.
- Tracked source files inside governed roots are expected to use responsibility-shaped names; generic stems are denied by machine guardrail.
- The rollout plan documents which areas are already stable and which areas should be refactored next.
- The checker now validates config overlap, scans directories as well as files, and blocks stale generic directory drift before commit.
- Explicit public export surfaces may remain promoted by contract, but internal files under those roots still follow the naming doctrine.
- Workspace package roots are governed separately through `scripts/afenda.config.json` so package-level docs, scripts, config, and artifact directories stay intentional instead of escaping source-root policy.
