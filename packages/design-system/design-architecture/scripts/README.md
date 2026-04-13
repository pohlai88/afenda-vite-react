# `design-architecture/scripts`

Build-time CLIs and emitters for the design-system token pipeline. They are **not** part of the browser bundle.

Run commands from the **monorepo root** with the package filter, or from **`packages/design-system`** with `pnpm run …`.

## Commands (via `@afenda/design-system` `package.json`)

| Script | What it does |
|--------|----------------|
| `generate-design-system` | Writes `src/generated/generated-theme.css` and `generated-theme.manifest.json` from the tokenization pipeline (Tailwind adapter included). |
| `check:imports` | Scans package-local design-system sources and root maintenance scripts for `@afenda/design-system/*` imports, then checks them against governance allowlists (exit code 1 on violation). |
| `test:generated-drift-check` | Regenerates theme artifacts then fails if the generated files drift from git (CI). |

### From monorepo root

```bash
pnpm --filter @afenda/design-system run generate-design-system
pnpm --filter @afenda/design-system run check:imports
pnpm --filter @afenda/design-system run test:generated-drift-check
```

### From `packages/design-system`

```bash
pnpm run generate-design-system
pnpm run check:imports
pnpm run test:generated-drift-check
```

### Direct `tsx` (optional)

From `packages/design-system`:

```bash
pnpm exec tsx design-architecture/scripts/generate-design-system.ts
pnpm exec tsx design-architecture/scripts/check-design-system-imports.ts
```

## Files

| File | Role |
|------|------|
| `generate-design-system.ts` | CLI entry: emits canonical generated theme CSS + manifest under `design-architecture/src/generated/`. |
| `generate-theme-css-artifact.ts` | Library: `generateThemeCssArtifact`, `buildArtifactThemeCssString`; used by the generator and importable via `@afenda/design-system/scripts`. |
| `check-design-system-imports.ts` | Governance: validates design-system package imports and root maintenance scripts against `src/governance`. |
| `index.ts` | Barrel for **programmatic** use of `generate-theme-css-artifact` only (do not re-export CLI entrypoints that run on import). |

## Related

- Token tests: `pnpm --filter @afenda/design-system run validate-tokens`
- Governance sources: `design-architecture/src/governance/`
