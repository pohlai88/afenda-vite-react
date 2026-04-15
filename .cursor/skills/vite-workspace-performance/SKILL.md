---
name: vite-workspace-performance
description: Diagnoses, normalizes, and optimizes Vite dev/build performance for the Afenda monorepo (profile, warmup, optimizeDeps, chunking, plugins). Use when dev server or vite build feels slow, after major dependency or Vite upgrades, when tuning apps/web, or when the user asks for Vite performance, bundle analysis, or workspace optimization.
---

# Vite workspace performance (Afenda)

## When to apply

- First paint, HMR, or `vite build` latency regresses
- Adding heavy dependencies, new workspace packages, or changing `vite.config.ts`
- After bumping **Vite** or **Vitest** majors
- User asks to optimize, profile, or diagnose **Vite** / **`apps/web`** performance

**Stack default:** **Vite 7.x** (see `pnpm-workspace.yaml` catalog). Vite 8 / Rolldown migration is out of scope unless the user is upgrading—use the [migration guide](https://vite.dev/guide/migration) then.

## Canonical repo anchors

| What               | Where                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Web Vite config    | [`apps/web/vite.config.ts`](../../../apps/web/vite.config.ts)                                             |
| Human guide        | [`docs/dependencies/vite.md`](../../../docs/dependencies/vite.md)                                         |
| Industry checklist | [`.agents/skills/vite-industry-quality/SKILL.md`](../../../.agents/skills/vite-industry-quality/SKILL.md) |

## Workflow (repeatable)

### 1. Diagnose (find the bottleneck)

| Symptom                     | Action                                                                                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slow dev / first navigation | `vite --profile` from `apps/web`; inspect CPU profile. Check [`server.warmup`](https://vite.dev/config/server-options#server-warmup) for hot entries. |
| Slow production build       | `vite build --profile`                                                                                                                                |
| Plugin cost unclear         | `vite --debug plugin-transform`                                                                                                                       |
| Large JS / poor caching     | `pnpm --filter @afenda/web build:analyze` → `dist/stats.html` (rollup visualizer)                                                                     |
| Dep discovery / CJS issues  | Review [`optimizeDeps`](https://vite.dev/config/dep-optimization-options) include/exclude                                                             |

**Baseline:** Same machine, same `mode`; after `optimizeDeps` experiments consider clearing `node_modules/.vite`.

### 2. Normalize (stable baseline)

- **`base`** explicit for deploy paths; keep `index.html` / React `basename` / theme scripts aligned (see `injectViteBaseForThemeScript` in config).
- **Typecheck in CI** — `pnpm typecheck`; do not treat Vite as the type checker.
- **Plugin order** — Tailwind → React per current `vite.config.ts`; avoid redundant transforms.
- **Chunk strategy** — `manualChunks` is intentional; avoid splits that trigger Rollup circular-chunk warnings (see comments in `vite.config.ts`).

### 3. Optimize (levers)

| Lever                                     | Notes                                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `server.warmup.clientFiles`               | Pre-transform entry CSS/TS; extend only for measured hot paths.                         |
| `optimizeDeps.include`                    | Force pre-bundle for linked workspace packages or non-discoverable imports.             |
| `optimizeDeps.exclude`                    | Use sparingly; wrong excludes hurt more than help.                                      |
| `build.rollupOptions.output.manualChunks` | Vendor splits for caching; keep react / react-dom / scheduler coherent if Rollup warns. |
| `build.target`                            | `esnext` is typical for evergreen SPA.                                                  |

Official references: [Performance](https://vite.dev/guide/performance), [Dep pre-bundling](https://vite.dev/guide/dep-pre-bundling), [Build](https://vite.dev/guide/build).

## Commands (from repo root)

```bash
pnpm --filter @afenda/web dev
pnpm --filter @afenda/web build
pnpm --filter @afenda/web build:analyze
pnpm --filter @afenda/web typecheck
```

Profiling (run inside `apps/web` or via `pnpm exec vite` with correct `--config`):

```bash
vite --profile
vite build --profile
```

## Continuous optimization checklist

Use after meaningful changes to deps, Vite, or `vite.config.ts`:

- [ ] `pnpm typecheck` passes
- [ ] `pnpm --filter @afenda/web build` passes
- [ ] If chunks changed: open `build:analyze` report; watch for oversized or cyclic chunks
- [ ] If dev felt slow: profile once; adjust `warmup` or `optimizeDeps` with evidence
- [ ] Document non-obvious chunk or plugin choices in `vite.config.ts` comments (repo convention)

## Out of scope (unless user asks)

- **Vite 8 / Rolldown** — follow upstream migration when upgrading
- **Next.js / other bundlers** — this skill is Vite + `apps/web`
- **Runtime React perf** — use React profiling; this skill targets **bundler / dev server / build**

## Related

- Monorepo tooling: [`AGENTS.md`](../../../AGENTS.md) Part B (Turborepo)
- Preload / deploy chunk errors: `apps/web` `vite-preload-recovery` + [`vite:preloadError`](https://vite.dev/guide/build#load-error-handling)
