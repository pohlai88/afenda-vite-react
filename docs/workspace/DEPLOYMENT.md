---
owner: governance-toolchain
truthStatus: canonical
docClass: canonical-doc
relatedDomain: deployment
---

# Deployment (Vercel)

**Afenda** is a **pnpm + Turborepo** monorepo. The web client is **`apps/web`**: **Vite + React** (static `dist/` output), not a Next.js server. On **Vercel**, you deploy that **static build**; APIs and the database run **elsewhere** (Vercel Serverless/Edge, a separate Node service, or a BaaS)—see [Architecture](./ARCHITECTURE.md), [Authentication](./AUTHENTICATION.md), and [Database package](../packages/_database/README.md).

This page focuses on **hosting the Vite ERP client on Vercel**.

---

## 1. Why Vercel fits the web client

- **Vite** is a [supported framework](https://vercel.com/docs/frameworks/vite): fast builds, `dist/` output, preview deployments per branch/PR.
- **Turborepo** works with Vercel’s [monorepo](https://vercel.com/docs/monorepos) and [remote caching](https://vercel.com/docs/monorepos/turborepo) (`TURBO_TOKEN` / `TURBO_TEAM`).
- **PostgreSQL** (with optional **pgvector**) is **not** run on Vercel’s static layer—use **[Neon](https://neon.tech/)**, **[Supabase](https://supabase.com/)**, **RDS**, etc., and point your **API** or serverless functions at `DATABASE_URL`.

---

## 2. Vercel project configuration (monorepo)

**Install and build from the repository root** so pnpm workspaces resolve (`packages/typescript-config`, etc.).

| Setting              | Suggested value                                  |
| -------------------- | ------------------------------------------------ |
| **Root Directory**   | Repository root (`.`)                            |
| **Framework Preset** | **Vite** (or “Other” with commands below)        |
| **Install Command**  | `pnpm install`                                   |
| **Build Command**    | `pnpm exec turbo run build --filter=@afenda/web` |
| **Output Directory** | `apps/web/dist`                                  |

If Vercel does not auto-detect Vite when the root is the monorepo root, set **Output Directory** explicitly to **`apps/web/dist`** and ensure the build command runs the web app only.

**Node / pnpm:** Align with `package.json` `engines` and [`.npmrc`](https://pnpm.io/npmrc) if present; use **pnpm 10** to match the repo (see root `packageManager` field).

---

## 3. Single-page app routing (React Router)

Client-side routes (`/finance`, `/settings`, …) must resolve to **`index.html`**. The repo root **[`vercel.json`](../vercel.json)** sets a **rewrite** so refreshes and deep links work for the static `apps/web/dist` output. If you add **Vercel Serverless Functions** under `/api`, define those routes as functions—Vercel matches them before static rewrites. If you host elsewhere, replicate the same SPA fallback (e.g. S3 + CloudFront error page to `index.html`).

---

## 4. Environment variables

### 4.1 Browser-exposed (`VITE_*`)

Set in **Vercel → Project → Settings → Environment Variables** for _Production_, _Preview_, and _Development_ as needed.

Examples (names must match what `apps/web` reads):

```env
VITE_API_BASE_URL=https://api.your-domain.com
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=...
# Optional: base path if not served at domain root
# VITE_BASE_URL=/
```

**Never** put secrets that must stay server-only (database passwords, `AUTH0_CLIENT_SECRET`, `OPENAI_API_KEY`) in `VITE_*`—they are bundled or exposed to the client.

### 4.2 Server-only (API / serverless)

If you add **Vercel Functions** or a **Route Handler**–style API in this repo, configure `DATABASE_URL`, `AUTH_SECRET`, IdP secrets, and AI keys **only** in Vercel env **without** the `VITE_` prefix. See [Authentication](./AUTHENTICATION.md) and [Database package](../packages/_database/README.md).

Illustrative split:

```env
# Server / API only (examples)
DATABASE_URL=postgresql://...
AUTH_SECRET=<min-32-char-secret>
AUTH0_CLIENT_SECRET=...
OPENAI_API_KEY=...
```

### 4.3 Optional: AI and storage (from your template)

```env
ENABLE_AI_FEATURES=true
ANTHROPIC_API_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_S3_BUCKET=...
```

---

## 5. Database (PostgreSQL + pgvector)

1. Create a managed Postgres instance (**Neon** and **Supabase** both support **pgvector**; enable the extension per provider docs).
2. Run migrations from **CI/CD or a secure admin context**, not from the static Vite deploy:

   ```bash
   pnpm exec turbo run db:migrate --filter=@afenda/database
   ```

   (Adjust `--filter` when your database package exists—see [Database package](../packages/_database/README.md).)

3. **`CREATE EXTENSION IF NOT EXISTS vector;`** — usually once per database, often via provider UI or migration SQL.

---

## 6. Build & local parity

```bash
pnpm install
pnpm exec turbo run build --filter=@afenda/web
```

Preview locally:

```bash
pnpm exec turbo run preview --filter=@afenda/web
# or: pnpm --filter @afenda/web preview
```

Vercel’s production build should use the same **Turbo** task so outputs match CI.

---

## 7. Auth0 (or OIDC) production URLs

Register your **Vercel production** and **preview** URLs in the Auth0 application:

- **Allowed Callback URLs** — e.g. `https://your-app.vercel.app`, `https://your-app.vercel.app/callback`, plus preview URLs if you use Auth0 in previews.
- **Allowed Logout / Web Origins** — same origins.

Match paths to your React Router and `@auth0/auth0-react` (or BFF) configuration—see [Authentication](./AUTHENTICATION.md).

---

## 8. CI and Vercel Git integration

This repo includes **GitHub Actions** ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) for install, lint, typecheck, and tests with optional **Turborepo remote cache**.

Typical flow:

1. Push / PR runs **CI** (quality gate).
2. **Vercel** builds on the same commits (connect the Git repo in the Vercel dashboard).
3. Optionally fail deploy if CI fails (enforce branch protection + required checks).

Add a deploy step only if you deploy outside Vercel’s Git integration (e.g. `vercel deploy` in Actions with `VERCEL_TOKEN`).

---

## 9. Checklist (Vercel + ERP web client)

1. **Monorepo build** — `turbo` builds `@afenda/web`; **Output Directory** = `apps/web/dist`.
2. **SPA rewrites** — [`apps/web/vercel.json`](../apps/web/vercel.json) (or equivalent) for React Router.
3. **`VITE_*`** — only non-secret client config; API base URL points to your backend.
4. **Database** — hosted separately; migrations not run by the static deploy by default.
5. **Auth** — production/preview origins registered with your IdP.
6. **pgvector** — enabled on the Postgres instance if you use embeddings ([Database package](../packages/_database/README.md)).
7. **[`vercel.json`](../vercel.json)** — SPA rewrite + monorepo build/output; adjust if you change package name or output path.

---

## Related docs

- [Architecture](./ARCHITECTURE.md)
- [Authentication](./AUTHENTICATION.md)
- [Integrations](./INTEGRATIONS.md) — OAuth redirect URLs must match deployed API origin
- [Database package](../packages/_database/README.md)
- [Project configuration](./PROJECT_CONFIGURATION.md)

External: [Vite on Vercel](https://vercel.com/docs/frameworks/vite), [Turborepo on Vercel](https://vercel.com/docs/monorepos/turborepo).
