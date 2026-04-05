# React Hook Form + Zod guide (Afenda)

This document describes how **Afenda** combines **[React Hook Form](https://react-hook-form.com/)** (RHF) with **[Zod](https://zod.dev/)** via **`@hookform/resolvers`** in **`apps/web`**: one schema as the source of truth, accessible field wiring, and alignment with API error shapes.

**Status:** **Adopted** in **`apps/web`** — `react-hook-form`, `@hookform/resolvers`, `zod`.

**Official documentation (source of truth for APIs):**

**React Hook Form**

- [react-hook-form.com](https://react-hook-form.com/)
- [Get started](https://react-hook-form.com/get-started)
- [`useForm`](https://react-hook-form.com/docs/useform) — **`resolver`**, **`mode`** / **`reValidateMode`**, **`defaultValues`**, **`criteriaMode`**
- [`setError`](https://react-hook-form.com/docs/useform/seterror) — server / manual field errors
- [`formState`](https://react-hook-form.com/docs/useform/formstate) — **`errors`**, **`isSubmitting`**, touched / dirty
- [`FormProvider`](https://react-hook-form.com/docs/formprovider) · [`useFormContext`](https://react-hook-form.com/docs/useformcontext) — nested fields without prop drilling
- [`Controller`](https://react-hook-form.com/docs/usecontroller/controller) · [`useController`](https://react-hook-form.com/docs/usecontroller) — controlled components (Radix / shadcn **`FormField`**)

**Resolvers**

- [@hookform/resolvers](https://github.com/react-hook-form/resolvers) — **`zodResolver`** ([README — Zod](https://github.com/react-hook-form/resolvers#zod))
- Import: **`import { zodResolver } from '@hookform/resolvers/zod'`**

**Zod (Afenda)**

- [Zod](./zod.md) — **v4** schemas, **`z.infer`**, transforms

**Source repos:** [react-hook-form](https://github.com/react-hook-form/react-hook-form) · [resolvers](https://github.com/react-hook-form/resolvers)

Broader UX and state patterns: [State management](../STATE_MANAGEMENT.md), [Components and styling](../COMPONENTS_AND_STYLING.md). For labeled primitives and **`FormMessage`**, see [shadcn/ui](./shadcn-ui.md) once UI components exist.

---

## How we use RHF + Zod

| Topic | Convention |
| --- | --- |
| **Resolver** | **`zodResolver(schema)`** from **`@hookform/resolvers/zod`** with **Zod v4** ([Zod](./zod.md)). **`zodResolver`** supports Zod v3 and v4—match the **`zod`** version in **`package.json`**. |
| **Resolver options** | Optional third argument, e.g. **`{ mode: 'sync' }`** or **`{ raw: true }`**, when you need sync validation or pre-transform values—see [resolvers README — Zod](https://github.com/react-hook-form/resolvers#zod) |
| **Schema** | Single Zod object (or discriminated union) — **do not** duplicate rules in RHF **`rules`** |
| **Transforms** | If the schema uses **`.transform()`**, form values may be **input** shape until submit; type the form with **`z.input<typeof schema>`** / **`z.output<typeof schema>`** on **`useForm`** when you need explicit I/O types ([resolvers README — TypeScript](https://github.com/react-hook-form/resolvers#typescript)) |
| **Defaults** | Align **`defaultValues`** with TanStack Query when **editing** existing records ([TanStack Query](./tanstack-query.md)) |
| **Validation timing** | Set **`mode`** / **`reValidateMode`** (`onSubmit`, `onBlur`, `onChange`, …) deliberately—**`onChange`** validates often and can cost performance on large ERP forms ([`useForm` — mode](https://react-hook-form.com/docs/useform#mode)) |
| **Multiple errors** | Use **`criteriaMode: 'all'`** on **`useForm`** if you need every issue per field, not only the first ([`useForm` — criteriaMode](https://react-hook-form.com/docs/useform#criteriaMode)) |
| **Server errors** | Map [API](../API.md) **`VALIDATION_ERROR`** / field errors to **`setError`** on the matching field names ([`setError`](https://react-hook-form.com/docs/useform/seterror)) |
| **Accessibility** | Labels, descriptions, **`aria-invalid`**, and error text associated with inputs ([Design system](../DESIGN_SYSTEM.md)) |

---

## Mental model

```
useForm({ resolver: zodResolver(schema), defaultValues, mode, ... })
  → form.control, form.handleSubmit, form.formState
  → Field components connect via control + name (or register)
  → Zod runs via resolver on submit and per mode / reValidateMode
```

For shadcn **Form** composition (`FormField`, `FormItem`, `FormMessage`), use the pattern in [shadcn/ui — Forms](./shadcn-ui.md#forms).

---

## Minimal example (Vite client)

No Server Actions — submit via **`fetch`** or your API client; server must still validate.

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  email: z.email(),
});

type FormValues = z.infer<typeof schema>;

export function useIssueForm() {
  return useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', email: '' },
  });
}
```

---

## Red flags

- **Duplicating** Zod and RHF validation rules in two places.
- Submitting **sensitive** operations with **only** client-side validation ([API](../API.md)).
- Ignoring **server-returned** field errors — surface them with **`setError`** for parity with Zod messages.

---

## Related documentation

- [Zod](./zod.md) — parsing, v4, shared schemas
- [TanStack Query](./tanstack-query.md) — loading defaults, mutations
- [shadcn/ui](./shadcn-ui.md) — Form primitives, Sonner toasts, dense ERP examples
- [Components and styling](../COMPONENTS_AND_STYLING.md)
- [API reference](../API.md) — error contracts

**External:** [react-hook-form.com](https://react-hook-form.com/) · [resolvers monorepo](https://github.com/react-hook-form/resolvers)

**Context7 (AI doc refresh):** **`React Hook Form`** → **`/websites/react-hook-form`** or **`/react-hook-form/documentation`**; **resolvers** → **`/react-hook-form/resolvers`**. Then **`query-docs`** for **`zodResolver`**, **`useForm`** options, or **`setError`**.
