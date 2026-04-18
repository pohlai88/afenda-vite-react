# Turborepo guide (Afenda)

This document describes how **Afenda** runs **[Turborepo](https://turbo.build/repo/docs)** on top of **[pnpm](./pnpm.md) workspaces**: **`turbo.json`** task graph, **`dependsOn`** (including **`^`** dependencies and the **`transit`** pattern), **filtering**, **environment-aware hashing**, and optional **remote cache** for CI and local dev.

**Status:** **Adopted** at the **repo root** — **`turbo`** **`^2.5.5`** in root [`package.json`](../../package.json). Root scripts delegate to **`turbo run <task>`** (the **`turbo`** binary comes from the root **devDependency**; **`pnpm exec turbo run …`** is equivalent when you want an explicit resolver).

**Official documentation:**

- [Turborepo docs](https://turbo.build/repo/docs) — concepts and guides
- [Configuration (`turbo.json`)](https://turbo.build/repo/docs/reference/configuration) — **`tasks`**, **`globalDependencies`**, **`globalEnv`**, **`inputs`**, **`outputs`**, **`cache`**, **`persistent`**
- [Package tasks](https://turbo.build/repo/docs/crafting-your-repository/configuring-tasks) — **`dependsOn`**, **`^task`**
- [Environment variables](https://turbo.build/repo/docs/crafting-your-repository/using-environment-variables) — **`env`**, **`passThroughEnv`**, **`globalEnv`**, **`.env`** in **`inputs`**
- [Filtering](https://turbo.build/repo/docs/crafting-your-repository/running-tasks#using-filters) — **`--filter`**, **`--affected`**
- [Remote caching](https://turbo.build/repo/docs/core-concepts/remote-caching) — **`TURBO_TOKEN`**, **`TURBO_TEAM`**
- [CI / constructing CI](https://turbo.build/repo/docs/crafting-your-repository/constructing-ci) — cache in pipelines
- [Turborepo on GitHub](https://github.com/vercel/turborepo)

Turborepo schedules **`package.json`** scripts across the workspace, **caches** task outputs when configured, and **invalidates** cache entries when **inputs**, **global dependencies**, or declared **environment** values change.

---

## Where it lives

| Path                                                     | Role                                                                                                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`turbo.json`](../../turbo.json)                         | **`tasks`**, **`dependsOn`**, **`outputs`**, **`inputs`**, **`env`**, **`globalEnv`**, **`globalDependencies`**, **`ui`**         |
| Root [`package.json`](../../package.json)                | **`turbo run …`** scripts (**`build`**, **`dev`**, **`lint`**, **`typecheck`**, **`test`**, **`check`**, etc.)                    |
| [`.env.example`](../../.env.example) (Turborepo section) | Optional remote cache env vars (see [Deployment](../DEPLOYMENT.md), [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)) |

---

## Task graph (this repo)

[`turbo.json`](../../turbo.json) defines (high level):

| Task                                 | Behavior                                                                                                                                                                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`transit`**                        | **`dependsOn`: [`^transit`]`** — synthetic dependency edge so other tasks can depend on **upstream packages** without a real script (see [Turborepo skill — transit](../../.agents/skills/turborepo/references/configuration/tasks.md)) |
| **`build`**                          | **`^build`**, **`^transit`**; **`outputs`**: **`dist/**`**; **`env`**: **`NODE*ENV`**, **`MODE`**, **`VITE*_`**; extra **`inputs`** for repo-root **`.env`**, **`.env._`\*\*, shared TS config                                          |
| **`typecheck`**                      | **`^build`**, **`^transit`**; TS incremental under **`node_modules/.tmp/**`\*\*                                                                                                                                                         |
| **`lint`**                           | **`^transit`**; **`eslint.config.js`** in **`inputs`**                                                                                                                                                                                  |
| **`test`**                           | **`cache: false`**, **`persistent: true`** (watch); Vitest env via **`passThroughEnv`**                                                                                                                                                 |
| **`test:run`** / **`test:coverage`** | Depend on **`^transit`**; coverage **`outputs`** on **`test:coverage`**                                                                                                                                                                 |
| **`dev`** / **`preview`**            | **`dev`**: uncached, persistent; **`preview`**: **`dependsOn`: [`build`]`**                                                                                                                                                             |
| **`format`** / **`format:check`**    | **`cache: false`**                                                                                                                                                                                                                      |

**Globals:** **`globalDependencies`** include **`pnpm-workspace.yaml`**, **`turbo.json`**, **`eslint.config.js`**; **`globalEnv`**: **`NODE_ENV`**, **`CI`**. Schema: **`$schema`**: `https://turbo.build/schema.json`.

---

## How we use Turborepo

| Topic                    | Convention                                                                                                                                                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Root commands**        | **`pnpm run build`**, **`pnpm run check`**, etc. — each forwards to **`turbo run …`** ([`package.json`](../../package.json))                                                                                                               |
| **Filter web app**       | **`pnpm exec turbo run build --filter=@afenda/web`** (or **`turbo run build --filter=@afenda/web`**) — aligns with [Deployment](../DEPLOYMENT.md)                                                                                          |
| **Affected / Git**       | Use **`--filter=[…]`** or **`--affected`** when scoping PR checks ([filtering](https://turbo.build/repo/docs/crafting-your-repository/running-tasks#using-filters))                                                                        |
| **Remote cache**         | Optional **`TURBO_TOKEN`** / **`TURBO_TEAM`** — [`.env.example`](../../.env.example); [remote caching](https://turbo.build/repo/docs/core-concepts/remote-caching)                                                                         |
| **New packages / apps**  | Add matching **`scripts`** in that package’s **`package.json`**, then extend **`turbo.json`** **`tasks`** and **`dependsOn`** so ordering and cache keys stay correct                                                                      |
| **Env-sensitive builds** | Declare variables in **`env`** / **`globalEnv`** (and **`.env`** paths in **`inputs`** where needed) so caches are not wrong — [environment variables](https://turbo.build/repo/docs/crafting-your-repository/using-environment-variables) |

---

## Red flags

- Bypassing Turbo with **raw** **`pnpm run <script>`** in CI for tasks that should share **cache keys** and **dependency order** with local dev.
- **Omitting** env vars from **`env`** / **`globalEnv`** while those vars **change build output** (silent stale cache).
- **Disabling cache** without documenting why (cost vs determinism).

---

## Deeper reference

- Skill: [turborepo](../../.agents/skills/turborepo/SKILL.md) and [SYNC](../../.agents/skills/turborepo/SYNC.md) — alignment with CI and cache defaults.
- [monorepo-management](../../.agents/skills/monorepo-management/SKILL.md) — workspace topology with Turbo.

---

## Related documentation

- [pnpm](./pnpm.md) — workspaces, **`--filter`**, catalogs
- [Project configuration](../PROJECT_CONFIGURATION.md)
- [Deployment](../DEPLOYMENT.md) — Vercel + Turbo
- [Architecture](../ARCHITECTURE.md)
- [Vitest](./vitest.md) — **`test`**, **`test:run`** tasks

**External:** [turbo.build/repo/docs](https://turbo.build/repo/docs) · [Turborepo GitHub](https://github.com/vercel/turborepo)

**Context7 library IDs (doc refresh):** `/vercel/turborepo`
