---
title: Sync-Pack Troubleshooting
description: Failure isolation and recovery guide for Sync-Pack operators and contributors.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 50
---

# Sync-Pack Troubleshooting

Use this guide when `feature-sync:verify` or a direct Sync-Pack command fails.

## Fast isolation order

Run the failing workflow in the smallest safe pieces:

```txt
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

## Problem: quickstart/help command does not run

### Likely causes

- workspace dependencies not installed
- package not built
- wrong working directory

### Recovery

```txt
pnpm install
pnpm --filter @afenda/features-sdk build
pnpm run feature-sync
```

## Problem: `release-check` fails

### Typical causes

- missing `dist` outputs
- missing docs or rule files
- bad package metadata
- missing export/bin targets

### Recovery steps

1. rebuild the package
2. inspect `packages/features-sdk/package.json`
3. inspect `packages/features-sdk/docs/sync-pack`
4. inspect `packages/features-sdk/rules/sync-pack`

### Primary command

```txt
pnpm --filter @afenda/features-sdk build
```

## Problem: `check` fails

### Typical causes

- no generated packs yet
- generated pack directory names do not match candidate ids
- generated pack category directory does not match `internalCategory`
- markdown files are empty

### Recovery steps

```txt
pnpm run feature-sync:generate
pnpm run feature-sync:check
```

If still failing, inspect:

- `docs/sync-pack/generated-packs/**/00-candidate.json`
- category folder names
- empty markdown sections

## Problem: `doctor` reports drift

### Typical causes

- wrong major version for guarded packages like `zod`
- package declares explicit versions where `catalog:` is expected

### Recovery steps

- align dependency majors to workspace policy
- switch allowed dependencies to `catalog:`
- rerun doctor directly before verify
- use the remediation command/doc printed with the finding instead of guessing

```txt
pnpm run feature-sync:doctor
```

## Problem: `validate` fails after editing seed metadata

### Typical causes

- invalid URL
- invalid kebab-case id
- invalid enum value
- lane/category mismatch

### Recovery steps

1. inspect the failing candidate in `rules/sync-pack/openalternative.seed.json`
2. compare it to [metadata-reference.md](./metadata-reference.md)
3. rerun validate

```txt
pnpm run feature-sync:validate
```

## Problem: verify fails but step details are unclear

### Recovery steps

Use JSON output for clearer parsing:

```txt
pnpm run feature-sync:verify -- --json --ci
```

Then inspect:

- `steps[].name`
- `steps[].status`
- `findings[].code`
- `findings[].message`
- `findings[].remediation.command`
- `findings[].remediation.doc`

## Problem: human-oriented commands reject `--json`

### Expected behavior

This is by design for commands like:

- `rank`
- `report`
- `generate`
- `scaffold`

### Fix

Run them without `--json` and `--ci` unless the command definition explicitly supports those flags.

## Problem: running outside the Afenda workspace

### Symptoms

- workspace discovery errors
- package resolution failures
- seed or catalog lookup failures

### Fix

Run commands from inside the Afenda pnpm workspace root.

## Final recovery pattern

After any fix:

```txt
pnpm run feature-sync:verify
```

Do not stop at an individual green subcommand if the normal daily workflow is still red.

If you changed the package, docs, or contracts themselves, finish with:

```txt
pnpm run feature-sync:quality-validate
```
