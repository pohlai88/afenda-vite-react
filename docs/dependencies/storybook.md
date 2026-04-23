---
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
relatedDomain: dependency-guide
category: web-client-planned
status: Planned
---

# Storybook guide (Afenda)

This document describes **planned** **[Storybook](https://storybook.js.org/)** for **`apps/web`**: a **frontend workshop** to build UI in isolation (dense ERP tables, filters, layouts), share **documentation**, and optionally run **interaction tests** and **visual regression** (e.g. **Chromatic**), using the same **React + Vite** stack as production.

**Status:** **Planned** — Storybook is **not** installed under **`apps/web`** today (no **`.storybook/`** in the app). **`apps/web`** ships **Vite 8** ([`package.json`](../../apps/web/package.json)); before installing, confirm **Storybook ↔ Vite** support on the [React (Vite) framework](https://storybook.js.org/docs/get-started/frameworks/react-vite) page, [releases](https://storybook.js.org/releases), and upstream **[`MIGRATION.md`](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md)** (Vite plugin minimums change by Storybook major).

**Official documentation:**

- [storybook.js.org](https://storybook.js.org/) — product overview
- [Install Storybook](https://storybook.js.org/docs/get-started/install) — **`npx storybook@latest init`** (or manual add)
- [Framework: React & Vite](https://storybook.js.org/docs/get-started/frameworks/react-vite) — **`@storybook/react-vite`**, **`.storybook/main.ts`**, **`framework: '@storybook/react-vite'`**
- [Upgrading Storybook](https://storybook.js.org/docs/configure/upgrading) — **`pnpm dlx storybook@latest upgrade`** / **`npx storybook@latest upgrade`**, **automigrations**, **`storybook doctor`**
- [CLI](https://storybook.js.org/docs/api/cli-options) — **`upgrade`**, **`automigrate`**, **`--package-manager pnpm`**
- [Writing stories](https://storybook.js.org/docs/writing-stories) — CSF, args, decorators
- [Portable stories (Vitest)](https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest) — **`composeStories`**, **`story.run()`**; optional [**Vitest addon**](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon)
- [Storybook on GitHub](https://github.com/storybookjs/storybook)

Use **`@storybook/react-vite`** for **`apps/web`** (not **`@storybook/nextjs`**). Optional visual review: [Chromatic](https://www.chromatic.com/).

---

## Adoption checklist (when we install)

| Step                | Notes                                                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Init**         | From repo root, prefer **`pnpm`**-aware init or add deps with **`pnpm add -D … --filter @afenda/web`** after reviewing [install](https://storybook.js.org/docs/get-started/install).                                                 |
| **2. Framework**    | Set **`framework: '@storybook/react-vite'`** and **`StorybookConfig`** from **`@storybook/react-vite`** ([framework doc](https://storybook.js.org/docs/get-started/frameworks/react-vite)).                                          |
| **3. Align Vite**   | Reuse or **mirror** important **`vite.config`** concerns (aliases, env, CSS pipeline) so stories match production ([Vite](./vite.md)).                                                                                               |
| **4. Upgrade path** | Later bumps: **`pnpm dlx storybook@latest upgrade`** (or **`npx`**); mono-repos are auto-detected ([upgrading](https://storybook.js.org/docs/configure/upgrading)). Use **`storybook doctor`** if something looks off after upgrade. |

---

## How we will use Storybook

| Topic          | Convention                                                                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Colocation** | **`*.stories.tsx`** next to components **or** **`__stories__/`** — pick **one** pattern per feature ([Components and styling](../COMPONENTS_AND_STYLING.md)).                                     |
| **Data**       | Fixtures or [MSW](./msw.md); **never** production APIs.                                                                                                                                           |
| **CSS**        | Match **`apps/web`** global CSS; when [Tailwind v4](./tailwind-v4.md) / [shadcn/ui](./shadcn-ui.md) land, keep **preview** styles in sync with the app.                                           |
| **Tests**      | Prefer **Vitest** + **`composeStories`** for story-based tests where it helps ([Testing](../TESTING.md), [Vitest](./vitest.md)); optional **addon-vitest** / browser mode when the team wants it. |

---

## Red flags

- **Drifting** Storybook’s Vite config from **`apps/web`** (broken imports, wrong PostCSS/Tailwind, different path aliases).
- **Mixing** Next.js Storybook packages (**`@storybook/nextjs`**) into the **Vite SPA** — use **`@storybook/react-vite`** only.
- **Skipping** **`storybook upgrade` / automigrate** across majors and accumulating unsupported config.

---

## Deeper reference

- **App entry (no Storybook yet):** [`apps/web/src/main.tsx`](../../apps/web/src/main.tsx), [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts).
- **Legacy templates** (not the production app) include example **`.storybook/`** under **`.legacy/`** — treat as **hints only**, not copy-paste truth for **`apps/web`**.

---

## Related documentation

- [Components and styling](../COMPONENTS_AND_STYLING.md)
- [Testing](../TESTING.md)
- [Documentation scope](../DOCUMENTATION_SCOPE.md) — Storybook is **optional** product docs
- [Vite](./vite.md)
- [Vitest](./vitest.md)
- [MSW](./msw.md)
- [Tailwind v4](./tailwind-v4.md)
- [shadcn/ui](./shadcn-ui.md)

**External:** [storybook.js.org](https://storybook.js.org/) · [Storybook GitHub](https://github.com/storybookjs/storybook)

**Context7 library IDs (doc refresh):** `/websites/storybook_js` · `/storybookjs/storybook`
