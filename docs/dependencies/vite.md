# Vite guide (Afenda)

This document describes how **`apps/web`** uses **[Vite](https://vite.dev/)** for **dev server** (ESM, HMR), **production build**, **env** handling, and shared config for **Vitest**.

**Status:** **Adopted** in **`apps/web`** — **`vite: catalog:`** resolves to the **exact** version pinned in [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) (**Vite 7.x** today). The SPA targets **evergreen** browsers; **`@vitejs/plugin-legacy`** is **not** part of the build.

**Official documentation:**

- [Vite guide](https://vite.dev/guide/) — workflow and concepts
- [Features](https://vite.dev/guide/features) — built-in behavior before reaching for plugins
- [Using plugins](https://vite.dev/guide/using-plugins) · [Plugin API](https://vite.dev/guide/api-plugin)
- [Config reference](https://vite.dev/config/) — `defineConfig`, `server`, `build`, `resolve`, …
- [Server options](https://vite.dev/config/server-options) — **`server.proxy`**, HMR, HTTPS
- [Build options](https://vite.dev/config/build-options) — output, minify, source maps
- [Dep optimization](https://vite.dev/config/dep-optimization-options) — **`optimizeDeps`**
- [Shared options](https://vite.dev/config/shared-options) — **`define`**, **`resolve`**, …
- [CLI](https://vite.dev/guide/cli)
- [Env variables and modes](https://vite.dev/guide/env-and-mode)
- [JavaScript API](https://vite.dev/guide/api-javascript) — **`loadEnv`**, programmatic **`build`**
- [Official plugins](https://vite.dev/plugins/) — e.g. **`@vitejs/plugin-react`**, **`plugin-react-swc`**, …
- [Migration from v7](https://vite.dev/guide/migration) — read before **Vite 8** (Rolldown / Oxc and config shape changes)
- [Vite on GitHub](https://github.com/vitejs/vite)

**Vite 8+ (future upgrade):** upstream moves production builds toward **Rolldown** / **Oxc** and adjusted option names. This repo stays on **Vite 7** until a deliberate upgrade (including **Windows** `vite build` / Vitest smoke). Use the [migration guide](https://vite.dev/guide/migration) when bumping majors—not as the default mental model for today’s config.

---

## Where it lives

| Path                                                       | Role                                                      |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) | `defineConfig`, plugins, `server`, `build`, Vitest `test` |
| [`apps/web/index.html`](../../apps/web/index.html)         | Entry → `src/main.tsx`                                    |

Use **`defineConfig`** or **`satisfies UserConfig`** for editor IntelliSense ([Configuring Vite](https://vite.dev/config/)).

---

## How we use Vite

| Topic              | Convention                                                                                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Module**         | **`"type": "module"`** — ESM `import`/`export`                                                                                                                                                      |
| **Env**            | Client: **`import.meta.env`** + **`VITE_`** prefix. Config: use **`loadEnv(mode, process.cwd(), …)`** if `.env` must influence `vite.config` ([Env and modes](https://vite.dev/guide/env-and-mode)) |
| **Aliases**        | `@`, `~`, etc. — align with [Project structure](../PROJECT_STRUCTURE.md)                                                                                                                            |
| **API in dev**     | `server.proxy` → backend; SPA uses `/api/...` ([Server options](https://vite.dev/config/server-options), [API](../API.md))                                                                          |
| **Major upgrades** | Plan with [migration guide](https://vite.dev/guide/migration); validate **CI + local win32** after bumping                                                                                          |

### Environment variables and `vite.config`

- Only variables prefixed with **`VITE_`** are exposed to client source via **`import.meta.env`**; other names stay **undefined** in the browser bundle (prevents leaking secrets).
- While **`vite.config.*` is evaluating**, **`.env*` files are not yet** merged into **`process.env`**. Values that must drive **config** (port, conditional plugins, **`define`**) should be read with **`loadEnv(mode, process.cwd(), '')`** — use **`''`** as the third argument when you need **all** keys, not only `VITE_*` ([`loadEnv`](https://vite.dev/guide/api-javascript#loadenv), [Env and modes](https://vite.dev/guide/env-and-mode)).
- **`.env.production`** is loaded for **`vite build`**; keep production client config in **`VITE_*`** only.

---

## Plugins (this repo)

Aligned with [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) and [Official plugins](https://vite.dev/plugins/):

- **`@tailwindcss/vite`** — Tailwind v4 (before React in plugin order)
- **`@vitejs/plugin-react`** — Fast Refresh; **`babel-plugin-react-compiler`** passed via `react({ babel: { plugins: [...] } })` for the React Compiler ([React](./react.md))
- **`@vitejs/devtools`** — dev server only; skipped when `VITEST` is set
- **Not used:** **`@vitejs/plugin-legacy`** — add only if the product must support non-evergreen browsers ([plugin-legacy](https://vite.dev/plugins/#vitejs-plugin-legacy))

---

## Testing

**Vitest** reuses Vite config — see [`test`](../../apps/web/vite.config.ts) block and [Testing](../TESTING.md), [Vitest](./vitest.md).

---

## Red flags

- Putting **secrets** in `VITE_*` (they ship to the client).
- Assuming **dev transpile** catches all **type errors** — run **`pnpm typecheck`** ([TypeScript](./typescript.md)).
- **`optimizeDeps` / build tuning** left unreviewed across Vite major upgrades — re-validate after bumping ([Dep optimization](https://vite.dev/config/dep-optimization-options)).

---

## Related documentation

- [Vite enterprise practices (workspace)](../VITE_ENTERPRISE_WORKSPACE.md) — periodic review checklist for `apps/web` + CI
- [React](./react.md)
- [Vitest](./vitest.md)
- [TypeScript](./typescript.md)
- [Performance](../PERFORMANCE.md)
- [Project configuration](../PROJECT_CONFIGURATION.md)

**External:** [vite.dev](https://vite.dev/) · [Vite GitHub](https://github.com/vitejs/vite)

**Context7 (AI doc refresh):** **`Vite`** → **`/websites/vite_dev`** or **`/vitejs/vite`** with a **version tag matching this repo’s pinned `vite`** when you need release-scoped snippets. Then **`query-docs`** for **`loadEnv`**, **`server.proxy`**, or migration when upgrading majors.
