# Admin Staging Module

This folder is the typed Afenda adaptation of the legacy CNA `@vierp/admin` package from [`.legacy/cna-templates/packages/admin`](/C:/NexusCanon/afenda-react-vite/.legacy/cna-templates/packages/admin).

It lives at `packages/admin` as workspace package `@afenda/admin`.

## What changed

- Prisma-era `tenant`, `user`, and `auditLog` assumptions were replaced with `@afenda/database` Drizzle exports.
- Legacy `tier` is no longer treated as a first-class tenant column. It is stored in tenant metadata as an admin planning/runtime hint.
- Audit writes now require governed action keys. Arbitrary legacy strings are no longer accepted.
- System health is probe-driven. Hardcoded fake module health checks were removed.

## Validation

Run from the repo root:

```powershell
pnpm exec tsc -p packages/admin/tsconfig.json
```
