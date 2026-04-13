# Zod validation guide (Afenda)

This document describes how **Afenda** uses **[Zod](https://zod.dev/)** for **runtime validation** and **TypeScript inference** in **`apps/web`** and, authoritatively, on the API. Zod confirms data shape at boundaries (forms, `fetch` responses, env, server handlers) so invalid data fails fast with structured errors.

**Status:** **Adopted** — **Zod v4** in **`apps/web`** — **`zod` `^4.3.6`** in [`apps/web/package.json`](../../apps/web/package.json) dependencies (lockfile may resolve a newer **4.3.x** patch).

**Official documentation (source of truth for APIs and migration):**

- [zod.dev](https://zod.dev/) — intro, installation, **TypeScript `strict`** requirement (Zod is tested on **TS ≥ 5.5**)
- [Zod v4](https://zod.dev/v4) — overview, performance, **Zod Mini** (`zod/mini`)
- [Zod v4 changelog](https://zod.dev/v4/changelog) — breaking / deprecated APIs vs v3
- [Formatting errors](https://zod.dev/error-formatting) — **`z.flattenError`**, **`z.treeifyError`**, **`z.prettifyError`** (v4 replaces deprecated **`z.formatError`**)
- [Customizing errors](https://zod.dev/error-customization)
- [JSON Schema](https://zod.dev/json-schema) — **`z.toJSONSchema`** / **`z.fromJSONSchema()`** (experimental) for OpenAPI / tooling
- [Ecosystem](https://zod.dev/ecosystem) — form libs, “Zod to X”, etc.
- [llms.txt](https://zod.dev/llms.txt) — machine-oriented doc index
- Source: [github.com/colinhacks/zod](https://github.com/colinhacks/zod)

Prefer **`z.infer<typeof schema>`** (or **`z.output` / `z.input`** where you model transforms) so TypeScript types stay **derived** from the schema, not duplicated.

---

## How we use Zod

| Layer | Role |
| --- | --- |
| **Client (`apps/web`)** | Form and UI boundaries — UX validation, optimistic shapes; pair with [React Hook Form + Zod](./react-hook-form-zod.md) |
| **Server (`apps/api`)** | **Authoritative** validation for security and data integrity — never rely on the client alone for auth or money-moving operations |
| **Shared** | When you introduce shared packages, colocate canonical schemas once and import from both client and server where safe |

| Aspect | Afenda convention |
| --- | --- |
| **Major version** | **v4** APIs — older blog posts may use v3; check [zod.dev](https://zod.dev/) and in-repo [`.agents/skills/zod4/SKILL.md`](../../.agents/skills/zod4/SKILL.md) |
| **Types** | **`type T = z.infer<typeof schema>`** as the single source of truth |
| **HTTP shapes** | Align parsed objects with [API reference](../API.md) request/response bodies where applicable |

---

## Core usage

### `parse` vs `safeParse`

- **`schema.parse(data)`** — returns typed data or throws **`$ZodError`**; use in trusted internal paths where failure should abort.
- **`schema.safeParse(data)`** — returns **`{ success: true, data }`** or **`{ success: false, error }`**; prefer at HTTP/UI boundaries for user-facing errors.

```typescript
import { z } from 'zod/v4';

const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
});

type User = z.infer<typeof userSchema>;

const raw: unknown = JSON.parse('{"id":"…","name":"Ada"}');
const result = userSchema.safeParse(raw);
if (!result.success) {
  // v4: z.flattenError(result.error) for form-shaped maps;
  // z.treeifyError / z.prettifyError / result.error.issues — see [error formatting](https://zod.dev/error-formatting)
} else {
  const user: User = result.data;
}
```

### Cross-field rules

Use **`.refine()`** or **`.superRefine()`** for constraints across fields (e.g. end date ≥ start date). Keep messages actionable for forms ([Design system](../DESIGN_SYSTEM.md) — error copy).

### Zod v4 API notes (prefer in new code)

- **String formats** — v4 introduces top-level helpers such as **`z.email()`**, **`z.uuid()`**, **`z.url()`** (tree-shakable). Chained forms like **`z.string().email()`** still work but are **deprecated**; migrate when touching schemas ([changelog](https://zod.dev/v4/changelog)).
- **Optional bundle** — **`zod/mini`** exposes the same **`parse` / `safeParse` / `parseAsync`** surface for smaller bundles when you intentionally adopt Mini ([Zod v4](https://zod.dev/v4)).
- **JSON Schema** — use **`z.toJSONSchema`** when you need OpenAPI or doc generation; know **`unrepresentable`** types (e.g. **`z.transform`**) and **`z.fromJSONSchema()`** stability ([JSON Schema](https://zod.dev/json-schema)).

---

## Red flags

- Duplicating interfaces **instead of** **`z.infer`** from the canonical schema.
- **Only** client-side validation for sensitive or financial operations.
- Copying **v3** examples without verifying **v4** behavior ([Zod v4](https://zod.dev/v4)).
- Relying on **`z.formatError()`** for new code — prefer **`z.flattenError`** / **`z.treeifyError`** ([formatting errors](https://zod.dev/error-formatting)).

---

## Related documentation

- [React Hook Form + Zod](./react-hook-form-zod.md) — `zodResolver`, form wiring
- [Drizzle ORM](./drizzle-orm.md) — `drizzle-orm/zod` on the server
- [Testing](../TESTING.md) — fixtures and test data
- [API reference](../API.md) — normative HTTP shapes
- [State management](../STATE_MANAGEMENT.md) — forms and server state overview

**External:** [zod.dev](https://zod.dev/) · [Zod on GitHub](https://github.com/colinhacks/zod)

**Context7 (AI doc refresh):** **Zod 4** → **`/websites/zod_dev_v4`** (primary for v4 APIs and changelog). Alternatives: **`/colinhacks/zod`** with version **`/colinhacks/zod/v4.0.1`**, or broad **`/websites/zod_dev`**. Use **`query-docs`** for **migration**, **`z.email()`**, **`safeParse`**, **error formatting**, or **`toJSONSchema`**.
