# Vite guide (Afenda)

This document describes how **`apps/web`** uses **[Vite](https://vite.dev/)** for **dev server** (ESM, HMR), **production build**, **env** handling, and shared config for **Vitest**.

**Status:** **Adopted** in **`apps/web`** — **`vite` `^8.0.3`** in [`apps/web/package.json`](../../apps/web/package.json) (`devDependencies`).

**Official documentation:**

- [Vite guide](https://vite.dev/guide/) — workflow and concepts
- [Features](https://vite.dev/guide/features) — built-in behavior before reaching for plugins
- [Using plugins](https://vite.dev/guide/using-plugins) · [Plugin API](https://vite.dev/guide/api-plugin) — hooks, Rolldown compatibility
- [Config reference](https://vite.dev/config/) — `defineConfig`, `server`, `build`, `resolve`, …
- [Server options](https://vite.dev/config/server-options) — **`server.proxy`**, HMR, HTTPS
- [Build options](https://vite.dev/config/build-options) — output, minify, source maps
- [Dep optimization](https://vite.dev/config/dep-optimization-options) — **`optimizeDeps`** (**`rolldownOptions`** on Vite 8)
- [Shared options](https://vite.dev/config/shared-options) — **`define`**, **`resolve`**, **`oxc`** (Vite 8)
- [CLI](https://vite.dev/guide/cli)
- [Env variables and modes](https://vite.dev/guide/env-and-mode)
- [JavaScript API](https://vite.dev/guide/api-javascript) — **`loadEnv`**, programmatic **`build`**
- [Official plugins](https://vite.dev/plugins/) — **`@vitejs/plugin-react`** (Fast Refresh via **Oxc**), **`plugin-legacy`**, **`plugin-react-swc`**, …
- [Migration from v7](https://vite.dev/guide/migration) — **Vite 8**: **Rolldown** + **Oxc**, **`build.rolldownOptions`**, **`esbuild` → `oxc`**, dependency optimizer changes
- [Rolldown](https://rolldown.rs/) · [Oxc](https://oxc.rs/)
- [Vite on GitHub](https://github.com/vitejs/vite)

**Vite 8:** Production builds and dependency pre-bundling use **Rolldown** and **Oxc** instead of Rollup + esbuild-only paths. Prefer the [migration guide](https://vite.dev/guide/migration) when bumping majors; expect deprecations such as **`build.rollupOptions` → `build.rolldownOptions`** and compatibility shims mapping **`esbuild`** config to **`oxc`**.

---

## Where it lives

| Path | Role |
| --- | --- |
| [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) | `defineConfig`, plugins, `server`, `build`, Vitest `test` |
| [`apps/web/index.html`](../../apps/web/index.html) | Entry → `src/main.tsx` |

Use **`defineConfig`** or **`satisfies UserConfig`** for editor IntelliSense ([Configuring Vite](https://vite.dev/config/)).

---

## How we use Vite

| Topic | Convention |
| --- | --- |
| **Module** | **`"type": "module"`** — ESM `import`/`export` |
| **Env** | Client: **`import.meta.env`** + **`VITE_`** prefix. Config: use **`loadEnv(mode, process.cwd(), …)`** if `.env` must influence `vite.config` ([Env and modes](https://vite.dev/guide/env-and-mode)) |
| **Aliases** | `@`, `~`, etc. — align with [Project structure](../PROJECT_STRUCTURE.md) |
| **API in dev** | `server.proxy` → backend; SPA uses `/api/...` ([Server options](https://vite.dev/config/server-options), [API](../API.md)) |
| **Vite 8 tooling** | Prefer **`oxc`** / **`optimizeDeps.rolldownOptions`** over long-term reliance on deprecated **`esbuild`** / **`rollupOptions`** shims—see [migration](https://vite.dev/guide/migration) |

### Environment variables and `vite.config` (Vite 8)

- Only variables prefixed with **`VITE_`** are exposed to client source via **`import.meta.env`**; other names stay **undefined** in the browser bundle (prevents leaking secrets).
- While **`vite.config.*` is evaluating**, **`.env*` files are not yet** merged into **`process.env`**. Values that must drive **config** (port, conditional plugins, **`define`**) should be read with **`loadEnv(mode, process.cwd(), '')`** — use **`''`** as the third argument when you need **all** keys, not only `VITE_*` ([`loadEnv`](https://vite.dev/guide/api-javascript#loadenv), [Env and modes](https://vite.dev/guide/env-and-mode)).
- **`.env.production`** is loaded for **`vite build`**; keep production client config in **`VITE_*`** only.

---

## Plugins (this repo)

Aligned with [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) and [Official plugins](https://vite.dev/plugins/):

- **`@vitejs/plugin-react`** — Fast Refresh; JSX via **Oxc** in current Vite lines ([plugin-react](https://vite.dev/plugins/#vitejs-plugin-react))
- **`@vitejs/plugin-legacy`** — legacy chunks when required ([plugin-legacy](https://vite.dev/plugins/#vitejs-plugin-legacy))
- **`@rolldown/plugin-babel`** + **`reactCompilerPreset`** — React Compiler ([React](./react.md)); see [migration](https://vite.dev/guide/migration) for Babel/Oxc interaction notes (e.g. decorators)

---

## Testing

**Vitest** reuses Vite config — see [`test`](../../apps/web/vite.config.ts) block and [Testing](../TESTING.md), [Vitest](./vitest.md).

---

## Red flags

- Putting **secrets** in `VITE_*` (they ship to the client).
- Assuming **dev transpile** catches all **type errors** — run **`pnpm typecheck`** ([TypeScript](./typescript.md)).
- Customizing **`optimizeDeps.esbuildOptions`** indefinitely—plan a move to **`optimizeDeps.rolldownOptions`** ([Dep optimization](https://vite.dev/config/dep-optimization-options)).

---

## Related documentation

- [Vite enterprise practices (workspace)](../VITE_ENTERPRISE_WORKSPACE.md) — periodic review checklist for `apps/web` + CI
- [React](./react.md)
- [Vitest](./vitest.md)
- [TypeScript](./typescript.md)
- [Performance](../PERFORMANCE.md)
- [Project configuration](../PROJECT_CONFIGURATION.md)

**External:** [vite.dev](https://vite.dev/) · [Vite GitHub](https://github.com/vitejs/vite)

**Context7 (AI doc refresh):** **`Vite`** → **`/websites/vite_dev`** (site-shaped docs) or **`/vitejs/vite`** with version tag **`v8.0.0`** when you need release-scoped snippets. Then **`query-docs`** for migration, **`loadEnv`**, **`server.proxy`**, or Rolldown options.
