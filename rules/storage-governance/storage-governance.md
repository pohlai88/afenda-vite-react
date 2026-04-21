# Storage Governance

## Purpose

Storage roots hold legacy material, snapshots, and backups that are intentionally outside the active runtime topology.

They are allowed to exist, but they must not drift into an undocumented dumping ground.

## Rules

- Storage roots are declared centrally.
- Every top-level storage entry must be registered in machine-readable config.
- Every storage root must carry a `README.md`.
- Loose top-level files are denied unless explicitly allowed.
- Snapshot-style entries should carry a date suffix when they represent a point-in-time backup.
- Storage rules must stay separate from active app/package filesystem rules.

## Current storage roots

- `.legacy/`
- `archives/`

## Automation path

- `pnpm run script:check-storage-governance`
- `pnpm run script:generate-storage-governance-report`

Root `pnpm run check` and pre-commit should run the checker so undocumented storage drift is blocked automatically.
