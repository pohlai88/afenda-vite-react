# ADR-0004: Web `src/` architecture — RPC, runtime, features, marketing

- **Status:** Accepted
- **Date:** 2026-04-19
- **Owner:** Platform / web
- **Review by:** 2026-10-01
- **Related:** [ADR-0003](./ADR-0003-package-root-layout-and-artifact-boundaries.md) (package root layout)

## Context

`apps/web/src` mixed several concerns: a second feature root (`src/features/`), overloaded “api-client” naming (RPC vs browser fetch), optional global `routes/` and `styles/`, and vague `pages/`. That made boundaries unclear and invited duplicate “roots” (`src/services/`, `src/hooks/`, etc.) later.

## Decision

### 1. System boundaries (non-negotiable vocabulary)

| Boundary                                                                                 | Location                           | Meaning                                                                                                            |
| ---------------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Typed Hono RPC** (`hc`, `AppType`)                                                     | `src/rpc/`                         | Only the RPC client surface, envelopes, and contracts aligned with the server. **Renamed from** `src/api-client/`. |
| **Platform runtime** (browser fetch stack, env, policy, boundaries for non-RPC concerns) | `src/app/_platform/runtime/`       | **Renamed from** `src/app/_platform/api-client/`. Not “API” in the Hono RPC sense.                                 |
| **Product features**                                                                     | `src/app/_features/` only          | **No** `src/features/` at repo root.                                                                               |
| **Hono-coupled features**                                                                | `src/app/_features/hono/<domain>/` | Grouped by **dependency** (Hono RPC), not a single flat bucket.                                                    |
| **Marketing**                                                                            | `src/marketing/`                   | Replaces vague `src/pages/` for marketing-only surfaces.                                                           |
| **Global cross-cutting**                                                                 | `src/share/`                       | Zero feature/RPC/marketing ownership; may be used even from shell.                                                 |
| **Workers**                                                                              | `src/worker/`                      | Off–main-thread / worker entrypoints.                                                                              |

**Hono’s official RPC docs** require `AppType` + `hono/client`’s `hc`; they do **not** prescribe folder names. The names above are **Afenda’s contract** for humans and tooling.

### 2. `_features/hono/` must be two-level

Grouping by dependency (`hono`) is intentional, but **a flat `hono/` alone becomes a god folder**.

**Rule:** under `_features/hono/`, always structure by **domain**:

```txt
app/_features/hono/
  users/
  invoices/
  auth/
  ...
```

New RPC-bound screens go under the right domain, not loose files at `hono/` root (except a minimal `index.ts` barrel if needed).

### 3. Routing

- **Remove** top-level `src/routes/` if redundant (avoid a third global routing story).
- **Keep** internal `/**/routes/` route helpers (local, composable).
- **Marketing** lives under `src/marketing/` (not `pages/` as a generic name).

### 4. Styles

- **Remove** top-level `src/styles/`.
- **Global** styles: `src/index.css` only as the top-level CSS entry.
- **Everything else:** colocated with features/marketing/components.

### 5. Hard rules (do not regress)

1. **Never** reintroduce `src/features/` as a second feature root.
2. **Never** use the name `api-client` for these two concepts — only **`rpc`** and **`runtime`** (under `_platform`).
3. **Never** add a global `src/routes/` bucket without a new ADR.
4. **Never** add a global `src/styles/` bucket; no duplicate style roots at `src/` top level.
5. **Discourage** new top-level buckets such as `src/api/`, `src/services/`, `src/hooks/` — prefer placement inside `app/_features/`, `app/_platform/`, `rpc/`, or `share/` per ownership.

### 6. Enforcement (later)

- **Document:** this ADR + `apps/web` README pointer.
- **Optional:** ESLint boundary rules / `verify:*` scripts for path prefixes, similar to `verify:layout` for the package root.

## Target shape (reference)

```txt
src/
  index.css

  app/
    _features/
      hono/
        users/
        invoices/
        ...
    _platform/
      runtime/
      ...
    /**/routes/

  rpc/

  marketing/

  share/

  worker/
```

Implementation may still use existing file names inside `rpc/` (e.g. `web-client.ts`) until a rename pass; the **directory names** above are the contract.

## Consequences

### Positive

- Clear vocabulary: **RPC**, **runtime**, **domain under hono**, **marketing**, **share**.
- Reduces “everything is a client” confusion and duplicate feature roots.

### Negative

- One-time migration cost (moves, re-exports, import updates).
- Requires discipline to keep **two-level** structure under `hono/`.

## Related

- Hono RPC: [RPC guide](https://hono.dev/docs/guides/rpc) — `AppType`, `hc`, `hono/client` (folder layout is project-specific).
