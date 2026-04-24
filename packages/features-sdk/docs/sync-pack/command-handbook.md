---
title: Sync-Pack Command Handbook
description: Operator handbook for Sync-Pack commands, usage patterns, JSON/CI behavior, and common fixes.
status: active
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
surfaceType: docs
relatedDomain: feature-sync-pack
order: 20
---

# Sync-Pack Command Handbook

This handbook is based on the current command definitions in `src/sync-pack/cli/shared.ts` and supporting tests.

## Command groups

| Group    | Commands                                                                                           | Purpose                              |
| -------- | -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| start    | `feature-sync`, `feature-sync:help`                                                                | Safe entrypoint and grouped help     |
| workflow | `feature-sync:verify`, `feature-sync:quality-validate`                                             | Supported workflow commands          |
| gate     | `feature-sync:release-check`, `feature-sync:check`, `feature-sync:doctor`, `feature-sync:validate` | CI-safe release and validation gates |
| operator | `feature-sync:rank`, `feature-sync:report`, `feature-sync:generate`, `feature-sync:scaffold`       | Human-oriented utilities             |

## Global behavior rules

- Bare `feature-sync` maps to **quickstart only**.
- `verify` runs steps in this order: `release-check -> check -> doctor -> validate`.
- `quality-validate` runs the package-first validation sequence and closure classification.
- gated findings now include exact rerun commands and governed doc references.
- Gate/workflow commands support `--json` and `--ci`.
- Human-oriented commands do **not** support `--json` or `--ci` unless explicitly defined.
- `--help` cannot be combined with other flags.

---

## `pnpm run feature-sync`

### Purpose

Print the deterministic quickstart path.

### When to use

- first run after clone
- when handing the tool to a junior operator
- when you are not sure which command should run next

### Example

```txt
pnpm run feature-sync
```

### Output meaning

You should see guidance such as:

- what Sync-Pack is
- what command to run first
- explicit next paths like `feature-sync:verify`

### Exit behavior

- success exit when guidance prints normally

### Common failure

- package not built or workspace command not available

### Fix

```txt
pnpm --filter @afenda/features-sdk build
```

---

## `pnpm run feature-sync:help`

### Purpose

Show grouped command help and examples.

### When to use

- when you need command discovery
- when you want examples before running a command

### Example

```txt
pnpm run feature-sync:help
```

### Output meaning

Help output is grouped into:

- Start Here
- Operator Workflow
- Release Gates
- Operator Utilities

### Exit behavior

- success exit when help prints

---

## `pnpm run feature-sync:verify`

### Purpose

Run the supported daily operator workflow across all release gates.

### When to use

- daily package health check
- pre-handoff verification
- pre-internal-release validation

### Example

```txt
pnpm run feature-sync:verify
pnpm run feature-sync:verify -- --json --ci
```

### Output meaning

The result contains ordered steps:

1. `release-check`
2. `check`
3. `doctor`
4. `validate`

Each step reports pass, warn, or fail behavior through findings and counts.

### Exit behavior

- in normal text mode, review findings manually
- in `--ci` mode, errors fail the process
- warnings alone remain non-blocking

### Common failure

- missing built assets
- generated pack problems
- catalog or major version drift
- invalid seed metadata

### Fix

Run the failing gate separately:

```txt
pnpm run feature-sync:release-check
pnpm run feature-sync:check
pnpm run feature-sync:doctor
pnpm run feature-sync:validate
```

---

## `pnpm run feature-sync:quality-validate`

### Purpose

Run the full package-first internal validation workflow for `@afenda/features-sdk`.

### When to use

- before promoting the package into `Next` roadmap work
- before internal release or handoff
- when you need one closure verdict for package health

### Example

```txt
pnpm run feature-sync:quality-validate
pnpm run feature-sync:quality-validate -- --preflight
pnpm run feature-sync:quality-validate -- --json --ci
```

### Output meaning

The result reports:

- commands executed
- PASS/WARN/FAIL per step
- blocking findings
- non-blocking findings
- owner and disposition for each finding
- final closure verdict

### Exit behavior

- `PASS`: package is eligible to move into `Next`
- `WARN`: package may proceed, but warnings remain tracked
- `FAIL`: stop and fix before promotion

### Common failure

- release-gate contract drift
- root command/help drift
- docs surface drift
- package-owned warnings inside `features-sdk`
- out-of-package warnings that must stay visible until fixed or explicitly waived

### Fix

Use the listed owner/disposition in the output, then rerun:

```txt
pnpm run feature-sync:quality-validate
```

---

## `pnpm run feature-sync:release-check`

### Purpose

Validate `FSDK-CONTRACT-001` package publication integrity.

### When to use

- before internal release or distribution
- when package metadata or docs were changed
- when build artifacts may be stale or missing

### Example

```txt
pnpm run feature-sync:release-check
pnpm run feature-sync:release-check -- --json --ci
```

### Output meaning

Checks include:

- package metadata rules
- export targets
- CLI bin targets
- required files entries
- required docs, rules, and seed files
- required built template assets
- runtime `zod` dependency
- node engine parity with root policy

### Exit behavior

- any error should be treated as blocking

### Common failure

- `missing-export-target`
- `missing-bin-target`
- `missing-required-package-file`
- `missing-required-build-asset`

### Fix

```txt
pnpm --filter @afenda/features-sdk build
```

