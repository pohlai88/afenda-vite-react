# Vercel Serverless and Edge guide (Afenda)

This document covers **optional** **[Vercel Functions](https://vercel.com/docs/functions)** (Node.js or **Edge** runtimes) and **routing middleware** if you add them **in-repo**. The default architecture remains **static `apps/web`** plus a separate **`apps/api`** ([Architecture](../ARCHITECTURE.md), [Deployment](../DEPLOYMENT.md), [Vercel (static)](./vercel.md)).

**Status:** **Not default** — use this when evaluating **serverless / edge** next to the SPA. Today, root [`vercel.json`](../../vercel.json) only configures **install/build/output** and a **catch-all rewrite** to **`index.html`** for React Router; there are **no** in-project **`/api`** functions defined.

**Official documentation:**

- [Vercel Functions](https://vercel.com/docs/functions) — overview
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions) — Node.js workloads, **`/api`**-style routes (pattern depends on project layout)
- [Node.js runtime](https://vercel.com/docs/functions/runtimes/node-js) — full Node (where supported); **Fluid compute** and pricing differ from Edge for some features (e.g. **Node middleware** where applicable)
- [Edge Runtime](https://vercel.com/docs/functions/runtimes/edge) — **subset** of Web and Node APIs; many packages that assume full Node will not run
- [Routing Middleware](https://vercel.com/docs/routing-middleware/getting-started) — **Edge** by default; optional **`runtime: 'nodejs'`** where documented
- [Project configuration (`vercel.json`)](https://vercel.com/docs/project-configuration/vercel-json) — **`rewrites`**, **`redirects`**, **`functions`** (memory, **`maxDuration`**, **`regions`**), legacy **`routes`**
- [Rewrites](https://vercel.com/docs/routing/rewrites) — map paths to functions or external origins
- [Monorepos](https://vercel.com/docs/monorepos) — root directory, install/build commands
- [Turborepo on Vercel](https://vercel.com/docs/monorepos/turborepo) — aligns with [`turbo.json`](../../turbo.json) + root scripts
- [Environment variables](https://vercel.com/docs/projects/environment-variables) — server vs **`VITE_*`**

[Vercel](https://vercel.com/docs) matches **functions and filesystem routes before** broad **SPA fallbacks**. If you add **`/api/*`** (or similar), ensure those paths are **not** swallowed by a catch-all **`destination: /index.html`** ([`vercel.json`](../../vercel.json) today uses **`/(.*)` → `/index.html`** — adjust routing when introducing real API paths on the same hostname).

---

## Runtimes at a glance

| Runtime | Typical use | Watchouts |
| --- | --- | --- |
| **Node.js (Serverless Functions)** | BFF, webhooks, short-lived Node APIs | Cold starts, **`maxDuration`**, memory; use **non-`VITE_*`** secrets |
| **Edge** | Geo headers, auth gates, low-latency transforms | **Limited APIs**; many DB drivers / Node-only libs **won’t work** ([Edge Runtime](https://vercel.com/docs/functions/runtimes/edge)) |
| **Routing Middleware** | Cross-cutting request logic | Default **Edge**; **Node** middleware is **framework- and plan-specific** ([Routing Middleware](https://vercel.com/docs/routing-middleware/getting-started)) |

---

## When to consider Functions / Edge

| Use case | Notes |
| --- | --- |
| **Thin BFF** | Headers, geo, light orchestration — **ERP core** and heavy DB access still favor **`apps/api`** or a Node-friendly serverless design |
| **Webhooks / OAuth callback** | Same origin as the SPA without a long-lived server — keep tokens **server-side** ([Authentication](../AUTHENTICATION.md)) |
| **Edge personalization** | A/B flags, redirects from **edge**-safe data (KV, fetch to a real API) |

---

## How we use Functions / Edge (if adopted)

| Topic | Convention |
| --- | --- |
| **Routing order** | Configure **`rewrites` / `routes`** so **function paths win** before the SPA catch-all ([project configuration](https://vercel.com/docs/project-configuration/vercel-json), [Deployment](../DEPLOYMENT.md)) |
| **`vercel.json`** | Use **`functions`** for **memory**, **`maxDuration`**, **`regions`** per glob where needed ([configuration reference](https://vercel.com/docs/project-configuration/vercel-json)) |
| **Env** | Server secrets **never** **`VITE_*`**; Edge may lack **Node** APIs — validate drivers and SDKs |
| **Monorepo** | Set **Root Directory** / commands in the Vercel project so **function source** and **`outputDirectory`** resolve correctly ([monorepos](https://vercel.com/docs/monorepos)) |
| **ERP core** | Long transactions, reporting, and complex rules stay in **`apps/api`** (or another **full Node** service), not scattered across many serverless entrypoints without design |

---

## Red flags

- **Catch-all SPA rewrite** sending **`/api/*`** (or **`/_middleware`**) to **`index.html`** by mistake.
- Putting **database credentials** or **PII** in **`VITE_*`** or client bundles.
- Assuming **Edge** can run the same **PostgreSQL** stack as **`apps/api`** without an **edge-compatible** data path.
- **Bypassing** [Deployment](../DEPLOYMENT.md) env and security conventions when adding Functions.

---

## Deeper reference

- Repo: [`vercel.json`](../../vercel.json), [Deployment](../DEPLOYMENT.md).
- Skill: [deploy-to-vercel](../../.agents/skills/deploy-to-vercel/SKILL.md); token flows: [vercel-cli-with-tokens](../../.agents/skills/vercel-cli-with-tokens/SKILL.md).

---

## Related documentation

- [Deployment](../DEPLOYMENT.md)
- [Vercel](./vercel.md)
- [API reference](../API.md)
- [Architecture](../ARCHITECTURE.md)
- [Turborepo](./turborepo.md)
- [Neon](./neon.md) — preview DB + Vercel env patterns

**External:** [vercel.com/docs/functions](https://vercel.com/docs/functions) · [Vercel GitHub](https://github.com/vercel/vercel)

**Context7 library IDs (doc refresh):** `/websites/vercel` · `/vercel/vercel`
