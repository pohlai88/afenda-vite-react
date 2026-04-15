# Local one-click developer sign-in (Afenda)

This flow gives your machine a **real Better Auth session** (cookies) using credentials that exist **only in API server environment variables** — never in `VITE_*` client bundles.

## Prerequisites

1. **PostgreSQL** with Drizzle migrations applied (`pnpm --filter @afenda/database db:migrate`).
2. **Better Auth tables** applied (`pnpm --filter @afenda/better-auth auth:migrate`).
3. **Runtime env** for the API: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (for local Vite + proxy, typically `http://localhost:5173`). See `.env.database.example`.

## One-time: create the dev user

Use either:

- **Register** at `/register` in the SPA with the email/password you want for local dev, or
- A seed/script that inserts a Better Auth user consistent with your `users` / tenant rows (email must match Afenda `users.email` if you rely on `/v1/me`).

Remember the **email** and **password** you will put in server env below.

## API server env (gitignored)

`@afenda/api` loads **repo-root `.env.neon`**, then **repo-root `.env`**. Put the variables below in **either** file (restart the API after editing).

If you saw **503** _“Dev quick login is not configured”_ while using only `.env`, older builds did not load `.env` — upgrade to current `main` or ensure vars are in `.env.neon` as well.

Set:

```bash
# Required for any Better Auth + DB operation
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=   # min 32 chars
BETTER_AUTH_URL=http://localhost:5173

# One-click dev login (never enable in production deployments)
AFENDA_DEV_LOGIN_ENABLED=true
AFENDA_DEV_LOGIN_EMAIL=you@your-team.local
AFENDA_DEV_LOGIN_PASSWORD=your-local-only-password

# Optional: require header X-Afenda-Dev-Login-Secret on POST /api/dev/login
# AFENDA_DEV_LOGIN_SECRET=long-random-string
```

`POST /api/dev/login` is registered in **non-production** API builds. If env is incomplete, it returns **503** with a JSON `error` (not a silent failure).

## Web app env (optional)

The login page shows **Local development** / one-click sign-in automatically when you run `pnpm run dev` (`import.meta.env.DEV`). You do **not** need a flag to reveal it.

Optional in `apps/web/.env.local`:

```bash
# Optional: button label for one-click sign-in
# VITE_AFENDA_DEV_LOGIN_LABEL=Core team
# Optional: prefill email on the main form (not a secret)
# VITE_AFENDA_DEV_LOGIN_EMAIL=you@your-team.local
```

## Verify the API host

Open **`http://localhost:3001/`** — you should see JSON (service name and route hints), not `404`. Use **`http://localhost:3001/health`** for a minimal liveness check.

### Automated smoke test (from repo root)

With **`pnpm --filter @afenda/api dev`** running in another terminal:

```bash
pnpm run script:dev-login-api-smoke
```

Uses `AUDIT_API_URL` (default `http://localhost:3001`). It checks `GET /`, `GET /health`, optionally `GET /api/auth/ok`, and `POST /api/dev/login` (503 is OK unless `SMOK_STRICT_DEV_LOGIN=true`). It prints a **human checklist** at the end for browser/Cookie issues.

## Run the stack

Terminal 1 — API (default port **3001**):

```bash
pnpm --filter @afenda/api dev
```

Terminal 2 — Vite (default **5173**, proxies `/api` → API):

```bash
pnpm --filter @afenda/web dev
```

## Use one-click sign-in

1. Open `http://localhost:5173/login`.
2. Scroll to **Local development** inside the login card (no floating overlay).
3. If you set `AFENDA_DEV_LOGIN_SECRET` on the API, open **Optional: team secret** and enter it; otherwise leave that section closed.
4. Click **One-click sign-in — …**. You should land on `/app` (or your `from` redirect) with a valid session.

## Troubleshooting

| Symptom                                                      | Check                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section not visible                                          | Only visible when running Vite dev (`pnpm run dev`), not in `vite preview` / production build.                                                                                                                                                                                               |
| Vite log: `http proxy error` / `ECONNREFUSED` for `/api/...` | **API is not running.** Start `pnpm --filter @afenda/api dev` (or `pnpm dev` at the repo root to run Turbo `dev` tasks). The web app alone cannot answer `/api`; Vite proxies to `VITE_API_URL` or `http://localhost:3001`.                                                                  |
| `404` on `/api/dev/login`                                    | Rare: only if the API process is a **production** build (`NODE_ENV=production`), the route is not registered. Use `pnpm --filter @afenda/api dev`.                                                                                                                                           |
| `503` with JSON `error`                                      | API is running in dev but **env is incomplete**: set `AFENDA_DEV_LOGIN_ENABLED=true`, `AFENDA_DEV_LOGIN_EMAIL`, and `AFENDA_DEV_LOGIN_PASSWORD`. The response body explains this.                                                                                                            |
| 401 / invalid credentials                                    | **Better Auth:** `AFENDA_DEV_LOGIN_EMAIL` / `AFENDA_DEV_LOGIN_PASSWORD` must match an existing `signUp.email` user in the same DB. **`BETTER_AUTH_URL`** must be `http://localhost:5173` when using the Vite app on 5173 (cookie + CSRF). Re-register the user if you changed secrets or DB. |

## Security

- Do **not** set `AFENDA_DEV_LOGIN_*` in production.
- Do **not** put passwords in `VITE_*`.
- Prefer `AFENDA_DEV_LOGIN_SECRET` if the API is reachable beyond localhost.