If build is not enough, inspect `packages/features-sdk/package.json`, `docs/sync-pack`, and `rules/sync-pack`.

Use the linked remediation doc when the failure code is unfamiliar:

- `docs/sync-pack/finding-remediation-catalog.md`

---

## `pnpm run feature-sync:check`

### Purpose

Validate generated Sync-Pack document structure and candidate/path alignment.

### When to use

- after generating planning packs
- before implementation handoff
- when a generated pack was edited manually

### Example

```txt
pnpm run feature-sync:check
pnpm run feature-sync:check -- --json --ci
```

### Output meaning

Checks include:

- pack file contract: exactly 11 expected files
- candidate id matches pack directory
- candidate category matches parent directory
- `adopt` requires `approved`
- high sensitivity requires security review
- markdown sections must not be empty

### Exit behavior

- errors are blocking

### Common failure

- `no-generated-packs`
- `pack-file-contract-mismatch`
- `candidate-id-path-mismatch`
- `empty-pack-section`

### Fix

```txt
pnpm run feature-sync:generate
pnpm run feature-sync:check
```

---

## `pnpm run feature-sync:doctor`

### Purpose

Inspect workspace dependency and catalog drift.

### When to use

- before release or dependency updates
- when package versions drift from workspace policy
- when CI reports dependency governance issues

### Example

```txt
pnpm run feature-sync:doctor
pnpm run feature-sync:doctor -- --json --ci
```

### Output meaning

Checks include:

- guarded major versions for critical packages like `zod` and Tailwind 4 tooling
- catalog major version drift
- packages not using `catalog:` when catalog data exists

### Exit behavior

- errors fail in CI mode
- warnings alone remain non-blocking

### Common failure

- `guarded-major-version-mismatch`
- `catalog-major-version-drift`
- `catalog-not-used`

### Fix

- align declared major versions with workspace policy
- replace explicit versions with `catalog:` where policy allows
- rerun `pnpm run feature-sync:doctor` after each manifest change

---

## `pnpm run feature-sync:validate`

### Purpose

Validate curated seed input.

### When to use

- after editing seed candidates
- before ranking, generating, or reporting

### Example

```txt
pnpm run feature-sync:validate
pnpm run feature-sync:validate -- --json --ci
```

### Output meaning

Current implementation resolves and reads the seed path and returns candidate count when parsing succeeds.

The underlying schema contract is defined by `appCandidateSchema`.

### Exit behavior

- invalid seed parsing or workspace discovery should be treated as blocking

### Common failure

- invalid candidate field values
- wrong lane/category relationship
- bad URL or id format

### Fix

See [metadata-reference.md](./metadata-reference.md) and the finding remediation catalog for invalid seed finding codes.

---

## `pnpm run feature-sync:rank`

### Purpose

Print candidate priority scoring evidence.

### When to use

- to compare candidate priority
- to explain why a candidate is treated as critical, essential, or good-to-have

### Example

```txt
pnpm run feature-sync:rank
pnpm run feature-sync:rank -- --category business-saas
pnpm run feature-sync:rank -- --pack mini-developer/internal-app-builder-sandbox
```

### Output meaning

Human-oriented scoring output for review.

Supported candidate filters:

- `--category`
- `--lane`
- `--owner`
- `--pack`

### Exit behavior

- not designed as a CI gate

### Common failure

- unsupported `--json` / `--ci`
- no candidates matched the requested filters

### Fix

Run without CI-only flags and confirm the selected category, lane, owner team, or pack id exists.

---

## `pnpm run feature-sync:report`

### Purpose

Print grouped candidate portfolio evidence.

### When to use

- to review portfolio shape across categories or priorities
- to support human planning discussions

### Example

```txt
pnpm run feature-sync:report
pnpm run feature-sync:report -- --lane operate
```

### Output meaning

Prints grouped portfolio evidence for the selected candidate slice.

### Exit behavior

- human-oriented, not a CI gate

### Common failure

- no candidates matched the requested filters

### Fix

- loosen the filter or confirm the candidate id, category, or owner team

---

## `pnpm run feature-sync:generate`

### Purpose

Generate planning packs from the curated seed.

### When to use

- after validating seed candidates
- before pack review or implementation handoff

### Example

```txt
pnpm run feature-sync:generate
pnpm run feature-sync:generate -- --owner "Operations Platform"
```

### Output meaning

Writes generated packs into the governed generated-packs area.

The same candidate filters supported by `rank` and `report` also work here.

### Common failure

- follow-up `check` failures after generation
- no candidates matched the requested filters

### Fix

```txt
pnpm run feature-sync:check
```

If no candidates matched:

- confirm the filter values
- rerun without filters to inspect the full seed

---

## `pnpm run feature-sync:scaffold`

### Purpose

Generate a tech-stack scaffold manifest.

### When to use

- when a feature candidate needs a dependency/script starting point
- when you want governed stack recommendations by category

### Example

```txt
pnpm run feature-sync:scaffold -- --app-id internal-support --category business-saas
```

### Output meaning

Produces a scaffold manifest shaped by `stackScaffoldManifestSchema`.

The scaffold now includes:

- dependency recommendations
- planning-pack placement hints
- suggested web feature and API module/file paths
- suggested route base paths
- recommended next commands

### Common failure

- invalid category
- invalid app id
- workspace discovery errors

### Fix

- use a valid governed category
- use kebab-case app ids
- run inside the Afenda pnpm workspace
