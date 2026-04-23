# Wave C.9 Shell Header-Actions Hook Matrix

This matrix records the bounded retirement of the dead internal shell header-actions hook in the `web-runtime-shell` lane.

| Stale surface | Live owner | Decision | Result |
| --- | --- | --- | --- |
| `apps/web/src/app/_platform/shell/hooks/use-shell-header-actions.ts` | `shell.headerActions` metadata, `validateShellMetadata`, and `resolveShellHeaderActions` | Retire the unused runtime hook because it had no consumers and no public surface; keep the governed contract, validation, and resolver only. | Shell header-action truth now matches the real runtime path: metadata -> validation -> resolver -> presentation consumer when needed. |
