# React guide (Afenda)

This document describes how **`apps/web`** uses **React 19** as a **Vite SPA** (no React Server Components): **React Router** in **data-router** style with **`createBrowserRouter`** + **`RouterProvider`**, **TanStack Query** for server state, and the **React Compiler** via **`@vitejs/plugin-react`**’s **`reactCompilerPreset`** and **`@rolldown/plugin-babel`**.

**Status:** **Adopted** — **`react`** / **`react-dom`** **`^19.2.4`**, **`react-router-dom`** **`^7.14.0`** in [`apps/web/package.json`](../../apps/web/package.json).

**Official documentation:**

- [react.dev](https://react.dev/) — [Learn](https://react.dev/learn), [API reference](https://react.dev/reference/react)
- [Upgrade to React 19](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) — breaking changes, Strict Mode, codemods
- [React 19 release notes](https://react.dev/blog/2024/12/05/react-19) — **`ref` as a prop**, deprecations
- [React Compiler](https://react.dev/learn/react-compiler) — automatic memoization; [ESLint rules](https://react.dev/reference/eslint-plugin-react-hooks/lints/preserve-manual-memoization) for **`useMemo`** / **`useCallback`** with the compiler
- [react.dev/blog](https://react.dev/blog) — ongoing releases
- [React on GitHub](https://github.com/facebook/react)
- **Routing:** [React Router](https://reactrouter.com/) — [Start / modes](https://reactrouter.com/start/modes), [SPA how-to](https://reactrouter.com/how-to/spa), [Data routers](https://reactrouter.com/api/data-routers/create-browser-router), [`react-router-dom` on npm](https://www.npmjs.com/package/react-router-dom)

---

## Stack

| Package / tool                                                                        | Role                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`react`** / **`react-dom`**                                                         | UI runtime (React 19)                                                                                                                                                                    |
| **`react-router-dom`**                                                                | Client **data router**: **`createBrowserRouter`**, **`RouterProvider`**, **`Navigate`**, **`lazy`** route chunks                                                                         |
| **`@vitejs/plugin-react`** + **`reactCompilerPreset`** + **`@rolldown/plugin-babel`** | [React Compiler](https://react.dev/learn/react-compiler) in Vite — e.g. **`compilationMode: 'infer'`**, **`target: '19'`** in [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) |
| **`babel-plugin-react-compiler`**                                                     | Compiler Babel plugin (pulled in for the preset/toolchain; see web `package.json`)                                                                                                       |

---

## How we use React

| Topic            | Convention                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Architecture** | **Vite SPA** only — **no** React Server Components or Next.js App Router ([Architecture](../ARCHITECTURE.md)). Prefer **`apps/web/src/app/_features/*`** for ERP modules and **`apps/web/src/app/_platform/*`** for platform runtime ([AGENTS.md](../../AGENTS.md)).                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Routing**      | [`apps/web/src/router.tsx`](../../apps/web/src/router.tsx) wires **`createBrowserRouter`** from route objects in [`apps/web/src/routes/route-browser.tsx`](../../apps/web/src/routes/route-browser.tsx): marketing **`/`**, transitional **`/app/login`**, authenticated **`/app/*`** (shell layout from **`_platform/shell`**). Root render uses **`RouterProvider`** in [`App.tsx`](../../apps/web/src/App.tsx). **Auth guards** live under a formal auth feature when implemented. You can add **loaders** / **actions** per route later ([data routers](https://reactrouter.com/api/data-routers/create-browser-router)) without leaving **`react-router-dom`**. |
| **Data**         | Server state via **TanStack Query** + HTTP [API](../API.md); not **`getServerSideProps`** or Server Actions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| **Auth**         | Route guards / layout wrappers — [Authentication](../AUTHENTICATION.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **UI**           | Composition and colocation — [Components and styling](../COMPONENTS_AND_STYLING.md), [Design system](../DESIGN_SYSTEM.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Compiler**     | With the compiler enabled, many components can drop **redundant** **`useMemo`** / **`useCallback`**; the compiler **preserves** intentional manual memoization — keep dependency arrays complete ([preserve-manual-memoization](https://react.dev/reference/eslint-plugin-react-hooks/lints/preserve-manual-memoization)).                                                                                                                                                                                                                                                                                                                                           |

---

## React 19 (client-relevant)

- **`ref` as a prop:** function components can take **`ref`** in props instead of **`forwardRef`** ([release notes](https://react.dev/blog/2024/12/05/react-19)); class component refs are unchanged.
- **Strict Mode (dev):** double render reuses **`useMemo`** / **`useCallback`** results from the first pass where appropriate ([upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)).

---

## Red flags

- Patterns that assume **Next.js** (**`'use client'`**, Server Actions, RSC, **`use server`**).
- **Prop drilling** large ERP trees without context or composition boundaries.
- **Copy-pasting** framework-only Router APIs without checking **`react-router-dom`** v7 docs (framework **SPA mode** / **`ssr: false`** applies to **React Router as a framework**, not our plain Vite entry).

---

## Deeper reference

- Router and app shell: [`apps/web/src/routes/`](../../apps/web/src/routes/) (central route tree), [`apps/web/src/router.tsx`](../../apps/web/src/router.tsx), [`apps/web/src/app/_platform/shell/`](../../apps/web/src/app/_platform/shell/), [`apps/web/src/App.tsx`](../../apps/web/src/App.tsx).
- Build: [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) — **`react()`**, **`reactCompilerPreset`**, **`@rolldown/plugin-babel`**.
- Skill (optional): [vercel-react-best-practices](../../.agents/skills/vercel-react-best-practices/SKILL.md).

---

## Related documentation

- [Vite](./vite.md)
- [TanStack Query](./tanstack-query.md)
- [Zustand](./zustand.md)
- [React Hook Form + Zod](./react-hook-form-zod.md)
- [Vitest](./vitest.md)

**External:** [react.dev](https://react.dev/) · [React Router](https://reactrouter.com/)

**Context7 library IDs (doc refresh):** `/websites/react_dev` · `/remix-run/react-router`
