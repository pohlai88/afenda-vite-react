---
title: shadcn/ui
description: Radix-based copy-in components, `components.json`, and theming.
category: web-client
status: Adopted
order: 20
---

# shadcn/ui components guide (Afenda / Vite)

Primary standard now lives in `docs/COMPONENTS_AND_STYLING.md`.
Use this dependency page as ecosystem/reference context and keep implementation rules centralized in:

- `docs/COMPONENTS_AND_STYLING.md`
- `docs/APP_SHELL_SPEC.md`
- `docs/TAILWIND_SHADCN_MIGRATION_PLAN.md`

This document describes how **Afenda** intends to use **[shadcn/ui](https://ui.shadcn.com)**—reusable, accessible components built on **[Radix UI](https://www.radix-ui.com/)** primitives and styled with **[Tailwind CSS](https://tailwindcss.com/)**—inside **`apps/web`** (Vite + React, **not** Next.js).

**Status:** Adopted for `apps/web`. Use [Components and styling](../COMPONENTS_AND_STYLING.md) as the canonical ruleset, and this page for dependency-level references.

**Official documentation (source of truth for CLI and defaults):**

- [Installation — Vite](https://ui.shadcn.com/docs/installation/vite) — Tailwind v4 + `@tailwindcss/vite`, `tsconfig` / `vite.config` aliases, `npx shadcn@latest init`, monorepo `-c apps/web`
- [components.json](https://ui.shadcn.com/docs/components-json) — schema, `rsc`, `tailwind.cssVariables`, **Tailwind v4 `tailwind.config` blank**, optional **registries**
- [JSON Schema](https://ui.shadcn.com/schema.json) — machine-readable `components.json` shape (e.g. allowed `baseColor` values)
- [Components](https://ui.shadcn.com/docs/components) — copy/paste or `npx shadcn@latest add <name>`

Optional: **[shadcn/create](https://ui.shadcn.com/create?template=vite)** builds a preset and emits `npx shadcn@latest init --preset … --template vite` (per upstream docs).

---

## How we use shadcn/ui

Afenda follows the **copy/paste** model: components are **not** a black-box dependency; they live in the repo under **`apps/web/src/share/`** (e.g. **`share/components/ui/`**) per [Project structure](../PROJECT_STRUCTURE.md)—not at `src/` root, which is **topology-locked**—so you can customize, extend, and compose for ERP screens (dense tables, filters, wizards). After adding **`share/components/`**, extend **`workspaceGovernance.webClientSrc.requiredShareSubdirectories`** in **`scripts/afenda.config.json`** if that folder must always exist.

### Compared to a default shadcn init

| Aspect            | Typical CLI default | Afenda convention                                                                                                  |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Runtime**       | Next.js App Router  | **Vite SPA** — no React Server Components; no `'use client'`                                                       |
| **Location**      | `components/ui/`    | **`apps/web/src/share/components/ui/`** (shared client UI)                                                         |
| **Alias**         | `@/components/ui`   | Prefer **`@/share/components/ui`** (or add a `vite` / `tsconfig` alias that resolves to `src/share/components/ui`) |
| **`cn()`**        | `@/lib/utils`       | **`@/share/utils/cn`** (or `share/lib/utils.ts`) — **not** `src/lib/`                                              |
| **Global CSS**    | `app/globals.css`   | **`src/index.css`** (or your single entry stylesheet)                                                              |
| **Barrel export** | Often omitted       | Optional **`index.ts`** for stable import paths                                                                    |

You can use **`npx shadcn@latest add <name>`** once **`components.json`** exists under **`apps/web/`**, or copy from [shadcn docs](https://ui.shadcn.com/docs/components) and fix imports manually.

Per [components.json](https://ui.shadcn.com/docs/components-json), this file is **only required for the CLI**; **copy/paste** installs do not need it.

**Monorepo (Afenda):** from the repo root you can target the web app (matches [Vite installation](https://ui.shadcn.com/docs/installation/vite)):

```bash
npx shadcn@latest add button -c apps/web
```

New greenfield setups may use **`npx shadcn@latest init -t vite --monorepo`**; align the generated tree with **`apps/web`** conventions below.

---

## Configuration

### `components.json` (illustrative — under `apps/web/`)

Adjust paths after you add Tailwind and pick a CSS entry file. For a **Vite** app, set **`rsc`** to **`false`**.

For **Tailwind CSS v4**, upstream documents leaving **`tailwind.config` empty** (CSS-first setup); use your real CSS path for **`tailwind.css`**. Validate **`baseColor`** and other enums against [`schema.json`](https://ui.shadcn.com/schema.json) — values evolve with the CLI.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Tailwind **v4** uses **`@import "tailwindcss"`** in the CSS entry (see [Installation — Vite](https://ui.shadcn.com/docs/installation/vite) and [Tailwind CSS v4](./tailwind-v4.md)). You may still add a minimal **`tailwind.config.ts`** if tooling expects it—see [Components and styling](../COMPONENTS_AND_STYLING.md).

### Optional: registries

The official **`registries`** field lets the CLI pull components from **namespaced** sources (public or private, with env-based headers). See [components.json — registries](https://ui.shadcn.com/docs/components-json#registries). Use this when the team standardizes on a shared registry; default Afenda work can stay on the stock CLI and copy/paste flow.

### Utility — `cn()`

Components should use **`cn()`** from **`@/lib/utils`**, combining [`clsx`](https://github.com/lukeed/clsx) and [`tailwind-merge`](https://github.com/dcastil/tailwind-merge):

```typescript
import { cn } from '@/lib/utils'

cn('px-4 py-2', 'px-6') // → 'py-2 px-6' (last conflicting class wins)
```

Add `clsx` and `tailwind-merge` when you introduce this helper.

---

## Component inventory (reference)

Exact filenames follow shadcn; versions drift with upstream. Grouping matches common docs.

### Radix-backed (typical shadcn patterns)

| Component     | Radix / deps                                           | Typical file        |
| ------------- | ------------------------------------------------------ | ------------------- |
| Avatar        | `@radix-ui/react-avatar`                               | `avatar.tsx`        |
| Checkbox      | `@radix-ui/react-checkbox`                             | `checkbox.tsx`      |
| Dialog        | `@radix-ui/react-dialog`                               | `dialog.tsx`        |
| Dropdown menu | `@radix-ui/react-dropdown-menu`                        | `dropdown-menu.tsx` |
| Form          | RHF + `@radix-ui/react-label` + `@radix-ui/react-slot` | `form.tsx`          |
| Hover card    | `@radix-ui/react-hover-card`                           | `hover-card.tsx`    |
| Label         | `@radix-ui/react-label`                                | `label.tsx`         |
| Popover       | `@radix-ui/react-popover`                              | `popover.tsx`       |
| Progress      | `@radix-ui/react-progress`                             | `progress.tsx`      |
| Radio group   | `@radix-ui/react-radio-group`                          | `radio-group.tsx`   |
| Scroll area   | `@radix-ui/react-scroll-area`                          | `scroll-area.tsx`   |
| Select        | `@radix-ui/react-select`                               | `select.tsx`        |
| Separator     | `@radix-ui/react-separator`                            | `separator.tsx`     |
| Sheet         | `@radix-ui/react-dialog`                               | `sheet.tsx`         |
| Slider        | `@radix-ui/react-slider`                               | `slider.tsx`        |
| Switch        | `@radix-ui/react-switch`                               | `switch.tsx`        |
| Tabs          | `@radix-ui/react-tabs`                                 | `tabs.tsx`          |
| Tooltip       | `@radix-ui/react-tooltip`                              | `tooltip.tsx`       |

### Non-Radix primitives (common shadcn style)

| Component | Role                    | Typical file   |
| --------- | ----------------------- | -------------- |
| Alert     | Status / inline message | `alert.tsx`    |
| Badge     | Tags, status chips      | `badge.tsx`    |
| Button    | Primary actions         | `button.tsx`   |
| Card      | Surfaces                | `card.tsx`     |
| Input     | Text                    | `input.tsx`    |
| Skeleton  | Loading                 | `skeleton.tsx` |
| Table     | Tabular data            | `table.tsx`    |
| Textarea  | Multiline               | `textarea.tsx` |

### Toasts / notifications

**[Sonner](https://sonner.emilkowal.ski/)** pairs well with shadcn-style apps:

- Add **`sonner.tsx`** (or the shadcn toaster wrapper) and mount **`<Toaster />`** once near the root layout (e.g. in `App.tsx` or your shell).
- Prefer **`import { toast } from 'sonner'`** for new code.

```typescript
import { toast } from 'sonner'

toast.success('Saved successfully')
toast.error('Something went wrong', { description: 'Please try again.' })
```

If you introduce a thin **`useToast`** compatibility layer, keep it in **`@/components/ui`** and document the preferred Sonner API here.

### Domain-specific Afenda components (build as needed)

Place **ERP-specific** building blocks next to features or under **`@/components`** (not necessarily inside `ui/`), still using **`cn()`**, tokens, and primitives:

| Pattern    | Examples                                                                     |
| ---------- | ---------------------------------------------------------------------------- |
| **Layout** | Page header with breadcrumbs, filter toolbar, split detail layout            |
| **Data**   | KPI stat card, trend indicator, document status badge, empty state for lists |
| **Forms**  | Wizard step indicator, posting period selector, approval chain display       |

Reuse names from your product vocabulary ([Glossary](../GLOSSARY.md)); avoid copying unrelated SaaS-only widgets into `ui/` unless you truly need them.

---

## Forms

Use **React Hook Form** with **Zod** (`@hookform/resolvers`) and the shadcn **Form** primitives for labels, descriptions, and **`FormMessage`**.

### Mental model

```
<Form {...form}>                 ← FormProvider
  <FormField name="…"            ← Controller
    render={({ field }) => (
      <FormItem>
        <FormLabel />
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormDescription />      ← optional
        <FormMessage />          ← Zod / RHF errors
      </FormItem>
    )}
  />
</Form>
```

### Example (Vite — no Server Actions)

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email(),
});

type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = async (data: FormValues) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/...`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) toast.success('Saved!');
    else toast.error('Failed to save');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
```

Optional helpers for **API-level** errors (outside field Zod): small **`FormGlobalError`** / field error components are fine—keep them in `@/components` or `ui/` consistently.

---

## Custom `Button` variants

Extend the shadcn **Button** with **[CVA](https://cva.style/docs)** (`class-variance-authority`). Map variants to **semantic tokens** from the design system (e.g. `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`). Add **module-specific** variants only when they share real reuse (e.g. a documented “accent” for approvals)—avoid one-off purple/amber buttons that fight [Brand guidelines](../BRAND_GUIDELINES.md).

---

## Theming

### CSS variables

Define **HSL** (or project-approved) components in **`src/index.css`** so **`.dark`** can swap surfaces:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 245 58% 52%;
  /* align with Design system + Brand guidelines */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Semantic classes in JSX

```tsx
// Prefer — tokens track light/dark
<div className="bg-background text-foreground border-border" />
<Button className="bg-primary text-primary-foreground">Save</Button>

// Avoid — hardcoded neutrals break theming
<div className="bg-white text-black border-gray-200" />
```

---

## Adding a component

### A — From shadcn docs

1. Open [ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components).
2. Copy the component into **`apps/web/src/components/ui/<name>.tsx`**.
3. Fix imports to **`@/lib/utils`** and **`@/components/ui/...`**.
4. Export from **`components/ui/index.ts`** if you use a barrel.

### B — CLI

From **`apps/web`** (with `components.json` present):

```bash
npx shadcn@latest add <component-name>
```

From the **monorepo root**, pass **`-c apps/web`** so files land in the Vite package (per [Vite installation](https://ui.shadcn.com/docs/installation/vite)).

Verify output paths match **`src/components/ui`** (or your **`aliases.ui`**).

### C — Custom primitive

Follow shadcn conventions:

1. **`forwardRef`** when wrapping DOM elements.
2. **`cn()`** for `className` merging.
3. **Semantic** colors via CSS variables.
4. **`displayName`** for DevTools.

```tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

const MyComponent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-md border bg-card p-4 text-card-foreground',
      className,
    )}
    {...props}
  />
))
MyComponent.displayName = 'MyComponent'

export { MyComponent }
```

No **`'use client'`** directive is required in Vite (everything is client-rendered unless you introduce a future SSR layer).

---

## Barrel exports

If you maintain **`apps/web/src/components/ui/index.ts`**, prefer imports from the barrel for app code:

```typescript
import { Button, Card, CardContent, Form, Input } from '@/components/ui'
```

Direct file imports are acceptable for tree-shaking clarity in large apps—pick one convention per area.

---

## Related documentation

- [Components and styling](../COMPONENTS_AND_STYLING.md) — colocation, Tailwind v4 notes, anti-patterns
- [Design system](../DESIGN_SYSTEM.md) — tokens, typography, accessibility
- [Project structure](../PROJECT_STRUCTURE.md) — `features/*` vs shared components
- [State management](../STATE_MANAGEMENT.md) — RHF + Zod overview
- [Performance](../PERFORMANCE.md) — lists and bundle size
