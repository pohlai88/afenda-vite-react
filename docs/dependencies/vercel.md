# Vercel guide (Afenda)

This document describes how **Afenda** targets **[Vercel](https://vercel.com/docs)** for hosting the **static Vite** client (**`apps/web/dist`**), **pnpm workspace** installs from the **monorepo root**, **Turborepo-scoped** builds, and **environment** separation from **`apps/api`**.

**Status:** **Adopted** as the **documented** deployment target for **`apps/web`**. Platform knobs live in the **Vercel project** (install/build/output, **Root Directory**, **Node**); the repo pins behavior in root [`vercel.json`](../../vercel.json) (**`installCommand`**, **`buildCommand`**, **`outputDirectory`**, **SPA `rewrites`**). Use **[Deployment](../DEPLOYMENT.md)** for the full checklist (**`VITE_*`**, Neon, Auth0 URLs).

**Official documentation:**

- [Vercel docs](https://vercel.com/docs) — platform overview
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite) — framework preset, **`dist/`** output
- [Vite (frontend guide)](https://vercel.com/docs/frameworks/frontend/vite) — **SPA** **`vercel.json`** rewrites for **deep links** / client routers
- [Builds](https://vercel.com/docs/builds) — how Vercel detects frameworks and applies defaults
- [Configure a build](https://vercel.com/docs/deployments/configure-a-build) — **Install**, **Build**, **Output** overrides
- [Project configuration (`vercel.json`)](https://vercel.com/docs/project-configuration/vercel-json) — **`outputDirectory`**, **`rewrites`**, etc.
- [Monorepos](https://vercel.com/docs/monorepos) — **Root Directory**, workspace installs
- [Turborepo on Vercel](https://vercel.com/docs/monorepos/turborepo) — **`turbo`**, remote cache (**`TURBO_TOKEN`** / **`TURBO_TEAM`** — see [Turborepo](./turborepo.md))
- [Environment variables](https://vercel.com/docs/projects/environment-variables) — Production / Preview / Development targets
- [Framework environment variables (Vite)](https://vercel.com/docs/environment-variables/framework-environment-variables) — **`VITE_VERCEL_*`** and related **build-time** exposure
- [System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables) — **`VERCEL_ENV`**, **`VERCEL_URL`**, etc. (often re-exposed via **`VITE_`** where appropriate)
- [Vercel GitHub](https://github.com/vercel/vercel)

[Vercel](https://vercel.com/docs) serves the **static ERP client**. **`apps/api`**, long-lived Node, and **PostgreSQL** stay **outside** this static output unless you deliberately add **Functions** or **Edge** routes ([Vercel Serverless / Edge](./vercel-serverless-edge.md)).

---

## Repo configuration (source of truth)

[`vercel.json`](../../vercel.json) currently sets:

| Field                 | Value                                                |
| --------------------- | ---------------------------------------------------- |
| **`installCommand`**  | **`pnpm install`**                                   |
| **`buildCommand`**    | **`pnpm exec turbo run build --filter=@afenda/web`** |
| **`outputDirectory`** | **`apps/web/dist`**                                  |
| **`rewrites`**        | **`/(.*)` → `/index.html`** (React Router / SPA)     |

Align the **Vercel dashboard** with [Deployment §2](../DEPLOYMENT.md) (**Root Directory** = repo root, **Framework** = **Vite** or equivalent). **`packageManager`**: **`pnpm@10.33.0`** at the repo root ([`package.json`](../../package.json)) — match **pnpm** in CI/Vercel.

---

## How we use Vercel

| Topic             | Convention                                                                                                                                                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo root** | **Install** from the **repository root** so **`workspace:*`** resolves ([pnpm](./pnpm.md), [Deployment](../DEPLOYMENT.md))                                                                                                                                            |
| **Build**         | **Scoped** web build via **Turborepo** — same command as **`vercel.json`** **`buildCommand`**                                                                                                                                                                         |
| **Output**        | **`apps/web/dist`** — [output directory](https://vercel.com/docs/project-configuration/vercel-json)                                                                                                                                                                   |
| **SPA routing**   | **Rewrites** so direct loads hit **`index.html`** ([Vite SPA note](https://vercel.com/docs/frameworks/frontend/vite)); if you add **`/api`** Functions, order routes so they are **not** captured by the catch-all ([Serverless / Edge](./vercel-serverless-edge.md)) |
| **Secrets**       | **`VITE_*`** only for **non-secret** client config; **server** secrets on **`apps/api`** or **non-`VITE_`** Vercel env ([Deployment](../DEPLOYMENT.md))                                                                                                               |
| **Previews**      | **Preview** deployments per branch/PR; pair with [Neon](./neon.md) preview DB when configured                                                                                                                                                                         |
| **Remote cache**  | Optional **Turborepo** remote cache on Vercel — [Turborepo doc](./turborepo.md), [`.env.example`](../../.env.example)                                                                                                                                                 |

---

## Red flags

- **Single-package** install at a subdirectory **without** workspace context (breaks **`workspace:*`**).
- Shipping **database URLs**, **Auth secrets**, or **API keys** as **`VITE_*`** (they become **client-visible**).
- **Dashboard** **Output Directory** or **Build Command** out of sync with [`vercel.json`](../../vercel.json) / [Deployment](../DEPLOYMENT.md) without documenting why.

---

## Deeper reference

- [Deployment](../DEPLOYMENT.md) — authoritative Afenda Vercel runbook.
- Skills: [deploy-to-vercel](../../.agents/skills/deploy-to-vercel/SKILL.md), [vercel-cli-with-tokens](../../.agents/skills/vercel-cli-with-tokens/SKILL.md).

---

## Related documentation

- [Vercel Serverless / Edge](./vercel-serverless-edge.md)
- [Turborepo](./turborepo.md)
- [pnpm](./pnpm.md)
- [Neon](./neon.md)
- [Architecture](../ARCHITECTURE.md)
- [Vite](./vite.md)

**External:** [vercel.com/docs](https://vercel.com/docs) · [Vercel GitHub](https://github.com/vercel/vercel)

**Context7 library IDs (doc refresh):** `/websites/vercel` · `/websites/vercel_monorepos`
