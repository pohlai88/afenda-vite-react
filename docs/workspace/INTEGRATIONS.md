---
owner: api-ops-auth
truthStatus: canonical
docClass: canonical-doc
relatedDomain: integrations
---

# Integrations (third-party APIs)

This document covers **outbound integrations**: OAuth2 (and similar) used to call **external APIs** on behalf of a **user** or **tenant** (sync data, import issues, post events, etc.).

It is **not** the same as **product sign-in** (Auth0, credentials, sessions for logging into Afenda)—see [Authentication](./AUTHENTICATION.md). Sign-in and “connect GitHub for API access” can share infrastructure (e.g. OAuth **accounts** rows), but the **flows and redirect URLs** are different concerns.

**Runtime split:** The **Vite** app (`apps/web`) has **no** Next.js-style `app/api` routes. OAuth **authorize/callback/token exchange** must run on a **trusted server** (`apps/api`, serverless functions, worker). The SPA only opens links, handles **return navigation**, and calls your JSON API.

---

## 1. Mental model

| Concern                                           | Where it runs                                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| “Connect GitHub” button, return UX                | `apps/web`                                                                                                |
| OAuth redirect URI (authorization `redirect_uri`) | **HTTPS origin of your API** (or dev server for the API—not the Vite port, unless you proxy `/api` to it) |
| Token exchange, refresh, storage                  | **Server + database** ([Database package](../packages/_database/README.md))                               |
| Calling GitHub/Slack/etc.                         | **Server** using stored tokens                                                                            |

---

## 2. GitHub (OAuth2) — pattern

[GitHub](https://github.com) is a common **example**: users connect a GitHub account so the product can call the [GitHub REST API](https://docs.github.com/en/rest) with a user access token.

### 2.1 Configuration

1. Register an **OAuth App** in [GitHub Developer Settings](https://github.com/settings/developers).
2. Set **Authorization callback URL** to match your **API** route **exactly** (scheme, host, path, no trailing slash mismatch):

   **Local (API on port 3000, example):**

   `http://localhost:3000/api/integrations/github/callback`

   **Production:**

   `https://api.your-domain.com/api/integrations/github/callback`

   If you use a **single origin** (same host for SPA and API), the callback may be `https://your-domain.com/api/integrations/github/callback`. The Vite dev server (**`http://localhost:5173`**) is usually **not** the OAuth redirect target unless you reverse-proxy API routes under that host.

3. **Server environment variables** (never `VITE_*`):

   ```env
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-client-secret"
   ```

   If unset, the integration should be **disabled** in UI and API.

### 2.2 OAuth2 (authorization code)

- **Authorize:** `GET https://github.com/login/oauth/authorize` (with `client_id`, `redirect_uri`, `scope`, `state`).
- **Token:** `POST https://github.com/login/oauth/access_token`
- **Flow:** Authorization code; prefer **PKCE** if the provider supports it for public clients (often integrations use **confidential** server-side clients with secret).

### 2.3 API routes (illustrative)

Implement on your **backend** (paths are examples):

| Route                               | Method | Description                                                                                |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| `/api/integrations/github/connect`  | GET    | Session required. Redirects to GitHub. Query: `returnUrl` (optional, validated allowlist). |
| `/api/integrations/github/callback` | GET    | Exchanges `code` for tokens; stores tokens; redirects to `returnUrl` or default.           |

The **`apps/web`** app might use:

```txt
http://localhost:5173/settings/integrations?connected=github
```

as **`returnUrl`** after success—**validate** allowed origins to prevent open redirects.

### 2.4 Stored data

Persist **refresh/access tokens** and provider account id **server-side** only. Options:

- Reuse **Auth.js–style** `accounts` rows (`provider: 'github'`, `access_token`, …) if your auth stack already uses that schema; or
- A dedicated table, e.g. `integration_connections` / `oauth_accounts`, scoped by **`tenant_id`** and **`user_id`** as needed.

Encrypt **secrets at rest** if your threat model requires it.

### 2.5 Calling GitHub from server code

```typescript
// Pseudocode — lives in apps/api (or similar), not in Vite client
async function githubFetch(path: string, accessToken: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  return res.json()
}
```

Expose only **aggregated** data to the browser via your own API if needed—**do not** forward raw tokens to the client.

---

## 3. Sync state (optional)

For **long-running or scheduled syncs** (repos, issues, ERP documents), use a **control table** in PostgreSQL, for example:

- `integration_sync_control` — last run, cursor, status, error message per `(tenant_id, provider, resource)`.

Define this in your **database package** when you implement sync; see [Database package](../packages/_database/README.md). Workers or queue consumers read/write this table; the Vite app triggers **“sync now”** via an authenticated API.

---

## 4. Outbound webhooks (tenant → customer systems)

**Outbound webhooks** let a **tenant** register HTTPS endpoints to receive **event notifications** (e.g. order approved, invoice posted). Implementation is **server-side**:

- Register URL + secret per tenant (admin UI in `apps/web`; secrets stored in DB).
- Sign payloads (e.g. HMAC with shared secret), retry with backoff, persist delivery attempts for support/debug.

This is separate from **incoming** OAuth callbacks; name routes clearly to avoid confusion (`/api/webhooks/dispatch` vs `/api/integrations/github/callback`).

---

## 5. Adding another integration

1. **UI** — Feature module under `apps/web/src/features/<name>/` (connect button, status, disconnect).
2. **API** — Routes under your backend, e.g. `apps/api/src/routes/integrations/<name>/`.
3. **Tokens** — Store in DB with clear `provider` key; scope by tenant/user per [Glossary](./GLOSSARY.md).
4. **Env** — Document `PROVIDER_CLIENT_ID` / `PROVIDER_CLIENT_SECRET` in server env only; optional entry in a typed `env` module for the API package.
5. **Docs** — Add a subsection here (or a linked `docs/integrations/<provider>.md` for long runbooks).

---

## Related docs

- [Authentication](./AUTHENTICATION.md) — product login vs API tokens
- [Database package](../packages/_database/README.md) — where tokens and sync state live
- [Deployment](./DEPLOYMENT.md) — public URLs for OAuth callbacks in production
- [Architecture](./ARCHITECTURE.md) — SPA vs API boundaries
