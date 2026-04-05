# Octokit guide (Afenda)

This document describes **planned** use of the **Octokit** family for **GitHub REST** (and optionally **GraphQL**) from **Node only** — **`apps/api`**, workers, **GitHub Actions** — **never** from the Vite client ([Architecture](../ARCHITECTURE.md)).

**Status:** **Planned** — not in workspace **`package.json`**. Choose **`octokit`** (REST + GraphQL in one client) or **`@octokit/rest`** (REST-only) when you add the dependency.

**Official documentation:**

- [Octokit.js (meta package)](https://github.com/octokit/octokit.js) — **`new Octokit({ auth })`**, **`octokit.rest`**, **`octokit.graphql`**
- [REST API client (`@octokit/rest`)](https://github.com/octokit/rest.js) — [`octokit.github.io/rest.js`](https://octokit.github.io/rest.js/v21/)
- [GraphQL client](https://github.com/octokit/graphql.js) — lower-level GraphQL if not using **`octokit`**’s **`graphql`**
- [Auth — GitHub App](https://github.com/octokit/auth-app.js) · [Auth strategies overview](https://github.com/octokit/octokit.js#authentication)
- [Plugin: retry](https://github.com/octokit/plugin-retry.js) · [Plugin: throttling](https://github.com/octokit/plugin-throttling.js)
- [GitHub REST docs](https://docs.github.com/en/rest) · [Rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) · [GraphQL resource limits](https://docs.github.com/en/graphql/overview/resource-limitations)

---

## How we use Octokit

| Topic | Convention |
| --- | --- |
| **Secrets** | Read tokens from **server env** or Actions **`secrets`** — **never** `VITE_*` or client bundles. Prefer **`GITHUB_TOKEN`** in Actions with **least** permissions; use **fine-grained PAT** or **GitHub App** installation tokens for cross-repo or elevated scopes ([Integrations](../INTEGRATIONS.md)) |
| **Client** | **`import { Octokit } from 'octokit'`** with **`auth: process.env.GITHUB_*`** and a distinct **`userAgent`** (product name + version) so GitHub can identify traffic |
| **REST** | Prefer **`octokit.rest.*`** generated methods; they track OpenAPI and return **`{ data, status, headers }`** |
| **GraphQL** | Use **`octokit.graphql(query, variables)`** when the REST surface is awkward (search, Projects, some org queries) |
| **Errors** | Handle **`@octokit/request-error`** **`RequestError`** — branch on **`error.status`** (401/403/404/422) and **never** log full **`error.response`** if it may contain secrets |
| **Pagination** | Use **`octokit.paginate(...)`** (or the iterator APIs documented for your Octokit major) for list endpoints — avoid manual page loops unless you need tight control ([REST.js usage](https://github.com/octokit/rest.js/blob/main/docs/src/pages/api/00_usage.md)) |
| **Rate limits** | Respect primary and **secondary** rate limits; for sync-heavy jobs compose **`@octokit/plugin-retry`** + **`@octokit/plugin-throttling`** on **`Octokit.plugin(...)`** ([throttling example](https://github.com/octokit/rest.js/blob/main/docs/src/pages/api/09_throttling.md)) |
| **Scope** | **Least privilege** for PATs / App permissions; document required scopes in the integration runbook |

### Minimal REST client (illustrative)

```typescript
import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: 'afenda-api/0.0.0',
});

try {
  const { data } = await octokit.rest.repos.get({ owner: 'octokit', repo: 'octokit.js' });
  console.log(data.full_name);
} catch (error) {
  // Octokit uses @octokit/request-error (RequestError) with numeric `status`
  if (error && typeof error === 'object' && 'status' in error) {
    const { status, message } = error as { status: number; message: string };
    console.error(status, message);
  }
  throw error;
}
```

### Pagination (illustrative)

```typescript
const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
  owner: 'octokit',
  repo: 'rest.js',
  state: 'open',
  per_page: 100,
});
```

Use **`per_page`** within GitHub’s documented max; prefer **`paginate`** for “fetch all pages” workflows.

---

## Red flags

- **PAT** or **installation tokens** in the **browser**, Storybook, or **`VITE_*`** env.
- Logging **`Authorization`** headers, full **Octokit** error payloads, or **webhook** bodies without **redaction**.
- **Hammering** the API without **throttling** / backoff — risk of **secondary rate limits** and org-wide disruption.
- **Duplicating** GitHub API behavior in the client; keep **provenance** and **writes** on the server.

---

## Related documentation

- [Integrations](../INTEGRATIONS.md)
- [Authentication](../AUTHENTICATION.md) — product login vs GitHub integration
- [Pino](./pino.md) — structured logging and redaction on **`apps/api`**

**External:** [Octokit.js](https://github.com/octokit/octokit.js) · [GitHub REST API](https://docs.github.com/en/rest)

**Context7 library IDs (doc refresh):** `/octokit/octokit.js` · `/octokit/rest.js`
