# Zustand guide (Afenda)

This document describes how **`apps/web`** uses **[Zustand](https://github.com/pmndrs/zustand)** **v5** for **small, client-only UI state** (shell, theme, layout prefs)—**not** authoritative ERP **server truth**, which belongs behind the HTTP [API](../API.md) and **[TanStack Query](./tanstack-query.md)**.

**Status:** **Adopted** in **`apps/web`** — **`zustand`** **`^5.0.12`** in [`apps/web/package.json`](../../apps/web/package.json). A concrete shell store lives in [`apps/web/src/share/state/use-app-shell-store.ts`](../../apps/web/src/share/state/use-app-shell-store.ts): **`create`** with **`devtools`** wrapping **`persist`**, **`partialize`** limiting what reaches **`localStorage`**.

**Official documentation:**

- [Zustand docs](https://zustand.docs.pmnd.rs/) — Poimandres doc site
- [Introduction](https://zustand.docs.pmnd.rs/getting-started/introduction)
- [TypeScript](https://zustand.docs.pmnd.rs/guides/typescript) — **`create<T>()(...)`** currying for inference
- [Persisting store data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) — **`persist`**, **`partialize`**, **`createJSONStorage`**, storage keys
- [Prevent re-renders with `useShallow`](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow) — shallow equality for object/array selectors
- [README (npm / repo)](https://github.com/pmndrs/zustand#readme) — **Persist middleware**, **Redux DevTools**, **TypeScript usage**, **`useShallow`** (**`zustand/react/shallow`**) — stable when doc-site paths move
- [Zustand on GitHub](https://github.com/pmndrs/zustand)

---

## Stack (`apps/web`)

| Piece | Role |
| --- | --- |
| **`create`** | Define store + actions |
| **`persist`** | **UX-only** hydration (e.g. theme, language, sidebar) — **`partialize`** must **exclude** secrets and volatile server-backed fields |
| **`devtools`** | Debug/time-travel in development (strip or gate in production if desired) |
| **Selectors** | Prefer **narrow** slices; use **`useShallow`** when selecting **objects/arrays** to avoid extra renders ([docs](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow), [README](https://github.com/pmndrs/zustand#selecting-multiple-state-slices)) |

---

## How we use Zustand

| Topic | Convention |
| --- | --- |
| **Server truth** | Tenant data, permissions, domain entities → **HTTP** + **TanStack Query** ([API](../API.md), [TanStack Query](./tanstack-query.md)) |
| **Stores** | **Small**, feature-scoped stores; avoid one **global god-store** unless it stays UI-only ([State management](../STATE_MANAGEMENT.md)) |
| **Example** | [`use-app-shell-store.ts`](../../apps/web/src/share/state/use-app-shell-store.ts) — **`partialize`** persists **`theme`**, **`language`**, **`sidebarOpen`** only; **`currentUser`** and **`lastUpdated`** stay **non-persisted** (review when wiring real auth) |
| **Placement** | New substantial client state → prefer **`apps/web/src/features/*`** colocation ([AGENTS.md](../../AGENTS.md)) |
| **Persist** | **Non-sensitive** UX only; **tokens**, refresh material, or **PII** require explicit [Authentication](../AUTHENTICATION.md) / security review |

---

## Red flags

- Replacing **TanStack Query** for data that **must** match the **server** (cache, invalidation, optimistic updates).
- **`persist`** (or **`localStorage`**) for **auth tokens** / secrets without explicit sign-off.
- Selecting **whole store** or **new object literals** in hot paths without **`useShallow`** or **split selectors** ([`useShallow` guide](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow)).

---

## Deeper reference

- [`apps/web/src/share/state/use-app-shell-store.ts`](../../apps/web/src/share/state/use-app-shell-store.ts) — **`devtools` + `persist` + `partialize`** pattern.
- [Vite](./vite.md) — **`zustand`** in **`optimizeDeps.include`** where useful ([`vite.config.ts`](../../apps/web/vite.config.ts)).

---

## Related documentation

- [State management](../STATE_MANAGEMENT.md)
- [TanStack Query](./tanstack-query.md)
- [React](./react.md)
- [API reference](../API.md)
- [Authentication](../AUTHENTICATION.md)

**External:** [Zustand docs](https://zustand.docs.pmnd.rs/) · [GitHub](https://github.com/pmndrs/zustand)

**Context7 library IDs (doc refresh):** `/pmndrs/zustand` · `/websites/zustand_pmnd_rs`
