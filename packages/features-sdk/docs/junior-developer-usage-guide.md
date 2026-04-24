---
title: Junior Developer Usage Guide
description: Junior-friendly usage guide for using Sync-Pack to validate, generate, and hand off internal feature packs.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 4
---

# Junior Developer Usage Guide

This guide is for junior developers who need to use `@afenda/features-sdk` without learning the whole package internals first.

## What This Tool Is For

Use Sync-Pack when you need to:

- validate feature candidate metadata
- focus work on one category, lane, owner team, or pack
- generate governed planning packs
- inspect existing generated packs
- generate a scaffold with package placement and route hints
- verify that a feature pack is ready for internal handoff
- understand the remediation path when a gate fails

Do not use it as a production app runtime package.

It is a planning, validation, and scaffold package.

## Safe Command Order

From the monorepo root:

```txt
pnpm run feature-sync
pnpm run feature-sync:validate
pnpm run feature-sync:rank
pnpm run feature-sync:generate
pnpm run feature-sync:check
pnpm run feature-sync:verify
```

Use this sequence when you are working from candidate metadata to governed output.

If you changed the SDK package, rules, or docs rather than only candidate content, finish with:

```txt
pnpm run feature-sync:quality-validate
```

## Which Command To Use

| If you need to...                               | Run                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| understand the package first                    | `pnpm run feature-sync`                                                                    |
| validate the seed file before editing more      | `pnpm run feature-sync:validate`                                                           |
| see how candidates are prioritized              | `pnpm run feature-sync:rank`                                                               |
| narrow work to one category or pack             | `pnpm run feature-sync:rank -- --category business-saas`                                   |
| create planning packs                           | `pnpm run feature-sync:generate`                                                           |
| generate one pack instead of the full seed      | `pnpm run feature-sync:generate -- --pack internal-support-crm`                            |
| confirm generated pack structure                | `pnpm run feature-sync:check`                                                              |
| run the supported final workflow                | `pnpm run feature-sync:verify`                                                             |
| inspect dependency or stack drift               | `pnpm run feature-sync:doctor`                                                             |
| bootstrap a new internal feature implementation | `pnpm run feature-sync:scaffold -- --app-id internal-support-crm --category business-saas` |

## Useful Filter Pattern

The human-oriented candidate commands now support the same filter family:

```txt
--category <category>
--lane <lane>
--owner <team>
--pack <id-or-category/id>
```

Use them with:

- `feature-sync:rank`
- `feature-sync:report`
- `feature-sync:generate`

Examples:

```txt
pnpm run feature-sync:report -- --lane operate
pnpm run feature-sync:generate -- --owner "Operations Platform"
pnpm run feature-sync:rank -- --pack mini-developer/internal-app-builder-sandbox
```

## What You Usually Edit

Most junior developers will touch one of these:

- `rules/sync-pack/openalternative.seed.json`
- generated planning packs under `docs/sync-pack/generated-packs/**`
- supporting rules or docs when a new internal workflow becomes governed

Most junior developers should **not** start by editing:

- CLI dispatch code
- package export maps
- package contract logic
- release gate plumbing

Those surfaces are more sensitive and usually belong to SDK maintainers.

## What A Good Result Looks Like

You are in a good state when:

- `validate` succeeds
- `generate` writes the expected pack folders
- `check` succeeds
- `verify` succeeds without errors

Warnings from `doctor` can still be acceptable, but you should read them and understand whether they are known policy drift or a real problem.

Every blocking gate finding should now include:

- the reason it failed
- the file involved when available
- the next command to rerun
- the governed doc to read if the fix is unclear

When you use `scaffold`, a good result also includes:

- a generated `STACK_CONTRACT.json`
- suggested implementation paths under `apps/web/src/app/_features/*`
- suggested API module and route file placement under `apps/api/src/*`
- recommended next commands for verification

## Common Mistakes

### Running `verify` first while the seed is still broken

Better path:

```txt
pnpm run feature-sync:validate
```

Fix metadata first, then continue.

### Editing generated pack folder names without matching the candidate id

`check` will fail if the pack path and candidate metadata diverge.

If you rename a pack, update the candidate data so the id and category still match the folder structure.

### Treating `doctor` warnings as either nothing or full failure

Use this rule:

- warnings are not CI-blocking by default
- warnings still deserve a human decision

### Using operator utilities like gates

`rank`, `report`, `generate`, and `scaffold` are operator utilities.

Use `release-check`, `check`, `doctor`, `validate`, and `verify` for gated validation behavior.

## If You Only Need To Read An Existing Pack

Read in this order:

1. `00-candidate.json`
2. `01-feature-brief.md`
3. `02-product-requirement.md`
4. `03-technical-design.md`
5. `08-implementation-plan.md`
6. `10-handoff.md`

That gives you the fastest understanding of:

- what the idea is
- what should be built
- how it should fit technically
- what happens next

## When To Ask For Help

Ask a package maintainer when:

- `release-check` fails and you are not editing package metadata
- CLI flags behave differently from the docs
- a generated pack is valid in content but still fails `check`
- you think a rule itself is wrong, not just your input

## Read Next

- [getting-started.md](./getting-started.md)
- [junior-devops-quickstart.md](./junior-devops-quickstart.md)
- [sync-pack/command-handbook.md](./sync-pack/command-handbook.md)
- [sync-pack/troubleshooting.md](./sync-pack/troubleshooting.md)
