# Auth.js and Auth0 guide (Afenda)

This document **indexes** **Auth.js** and **Auth0** for the **Vite SPA + API** stack. It is **not** the product auth spec — that remains **[Authentication](../AUTHENTICATION.md)**. Content below is aligned with current **Auth.js** and **Auth0** documentation (see **Official documentation**).

**Status:** **Patterns documented** — install **`@auth/*`** / **`next-auth`** family or **Auth0** SDKs when you implement auth.

**Official documentation:**

- **Auth.js** — [authjs.dev](https://authjs.dev/), [Getting started](https://authjs.dev/getting-started), [Providers](https://authjs.dev/getting-started/providers), [Integrations (non-Next)](https://authjs.dev/getting-started/integrations), [Auth0 provider](https://authjs.dev/getting-started/providers/auth0)
- **Auth0 platform** — [auth0.com/docs](https://auth0.com/docs), [Authorization Code + PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce/add-login-using-the-authorization-code-flow-with-pkce), [Call your API using PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce/call-your-api-using-the-authorization-code-flow-with-pkce)
- **Auth0 React SDK** — [`@auth0/auth0-react`](https://github.com/auth0/auth0-react), [Migration (v1 → v2 `authorizationParams`)](https://github.com/auth0/auth0-react/blob/main/MIGRATION_GUIDE.md)

---

## Map to Afenda docs

| Topic | Read |
| --- | --- |
| Cookie BFF / Auth.js without Next | [Authentication](../AUTHENTICATION.md) §Option A |
| Auth0 SPA (PKCE) + API JWT | [Authentication](../AUTHENTICATION.md) §Option B |
| RBAC / PBAC | [Roles and permissions](../ROLES_AND_PERMISSIONS.md) |
| HTTP routes | [API reference](../API.md) |

---

## Option A — Auth.js on a Node server (BFF)

Auth.js supports **framework integrations** beyond Next.js. For a **cookie session BFF**, mount Auth.js on your HTTP app (e.g. **Express** or patterns mirrored in **Fastify** per [Authentication](../AUTHENTICATION.md)).

### Express (upstream pattern)

Packages are scoped under **`@auth/express`** (see [Auth.js integrations](https://authjs.dev/getting-started/integrations)). Example shape from current docs:

```typescript
import { ExpressAuth } from '@auth/express';
import Auth0 from '@auth/express/providers/auth0';

app.use(
  '/auth/*',
  ExpressAuth({
    providers: [Auth0],
  }),
);
```

- **`AUTH_SECRET`** (and provider secrets) stay **server-only** — see [Authentication](../AUTHENTICATION.md) §3.
- Configure **Auth0** in the Auth0 dashboard; Auth.js documents **`AUTH_AUTH0_ID`** and **`AUTH_AUTH0_SECRET`** for this provider ([Auth0 provider](https://authjs.dev/getting-started/providers/auth0)). Register the **callback URL** Auth.js expects for your integration (see the provider page’s **Callback URL** tab for Express vs Next.js).
- **Vite SPA:** same-site or explicit **CORS** + **`credentials: 'include'`** on `fetch` to the BFF origin so **httpOnly** session cookies flow to **`/api/...`** (or your BFF prefix).

Custom **OIDC** providers use **`type: "oidc"`** with **`issuer`**, **`clientId`**, **`clientSecret`** — see [configuring OAuth/OIDC providers](https://authjs.dev/guides/configuring-oauth-providers).

---

## Option B — Auth0 in the SPA (`@auth0/auth0-react`)

Use **`@auth0/auth0-react`** for **Universal Login** and **Authorization Code Flow with PKCE**. The SDK manages **`code_verifier`**, **`code_challenge`**, and token exchange against `https://{domain}/oauth/token` (see Auth0’s [PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce/add-login-using-the-authorization-code-flow-with-pkce) docs).

### `Auth0Provider` (v2-style)

Put **`redirect_uri`**, **`audience`**, and **`scope`** inside **`authorizationParams`** (v2 migration — do not rely on v1 top-level **`audience`** / **`redirectUri`** props alone):

```tsx
<Auth0Provider
  domain={import.meta.env.VITE_AUTH0_DOMAIN}
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: 'openid profile email',
  }}
  useRefreshTokens={true}
  useRefreshTokensFallback={true}
  cacheLocation="memory"
>
  {children}
</Auth0Provider>
```

- **`audience`**: must match the **API identifier** configured in Auth0 so access tokens are minted for your **resource server** ([Call your API using PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce/call-your-api-using-the-authorization-code-flow-with-pkce)).
- **`getAccessTokenSilently()`**: use for **`Authorization: Bearer`** on ERP API calls; supports optional **`authorizationParams`** (e.g. different **`audience`** / **`scope`**) — note Auth0’s rules around **refresh tokens** and **multiple audiences** ([Auth0 SPA SDK](https://auth0.com/docs/libraries/auth0-single-page-app-sdk)).
- **`cacheLocation`**: **`memory`** reduces persistence risk vs **`localstorage`**; align with security review in [Authentication](../AUTHENTICATION.md).

---

## How we wire Auth.js / Auth0 (conventions)

| Topic | Convention |
| --- | --- |
| **Secrets** | **`AUTH_SECRET`**, **client secrets**, **signing keys** — server-only; only **non-secret** SPA config uses **`VITE_*`** ([Authentication](../AUTHENTICATION.md) §3) |
| **`apps/api`** | **One** session or **JWT verification** pipeline for **`/api/tenants/...`** — no duplicate ad hoc validators |
| **PKCE / APIs** | **`audience`** and **`scope`** on the SPA must match what **`apps/api`** validates (issuer, signature, expiry, claims) |
| **Packages** | Pin **`@auth/express`**, **`next-auth`**, **`@auth0/auth0-react`**, etc. in **`package.json`**; verify majors together in one PR |

---

## Red flags

- Putting **client secrets** or **`AUTH_SECRET`** in **`VITE_*`** or the static bundle.
- **Trusting** the SPA for authorization — **every** sensitive API path must validate session or JWT ([Authentication](../AUTHENTICATION.md) §5).
- Mixing **Auth0Provider v1** flat props with **v2** docs — migrate to **`authorizationParams`** for new code.

---

## Related documentation

- [Authentication](../AUTHENTICATION.md)
- [Fastify](./fastify.md)

**External:** [authjs.dev](https://authjs.dev/) · [Auth0 docs](https://auth0.com/docs) · [`@auth0/auth0-react`](https://github.com/auth0/auth0-react)

**Context7 library IDs (doc refresh):** `/websites/authjs_dev` · `/auth0/auth0-react` · `/websites/auth0`
