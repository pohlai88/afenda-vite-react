# `design-architecture/scripts`

Build-time CLIs and emitters for the design-system token pipeline. They are **not** part of the browser bundle.

## Important: how to run npm scripts (PowerShell / bash)

Package script names such as `test:generated-drift-check` are **not** shell commands. If you run:

```text
test:generated-drift-check
```

PowerShell will report “not recognized” — use **`pnpm run`** (or `pnpm exec tsx` on a file below).

## Quick reference — generated theme

```bash
# Repo root — drift check (full pipeline)
pnpm run design-system:generated-drift-check

# Repo root — regenerate only
pnpm run design-system:generate

# packages/design-system — same drift check
pnpm run test:generated-drift-check

# Direct tsx (from packages/design-system)
pnpm exec tsx design-architecture/scripts/run-generated-theme-drift-check.ts
```

Regenerate only, from **`packages/design-system`**:

```bash
pnpm run generate-design-system
```

Same via monorepo filter (from repo root):

```bash
pnpm --filter @afenda/design-system run generate-design-system
pnpm --filter @afenda/design-system run test:generated-drift-check
```

## Commands (via `@afenda/design-system` `package.json`)

| Script                       | What it does                                                                                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `generate-design-system`     | Writes `src/generated/generated-theme.css` and `generated-theme.manifest.json` from the tokenization pipeline (Tailwind adapter included).                                                                         |
| `check:imports`              | Scans package-local design-system sources and root maintenance scripts for `@afenda/design-system/*` imports, then checks them against governance allowlists (exit code 1 on violation).                           |
| `test:generated-drift-check` | Runs **`run-generated-theme-drift-check.ts`**: regenerate → `git diff` on `generated-theme.css` and `generated-theme.manifest.json` vs `HEAD`. Manifest `emitRevision` only changes when emitted CSS bytes change. |

From **`packages/design-system`**:

```bash
pnpm run check:imports
```

## Direct `tsx` (optional)

From **`packages/design-system`** (paths relative to that package):

```bash
pnpm exec tsx design-architecture/scripts/generate-design-system.ts
pnpm exec tsx design-architecture/scripts/run-generated-theme-drift-check.ts
pnpm exec tsx design-architecture/scripts/check-design-system-imports.ts
```

## Files

| File                                 | Role                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `run-generated-theme-drift-check.ts` | **Orchestrator** for CI/local drift: regenerate artifacts → `git diff` on CSS + manifest vs `HEAD`. Prefer `pnpm run test:generated-drift-check`. |
| `generate-design-system.ts`          | CLI entry: emits canonical generated theme CSS + manifest under `design-architecture/src/generated/`.                                             |
| `generate-theme-css-artifact.ts`     | Library: `generateThemeCssArtifact`, `buildArtifactThemeCssString`; used by the generator and importable via `@afenda/design-system/scripts`.     |
| `check-design-system-imports.ts`     | Governance: validates design-system package imports and root maintenance scripts against `src/governance`.                                        |
| `index.ts`                           | Barrel for **programmatic** use of `generate-theme-css-artifact` only (do not re-export CLI entrypoints that run on import).                      |

## Related

- Token tests: `pnpm --filter @afenda/design-system run validate-tokens`
- Governance sources: `design-architecture/src/governance/`
