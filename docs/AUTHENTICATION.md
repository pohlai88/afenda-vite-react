# Authentication (Vite + Afenda ERP)

The **`apps/web`** client is a **Vite + React SPA**. It does **not** use Next.js Server Components, `middleware.ts`, or the **Auth.js App Router** integration. Session and token **truth** live on a **server** you control (or on the identity provider); the browser only drives **redirects**, **stores client state**, and sends **credentials or bearer tokens** with API calls.

This document maps common ERP auth goals to **Vite-appropriate** patterns.

---

## 1. Mental model

| Concern                           | Where it runs                                   |
| --------------------------------- | ----------------------------------------------- |
| Login redirect, callback handling | Browser (SPA) + identity provider (Auth0, etc.) |
| Session store or token issuance   | **Your backend** and/or **IdP**                 |
| Authorization for ERP data        | **Every API** (never trust the UI alone)        |
| “Am I logged in?” for UX          | React state + optional `/api/session` (BFF)     |

**Rule:** Anything sensitive is enforced **on the server** (REST/GraphQL/tRPC, server actions on a backend, edge functions). The Vite bundle is **public**.

---

## 2. Recommended architectures

### Option A — Backend for frontend (BFF) + cookie sessions

Run a small **Node** API (e.g. **Hono**, **Express**, **Fastify**) in this monorepo (e.g. `apps/api/`) or as a separate service. Use **[Auth.js](https://authjs.dev/)** (formerly NextAuth) **without** Next: Auth.js documents **[framework integrations](https://authjs.dev/getting-started/integrations)** for non-Next servers.

- **Sessions:** database-backed or encrypted cookies via Auth.js adapter (e.g. **Drizzle** + PostgreSQL).
- **Provider:** **Auth0** (or OIDC) configured in Auth.js `providers`.
- **Vite app:** same site or configured **CORS** + `credentials: 'include'` so **httpOnly** cookies set by the API are sent on `fetch` to your API origin.

**Pros:** Familiar “server session” model; good fit for ERP auditing and revocation.  
**Cons:** You must deploy and secure the API; CSRF and cookie rules need care if SPA and API share or split domains.

### Option B — Auth0 SPA (PKCE) + APIs that validate access tokens

Use **`@auth0/auth0-react`** (or similar) in **`apps/web`**. User signs in via **Auth0 Universal Login**; the SDK manages **PKCE** and tokens in the browser.

- **ERP APIs** validate **JWT access tokens** (issuer, audience, signature, expiry) on every request.
- Prefer **short-lived access tokens** + **refresh** via Auth0’s rules; store tokens **in memory** where possible—not `localStorage` for high-risk tenants unless unavoidable.

**Pros:** Less custom session code in your API if you lean on Auth0-issued JWTs.  
**Cons:** Token handling in the browser must be disciplined; APIs must implement validation consistently.

You can **combine** patterns (e.g. BFF that exchanges an Auth0 code for a server session) if product security requires it.

---

## 3. Environment variables (illustrative)

Split **client-exposed** (`VITE_*`) from **server-only** secrets.

**Vite client** (only non-secret config):

```env
VITE_AUTH0_DOMAIN="your-tenant.auth0.com"
VITE_AUTH0_CLIENT_ID="your-spa-client-id"
VITE_API_BASE_URL="https://api.example.com"
```

**Backend / BFF** (never prefixed with `VITE_`):

```env
AUTH_SECRET="min-32-chars-random"   # e.g. openssl rand -base64 32
DATABASE_URL="postgresql://..."

AUTH0_CLIENT_ID="..."
AUTH0_CLIENT_SECRET="..."
AUTH0_ISSUER="https://your-tenant.auth0.com"
# If using JWT validation on APIs:
AUTH0_AUDIENCE="https://your-api-identifier"
```

Load server env via your process manager or `dotenv` on the API only—not bundled into Vite.

---

## 4. `apps/web`: routing and UX

### Protected routes (React Router)

There is **no** Next `middleware.ts`. Use **route-level guards**:

- **`Navigate`** to `/login` when unauthenticated, or
- **Loader** / **wrapper** components that read auth state and redirect.

Colocate auth UI under something like **`apps/web/src/features/auth/`** (see [Project structure](./PROJECT_STRUCTURE.md)): hooks (`useAuth`), login page, callback route if the SPA handles the OAuth redirect.

```tsx
// Illustrative — adapt to your router API (createBrowserRouter, etc.)
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}
```

### Feature hook (illustrative API)

```tsx
import { useAuth } from "@/features/auth"

function Toolbar() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  // ...
}
```

Implementation backs onto **either** Auth0 React context **or** `fetch('/api/session')` on your BFF—pick one stack and keep the hook as the **single** app-facing API.

---

## 5. Server-side checks (APIs)

**Every** mutation and sensitive read must **authorize** the caller:

- **Cookie session:** resolve session from cookie + session store on each request.
- **Bearer JWT:** verify signature and claims (`sub`, `aud`, `exp`, tenant scoping).

For **fine-grained authorization** (RBAC role assignment, permission keys, multiple roles per tenant, union of grants), see [Roles and permissions](./ROLES_AND_PERMISSIONS.md)—keep **identity** here and **policy** on the API against PostgreSQL (or your policy service).

```typescript
// Pseudocode — shape depends on your framework
export async function postInvoice(req: Request) {
  const user = await requireUser(req) // throws 401 if missing
  // tenant / role checks for ERP
  // ...
}
```

Do **not** rely on “hidden” client routes; crawlers and devtools can hit APIs directly.

---

## 6. Auth0 application setup (SPA + Vite)

Create an Auth0 application of type **Single Page Application** (for Option B) or **Regular Web Application** (if the **server** owns the OAuth confidential client—common with BFF).

**Typical dev URLs** (Vite default port **5173**):

- **Allowed Callback URLs:** `http://localhost:5173`, `http://localhost:5173/callback` (match your router)
- **Allowed Logout URLs:** `http://localhost:5173`
- **Allowed Web Origins:** `http://localhost:5173`

Production: use your real HTTPS origins (e.g. Vercel preview and production domains—see [Deployment](./DEPLOYMENT.md)). Align **exact** paths with how **`@auth0/auth0-react`** or your BFF callback is configured.

Official references: [Auth0 SPA](https://auth0.com/docs/get-started/applications/application-types#single-page-applications), [Auth.js](https://authjs.dev).

---

## 7. Database schema (session / users)

If you use **database sessions** with Auth.js + an adapter, tables such as `users`, `accounts`, `sessions`, `verification_tokens` (and optional WebAuthn) live in **your API’s** schema—not in the Vite app. Define them in the **backend** package (e.g. Drizzle schema next to `apps/api`), and run migrations from CI/CD. See [Database package](../packages/_database/README.md) for Drizzle layout, migrations, and ERP tenant data.

---

## 8. Development-only sign-in

If you add a **credentials** or **dev-only** provider, **gate it strictly**:

- Only when `NODE_ENV === 'development'` **on the server**, or
- Behind a **feature flag** that cannot be enabled in production builds.

Never ship a “login with any password” path to production.

---

## 9. Best practices (Vite + ERP)

1. **Authorize on the server** for every ERP API; the SPA is for UX only.
2. **Prefer httpOnly cookies** (BFF) or **short-lived tokens** + rigorous API validation—not long-lived tokens in `localStorage` for high-assurance tenants.
3. **Tenant / org context** (`tenant_id`, roles) should be resolved **server-side** from the session or token claims, then checked against the resource.
4. **Audit** authentication and authorization events where compliance requires it.
5. **HTTPS** everywhere in production; set **Secure**, **SameSite** appropriately on cookies.
6. **CORS:** if SPA and API are on different origins, configure allowed origins and credentials explicitly—avoid `*` with credentials.

---

## Related docs

- [Architecture](./ARCHITECTURE.md) — monorepo and web client
- [Integrations](./INTEGRATIONS.md) — OAuth for external APIs (GitHub, etc.) vs product sign-in
- [Deployment](./DEPLOYMENT.md) — Vercel URLs for Auth0 allowlists
- [Project structure](./PROJECT_STRUCTURE.md) — where `features/auth` and routes live
- [State management](./STATE_MANAGEMENT.md) — where auth state fits next to other client state
- [Project configuration](./PROJECT_CONFIGURATION.md) — env and tooling
