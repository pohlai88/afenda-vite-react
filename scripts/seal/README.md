# UI primitive sealing

This area groups the `packages/ui` primitive sealing workflow:

- `check-ui-primitives.ts` validates the sealed boundary and approved inventory.
- `lock-ui-primitives.ts` marks primitive files read-only and records the unlock-key hash.
- `unlock-ui-primitives.ts` validates the local unlock key and restores write access.

Use the root `pnpm run script:...` commands from the repository root rather than calling these files directly.
