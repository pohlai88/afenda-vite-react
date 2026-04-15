---
title: Tailwind CSS v4
description: CSS-first utility framework baseline for the web client.
category: web-client
status: Adopted
order: 19
---

# Tailwind CSS v4 guide (Afenda / Vite)

Primary standard now lives in `docs/COMPONENTS_AND_STYLING.md`.
Use this dependency page as ecosystem/reference context and keep implementation rules centralized in:

- `docs/COMPONENTS_AND_STYLING.md`
- `docs/APP_SHELL_SPEC.md`
- `docs/TAILWIND_SHADCN_MIGRATION_PLAN.md`

This document describes how **Afenda** plans to adopt **[Tailwind CSS v4](https://tailwindcss.com/)** in **`apps/web`** (Vite + React): **CSS-first** configuration, the **`@tailwindcss/vite`** plugin (recommended for Vite over the legacy PostCSS-only v3 shape), and alignment with [Design system](../DESIGN_SYSTEM.md), [Brand guidelines](../BRAND_GUIDELINES.md), and [shadcn/ui](./shadcn-ui.md).

**Status:** **Adopted** for **`apps/web`**. Canonical implementation and policy live in [Components and styling](../COMPONENTS_AND_STYLING.md), with app-shell specifics in [APP_SHELL_SPEC.md](../APP_SHELL_SPEC.md).

**Official documentation:**

- [Installation](https://tailwindcss.com/docs/installation) — overview
- [Using Vite](https://tailwindcss.com/docs/installation/using-vite) — **`tailwindcss`**, **`@tailwindcss/vite`**, **`@import "tailwindcss"`**, **`tailwindcss()`** in Vite
- [Framework guide: Vite](https://tailwindcss.com/docs/installation/framework-guides/vite) — step-by-step for Vite projects
- [Upgrade guide](https://tailwindcss.com/docs/upgrade-guide) — v3 → v4, **`npx @tailwindcss/upgrade`** (Node **20+**), **`@tailwindcss/postcss`** if you use PostCSS instead of the Vite plugin
- [Theme variables](https://tailwindcss.com/docs/theme) — **`@theme { ... }`** design tokens
- [Detecting classes in source files](https://tailwindcss.com/docs/detecting-classes-in-source-files) — automatic scanning, **`@source`** for extra paths (e.g. **`node_modules`** UI packages, monorepo **`packages/*`**)
- [Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles) — **`@theme`**, layers, compatibility
- [Functions and directives](https://tailwindcss.com/docs/functions-and-directives) — **`@import`**, **`@source`**, **`@theme`**, **`@layer`**
- Source: [github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss)

**Cross-stack:** [shadcn/ui — Vite](https://ui.shadcn.com/docs/installation/vite) uses the same Tailwind v4 baseline (**`tailwindcss`**, **`@tailwindcss/vite`**, **`@import "tailwindcss"`** in CSS) before **`npx shadcn@latest init`**.

---

## Target stack (when adopted)

| Package / tool             | Role                                                                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **`tailwindcss`**          | Framework (v4)                                                                                                                          |
| **`@tailwindcss/vite`**    | Vite integration — prefer this in **`apps/web`** ([upgrade guide](https://tailwindcss.com/docs/upgrade-guide) vs old v3 PostCSS plugin) |
| **`@tailwindcss/postcss`** | Only if you intentionally wire Tailwind through **PostCSS** instead of **`@tailwindcss/vite`**                                          |
| **CSS entry**              | **`@import "tailwindcss";`** in **`src/index.css`** (replaces v3 **`@tailwind`** directives)                                            |

---

## How we will use Tailwind

| Goal          | Convention                                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tokens**    | Map design tokens to **CSS variables** and **`@theme`** — avoid ad hoc hex in JSX ([Design system](../DESIGN_SYSTEM.md))                                                        |
| **Density**   | ERP screens favor readable, consistent spacing; prefer tokens over one-off arbitrary values unless documented                                                                   |
| **shadcn/ui** | After Tailwind builds cleanly in dev and production, add components per [shadcn/ui](./shadcn-ui.md) — **`cn()`**, **`components.json`**, semantic color variables               |
| **Dark mode** | Class or media strategy should match the design system; shadcn themes expect **`.dark`** + CSS variables ([shadcn/ui](./shadcn-ui.md) theming section)                          |
| **Monorepo**  | If utilities appear only under **`packages/*`**, register scans with **`@source`** in CSS ([detecting classes](https://tailwindcss.com/docs/detecting-classes-in-source-files)) |

---

## Adoption checklist (check versions on install)

| Step                | Notes                                                                                                                                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Packages**     | e.g. **`pnpm add -D tailwindcss @tailwindcss/vite --filter @afenda/web`** — pin versions per lockfile policy ([pnpm](./pnpm.md))                                                                                                                                                            |
| **2. Vite**         | Add **`import tailwindcss from '@tailwindcss/vite'`** and **`tailwindcss()`** to **`plugins`** in [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts) alongside **`@vitejs/plugin-react`** and existing plugins ([Using Vite](https://tailwindcss.com/docs/installation/using-vite)) |
| **3. CSS entry**    | Add **`@import "tailwindcss";`** to [`apps/web/src/index.css`](../../apps/web/src/index.css) (typically **above** or integrated with existing **`:root`** rules — validate cascade)                                                                                                         |
| **4. v3 migration** | If you ever import a v3 config, run **`npx @tailwindcss/upgrade`** on a branch and review the diff ([upgrade guide](https://tailwindcss.com/docs/upgrade-guide))                                                                                                                            |
| **5. PostCSS**      | **`apps/web/postcss.config.js`** exists for future plugins; **`@tailwindcss/vite`** is still the primary Tailwind path for this app unless you choose PostCSS explicitly                                                                                                                    |

### Minimal plugin shape (illustrative)

Upstream pattern — **merge** into the real config (keep **`react()`**, Tailwind, React Compiler Babel options, etc.):

```typescript
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

This repo **already** defines the **`@`** alias in **`vite.config.ts`** (same **`path`** import style); you only need the **`tailwindcss`** import and **`tailwindcss()`** plugin when you adopt.

---

## CSS tokens (`@theme`)

v4 encourages defining design tokens in CSS with **`@theme`**, which generates matching utilities ([theme docs](https://tailwindcss.com/docs/theme)):

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", sans-serif;
  --color-mint-500: oklch(0.72 0.11 178);
}
```

Use **`@source`** when Tailwind must scan paths outside the default heuristics ([functions and directives](https://tailwindcss.com/docs/functions-and-directives)).

---

## shadcn/ui

shadcn expects Tailwind utilities and a working CSS pipeline. After Tailwind v4 is verified in dev/build, follow **[shadcn/ui](./shadcn-ui.md)** for **`components.json`**, **`rsc: false`**, and **`tailwind.config` empty** for v4 per [components.json](https://ui.shadcn.com/docs/components-json).

---

## Red flags

- Following **v3-only** tutorials (**`@tailwind base`**, old **`tailwind.config.js`** content) without reconciling with **v4** CSS-first setup ([upgrade guide](https://tailwindcss.com/docs/upgrade-guide)).
- **Disabling** focus rings or contrast for visual shortcuts ([wcag-contrast](./wcag-contrast.md), [Design system](../DESIGN_SYSTEM.md)).
- **Forgetting** **`@source`** when classes only exist in shared **`packages/*`** or vendored component libraries.

---

## Deeper reference

- Vite app: [`apps/web/vite.config.ts`](../../apps/web/vite.config.ts), [`apps/web/postcss.config.js`](../../apps/web/postcss.config.js), [`apps/web/src/index.css`](../../apps/web/src/index.css).
- Skill (optional): [shadcn](../../.agents/skills/shadcn/SKILL.md) for shadcn/ui + Tailwind wiring in this repo.

---

## Related documentation

- [shadcn/ui](./shadcn-ui.md) — components, **`cn()`**, theming
- [Components and styling](../COMPONENTS_AND_STYLING.md) — React patterns, Tailwind direction
- [Design system](../DESIGN_SYSTEM.md) — tokens, typography, accessibility
- [Brand guidelines](../BRAND_GUIDELINES.md) — palette and usage
- [Vite](./vite.md) — dev server, build, env
- [pnpm](./pnpm.md) — **`--filter @afenda/web`**

**External:** [tailwindcss.com/docs](https://tailwindcss.com/docs/installation) · [Tailwind CSS GitHub](https://github.com/tailwindlabs/tailwindcss)

**Context7 library IDs (doc refresh):** `/websites/tailwindcss` · `/tailwindlabs/tailwindcss.com`
