# AFENDA Hono Monorepo Pack

## Repository layout

```text
.
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
├─ turbo.json
├─ .gitignore
├─ apps/
│  ├─ api/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ app.ts
│  │     ├─ lib/
│  │     │  ├─ env.ts
│  │     │  ├─ errors.ts
│  │     │  └─ response.ts
│  │     ├─ middleware/
│  │     │  ├─ error-handler.ts
│  │     │  └─ request-id.ts
│  │     ├─ routes/
│  │     │  ├─ auth.ts
│  │     │  ├─ health.ts
│  │     │  └─ users.ts
│  │     └─ modules/
│  │        └─ users/
│  │           ├─ user.repo.ts
│  │           ├─ user.schema.ts
│  │           └─ user.service.ts
│  └─ web/
│     ├─ package.json
│     ├─ tsconfig.json
│     ├─ vite.config.ts
│     ├─ index.html
│     └─ src/
│        ├─ main.tsx
│        ├─ App.tsx
│        ├─ api/
│        │  └─ client.ts
│        └─ features/
│           └─ users/
│              ├─ users.api.ts
│              └─ users.view.tsx
└─ packages/
   └─ config/
      └─ eslint/   # reserved for later
```

---

## Root `package.json`

```json
{
  "name": "afenda-hono-monorepo",
  "private": true,
  "packageManager": "pnpm@10.0.0",
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^2.5.0",
    "typescript": "^5.8.3"
  }
}
```

## `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

## `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "sourceMap": true,
    "baseUrl": "."
  }
}
```

## `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

## `.gitignore`

```gitignore
node_modules
.pnpm-store
.turbo
.dist
.vite
dist
coverage
.env
.env.*
!.env.example
```

---

# `apps/api`

## `apps/api/package.json`

```json
{
  "name": "@afenda/api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@hono/node-server": "^1.14.0",
    "@hono/zod-validator": "^0.5.0",
    "hono": "^4.7.7",
    "zod": "^3.24.3"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "tsx": "^4.19.3",
    "typescript": "^5.8.3"
  }
}
```

## `apps/api/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["ES2022", "DOM"],
    "types": ["node"]
  },
  "include": ["src"]
}
```

## `apps/api/src/lib/env.ts`

```ts
/**
 * Environment contract.
 * - one place for runtime config
 * - fail fast at boot
 * - no ad hoc process.env reads elsewhere
 */

import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
})

export type AppEnvConfig = z.infer<typeof envSchema>

export const env: AppEnvConfig = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  WEB_ORIGIN: process.env.WEB_ORIGIN,
})
```

## `apps/api/src/lib/errors.ts`

```ts
/**
 * Canonical application errors.
 * - stable machine codes
 * - transport-neutral domain failures
 */

export type AppErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_SERVER_ERROR"

export class AppError extends Error {
  public readonly code: AppErrorCode
  public readonly status: number
  public readonly details?: unknown

  constructor(input: {
    code: AppErrorCode
    message: string
    status: number
    details?: unknown
  }) {
    super(input.message)
    this.name = "AppError"
    this.code = input.code
    this.status = input.status
    this.details = input.details
  }
}

export function badRequest(message: string, details?: unknown) {
  return new AppError({ code: "BAD_REQUEST", message, status: 400, details })
}

export function notFound(message: string, details?: unknown) {
  return new AppError({ code: "NOT_FOUND", message, status: 404, details })
}

export function conflict(message: string, details?: unknown) {
  return new AppError({ code: "CONFLICT", message, status: 409, details })
}
```

## `apps/api/src/lib/response.ts`

```ts
/**
 * Canonical response envelopes.
 * - predictable frontend contract
 * - stable top-level shape
 */

export type SuccessEnvelope<T> = {
  ok: true
  data: T
  meta?: Record<string, unknown>
}

export type ErrorEnvelope = {
  ok: false
  error: {
    code: string
    message: string
    details?: unknown
    requestId?: string
  }
}

export function success<T>(
  data: T,
  meta?: Record<string, unknown>
): SuccessEnvelope<T> {
  return meta ? { ok: true, data, meta } : { ok: true, data }
}

export function failure(input: {
  code: string
  message: string
  details?: unknown
  requestId?: string
}): ErrorEnvelope {
  return {
    ok: false,
    error: {
      code: input.code,
      message: input.message,
      details: input.details,
      requestId: input.requestId,
    },
  }
}
```

## `apps/api/src/middleware/request-id.ts`

```ts
/**
 * Request identity middleware.
 * - stable request correlation
 * - propagate x-request-id header
 */

import type { MiddlewareHandler } from "hono"

export const requestIdMiddleware: MiddlewareHandler = async (c, next) => {
  const incoming = c.req.header("x-request-id")
  const requestId =
    incoming && incoming.trim().length > 0 ? incoming : crypto.randomUUID()

  c.set("requestId", requestId)
  c.header("x-request-id", requestId)

  await next()
}
```

## `apps/api/src/middleware/error-handler.ts`

```ts
/**
 * Transport error mapping.
 * - app errors keep their status/code
 * - unknown errors become 500
 */

import type { Context } from "hono"
import { ZodError } from "zod"

import { AppError } from "../lib/errors.js"
import { failure } from "../lib/response.js"

export function onError(error: Error, c: Context) {
  const requestId = c.get("requestId")

  if (error instanceof AppError) {
    return c.json(
      failure({
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
      }),
      error.status
    )
  }

  if (error instanceof ZodError) {
    return c.json(
      failure({
        code: "BAD_REQUEST",
        message: "Request validation failed.",
        details: error.flatten(),
        requestId,
      }),
      400
    )
  }

  console.error("[api] unhandled error", error)

  return c.json(
    failure({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
      requestId,
    }),
    500
  )
}

export function onNotFound(c: Context) {
  return c.json(
    failure({
      code: "NOT_FOUND",
      message: `Route not found: ${c.req.method} ${c.req.path}`,
      requestId: c.get("requestId"),
    }),
    404
  )
}
```

## `apps/api/src/modules/users/user.schema.ts`

```ts
/**
 * User contract.
 * - transport and service boundary schema
 * - single source of truth for input/output
 */

import { z } from "zod"

export const userIdSchema = z.string().uuid()

export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  name: z.string().min(1).max(120),
})

export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
})

export type User = z.infer<typeof userSchema>
export type CreateUserInput = z.infer<typeof createUserInputSchema>
```

## `apps/api/src/modules/users/user.repo.ts`

```ts
/**
 * User repository.
 * - current baseline: in-memory
 * - later swap to Drizzle/Postgres without route changes
 */

import type { CreateUserInput, User } from "./user.schema.js"

const users = new Map<string, User>()

export async function findAllUsers(): Promise<User[]> {
  return Array.from(users.values())
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const target = email.trim().toLowerCase()
  for (const user of users.values()) {
    if (user.email.toLowerCase() === target) return user
  }
  return null
}

export async function insertUser(input: CreateUserInput): Promise<User> {
  const user: User = {
    id: crypto.randomUUID(),
    email: input.email,
    name: input.name,
  }

  users.set(user.id, user)
  return user
}
```

## `apps/api/src/modules/users/user.service.ts`

```ts
/**
 * User service.
 * - business rules live here
 * - routes remain thin transport adapters
 */

import { conflict } from "../../lib/errors.js"
import type { CreateUserInput, User } from "./user.schema.js"
import { findAllUsers, findUserByEmail, insertUser } from "./user.repo.js"

export async function listUsers(): Promise<User[]> {
  return findAllUsers()
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const existing = await findUserByEmail(input.email)
  if (existing) {
    throw conflict("A user with this email already exists.", {
      email: input.email,
    })
  }

  return insertUser(input)
}
```

## `apps/api/src/routes/health.ts`

```ts
/**
 * Health routes.
 * - cheap readiness/liveness surface
 */

import { Hono } from "hono"
import { success } from "../lib/response.js"

export const healthRoutes = new Hono()

healthRoutes.get("/", (c) => {
  return c.json(
    success({
      service: "@afenda/api",
      status: "ok",
      now: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    })
  )
})
```

## `apps/api/src/routes/auth.ts`

```ts
/**
 * Auth placeholder routes.
 * - reserve auth boundary now
 * - wire Better Auth or session engine later
 */

import { Hono } from "hono"
import { success } from "../lib/response.js"

export const authRoutes = new Hono()

authRoutes.get("/session", (c) => {
  return c.json(
    success({
      authenticated: false,
      user: null,
    })
  )
})
```

## `apps/api/src/routes/users.ts`

```ts
/**
 * User routes.
 * - thin edge layer
 * - validation at transport boundary
 * - service owns business behavior
 */

import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"

import { success } from "../lib/response.js"
import { createUser, listUsers } from "../modules/users/user.service.js"
import { createUserInputSchema } from "../modules/users/user.schema.js"

export const userRoutes = new Hono()

userRoutes.get("/", async (c) => {
  const users = await listUsers()
  return c.json(success(users))
})

userRoutes.post("/", zValidator("json", createUserInputSchema), async (c) => {
  const input = c.req.valid("json")
  const user = await createUser(input)
  return c.json(success(user), 201)
})
```

## `apps/api/src/app.ts`

```ts
/**
 * Canonical Hono app composition.
 * - Hono owns HTTP concerns
 * - route trees mounted once
 * - shared typed contract exported to frontend
 */

import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { bodyLimit } from "hono/body-limit"

import { env } from "./lib/env.js"
import { failure } from "./lib/response.js"
import { onError, onNotFound } from "./middleware/error-handler.js"
import { requestIdMiddleware } from "./middleware/request-id.js"
import { authRoutes } from "./routes/auth.js"
import { healthRoutes } from "./routes/health.js"
import { userRoutes } from "./routes/users.js"

export type AppVariables = {
  requestId: string
}

export type ApiEnv = {
  Variables: AppVariables
}

export function createApp() {
  const app = new Hono<ApiEnv>()

  app.onError(onError)
  app.notFound(onNotFound)

  app.use("*", requestIdMiddleware)
  app.use("*", logger())
  app.use("*", secureHeaders())

  app.use(
    "/api/*",
    cors({
      origin: env.WEB_ORIGIN,
      allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      exposeHeaders: ["X-Request-Id"],
      credentials: true,
      maxAge: 86400,
    })
  )

  app.use(
    "/api/*",
    bodyLimit({
      maxSize: 2 * 1024 * 1024,
      onError: (c) =>
        c.json(
          failure({
            code: "BAD_REQUEST",
            message: "Request body exceeds the configured limit.",
            requestId: c.get("requestId"),
          }),
          413
        ),
    })
  )

  app.get("/", (c) =>
    c.json({
      ok: true,
      data: {
        service: "@afenda/api",
        runtime: "node",
        version: "0.1.0",
      },
    })
  )

  app.route("/health", healthRoutes)
  app.route("/api/auth", authRoutes)
  app.route("/api/users", userRoutes)

  return app
}

export type AppType = ReturnType<typeof createApp>
```

## `apps/api/src/index.ts`

```ts
/**
 * Node runtime entrypoint.
 * - boots the Hono fetch app via node adapter
 * - graceful shutdown included
 */

import { serve } from "@hono/node-server"
import { createApp } from "./app.js"
import { env } from "./lib/env.js"

const app = createApp()

const server = serve({
  fetch: app.fetch,
  port: env.PORT,
})

console.log(`[api] listening on http://localhost:${env.PORT}`)

function shutdown(signal: string) {
  console.log(`[api] ${signal} received; shutting down`)
  server.close((error) => {
    if (error) {
      console.error("[api] shutdown failure", error)
      process.exit(1)
    }
    process.exit(0)
  })
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
```

---

# `apps/web`

## `apps/web/package.json`

```json
{
  "name": "@afenda/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.json && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "hono": "^4.7.7",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "typescript": "^5.8.3",
    "vite": "^6.3.5"
  }
}
```

## `apps/web` TypeScript (solution layout)

Afenda splits the Vite app into a **solution** `tsconfig.json` (project references) plus **`tsconfig.app.json`** (app + `src`) and **`tsconfig.node.json`** (`vite.config.ts`). That matches Vite’s recommended split and keeps `composite` builds working with `tsc -b` and the `@afenda/api` reference.

### `apps/web/tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### `apps/web/tsconfig.app.json`

Extends `@afenda/tsconfig/react-app.json` (already sets `jsx: "react-jsx"` and `lib: ["ES2022", "DOM", "DOM.Iterable"]`). Includes `src`, references `../api` for typed RPC, and adds path alias `@/*`, Vitest/testing types, etc.

### `apps/web/tsconfig.node.json`

Extends `@afenda/tsconfig/node.json` and includes `vite.config.ts`.

**Minimal single-file alternative** (standalone repos only): one `tsconfig.json` extending a shared base, `"include": ["src", "vite.config.ts"]`, and `"types": ["vite/client"]` — Afenda does **not** use `../../tsconfig.base.json`; use the package **`@afenda/tsconfig`** instead.

## `apps/web/vite.config.ts`

The canonical file is **`apps/web/vite.config.ts`** (not the minimal stub below). It:

- Sets **`root`** to the app directory and **`envDir`** to the **monorepo root** so `.env` lives in one place.
- Uses **`@tailwindcss/vite`**, **`@vitejs/plugin-react`** (with React Compiler / Babel), **`injectViteBaseForThemeScript`**, optional **bundle visualizer** in `analyze` mode, and **Vite DevTools** in dev.
- Configures **`server.port`** (default **5173**, overridable via `VITE_PORT`), **`server.proxy`** for **`/api`** → Hono on **`http://localhost:8787`** (or `VITE_API_URL`), plus Better Auth / agent-discovery paths.
- Defines many **`import.meta.env.VITE_*`** mirrors for auth and feature flags; **`resolve.alias`** for `@/` → `src/`.
- Integrates **Vitest** via **`@afenda/vitest-config`** defaults, **`jsdom`**, and **`vitest.setup.ts`**.

**Minimal standalone example** (greenfield only — not what Afenda ships):

```ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
})
```

## `apps/web/index.html`

Canonical: **`apps/web/index.html`**. Afenda keeps the same shell as a minimal Vite app (`#root`, `/src/main.tsx`) but adds:

- Favicon, **`theme-color`**, title **Afenda**
- Inline **blocking script** for theme / density / motion (aligned with `BASE_URL` via `__VITE_RESOLVED_BASE_JSON__` from Vite)

**Minimal greenfield** (no theme script):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Afenda</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## `apps/web/src/api-client/client.ts`

Typed Hono RPC client: **`hc<AppType>()`** with **`AppType`** from **`@afenda/api/app`** (after `pnpm --filter @afenda/api run build`), not a deep-relative import into `apps/api/src`.

- **Export name:** `api` (not `apiClient`).
- **Base URL:** `normalizeApiClientBaseUrl(import.meta.env.VITE_API_BASE_URL)`; in the browser, same-origin + dev proxy; fallback **`http://localhost:8787`** when no `window`.

```ts
import { hc } from "hono/client"
import type { AppType } from "@afenda/api/app"

import { normalizeApiClientBaseUrl } from "@/app/_platform/api-client/utils/api-client-utils"

function resolveHcBaseUrl(): string {
  const normalized = normalizeApiClientBaseUrl(
    import.meta.env.VITE_API_BASE_URL
  )
  if (normalized !== "" && /^https?:\/\//i.test(normalized)) {
    return normalized
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    if (normalized.startsWith("/")) {
      return `${window.location.origin}${normalized === "/" ? "" : normalized}`
    }
    return window.location.origin
  }
  return "http://localhost:8787"
}

export const api = hc<AppType>(resolveHcBaseUrl())
```

The shell may also use **`getSharedApiClient()`** / **`useApiClient()`** (`src/app/_platform/api-client/`) for timeouts and non-`hc` requests; **`hc`** remains the source of typed routes.

## `apps/web/src/api-client/users.ts`

Example wrappers live next to the client (not under `features/users/`):

```ts
import { api } from "./client"

export async function fetchUsers() {
  const res = await api.api.users.$get()
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function createUserRequest(input: {
  email: string
  name: string
}) {
  const res = await api.api.users.$post({ json: input })
  if (!res.ok) throw new Error("Failed to create user")
  return res.json()
}
```

`api.api.users` reflects the mounted **`/api/users`** route tree on the Hono app.

## `apps/web/src/App.tsx`

Afenda does **not** render a single demo view from `App`. **`App.tsx`** wires **`RootErrorBoundary`**, **`Suspense`**, and **`RouterProvider`** from **`./router`** (marketing vs `/app` routes, theme providers on branches).

## `apps/web/src/main.tsx`

Bootstraps **`QueryClientProvider`**, **`initI18n()`**, **`StrictMode`**, **`./index.css`**, and **`createRoot`** on `#root` — not the minimal React 18-only snippet below.

**Minimal greenfield** `main.tsx`:

```tsx
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

---

# Runbook

## Install

```bash
pnpm install
```

## Run both apps

```bash
pnpm dev
```

- API: `http://localhost:8787`
- Web: `http://localhost:5173`

## Test endpoints

```bash
curl http://localhost:8787/health
curl http://localhost:8787/api/users
curl -X POST http://localhost:8787/api/users \
  -H "content-type: application/json" \
  -d '{"email":"jane@example.com","name":"Jane Doe"}'
```

---

# Why this pack is AFENDA-style

## 1. Thin HTTP edge

Routes do not own business logic.

## 2. Canonical contract surfaces

`user.schema.ts`, `response.ts`, `errors.ts` are stable contract points.

## 3. Fail-fast configuration

`env.ts` centralizes runtime configuration.

## 4. Monorepo-ready

Root workspace + turbo + shared TS base are already wired.

## 5. Frontend/backend type continuity

`apps/web/src/api-client/client.ts` consumes exported `AppType` from the Hono app.

---

# Next hardening wave

## Immediate

- add shared package for env/constants instead of direct app import
- add auth implementation behind `routes/auth.ts`
- replace in-memory repo with Drizzle repository
- add Vitest route + service tests

## Enterprise wave

- request context storage
- structured logger
- RFC 9457 problem details envelope
- tenant bindings / auth session context
- idempotency / audit trail / doctrine refs

---

# Enterprise upgrade pack

## Updated repository layout

```text
.
├─ package.json
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
├─ turbo.json
├─ .gitignore
├─ apps/
│  ├─ api/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ app.ts
│  │     ├─ lib/
│  │     │  ├─ env.ts
│  │     │  └─ logger.ts
│  │     ├─ middleware/
│  │     │  ├─ error-handler.ts
│  │     │  ├─ request-context.ts
│  │     │  └─ session-context.ts
│  │     ├─ routes/
│  │     │  ├─ auth.ts
│  │     │  ├─ health.ts
│  │     │  └─ users.ts
│  │     └─ modules/
│  │        └─ users/
│  │           ├─ user.repo.ts
│  │           ├─ user.schema.ts
│  │           └─ user.service.ts
│  ├─ web/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  ├─ vite.config.ts
│  │  ├─ index.html
│  │  └─ src/
│  │     ├─ main.tsx
│  │     ├─ App.tsx
│  │     ├─ api/
│  │     │  └─ client.ts
│  │     └─ features/
│  │        └─ users/
│  │           ├─ users.api.ts
│  │           └─ users.view.tsx
│  └─ worker/                       # reserved runtime lane for later if needed
├─ packages/
│  ├─ contracts/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ src/
│  │     ├─ index.ts
│  │     ├─ envelope.ts
│  │     ├─ request-context.ts
│  │     └─ users.ts
│  ├─ api-client/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ src/
│  │     └─ index.ts
│  └─ tooling/
│     ├─ typescript/
│     │  ├─ base.json
│     │  ├─ node.json
│     │  └─ web.json
│     └─ eslint/                    # reserved for later
└─ tests/
   └─ api/                         # reserved vitest lane
```

---

# New shared contracts package

## `packages/contracts/package.json`

```json
{
  "name": "@afenda/contracts",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "zod": "^3.24.3"
  },
  "devDependencies": {
    "typescript": "^5.8.3"
  }
}
```

## `packages/contracts/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src"]
}
```

## `packages/contracts/src/envelope.ts`

```ts
import { z } from "zod"

export const requestIdSchema = z.string().min(1)

export const errorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
    requestId: requestIdSchema.optional(),
  }),
})

export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>

export type SuccessEnvelope<T> = {
  ok: true
  data: T
  meta?: Record<string, unknown>
}

export function success<T>(
  data: T,
  meta?: Record<string, unknown>
): SuccessEnvelope<T> {
  return meta ? { ok: true, data, meta } : { ok: true, data }
}

export function failure(input: {
  code: string
  message: string
  details?: unknown
  requestId?: string
}): ErrorEnvelope {
  return {
    ok: false,
    error: {
      code: input.code,
      message: input.message,
      details: input.details,
      requestId: input.requestId,
    },
  }
}
```

## `packages/contracts/src/request-context.ts`

```ts
import { z } from "zod"

export const tenantIdSchema = z.string().uuid()
export const userIdSchema = z.string().uuid()
export const membershipIdSchema = z.string().uuid()

export const sessionContextSchema = z.object({
  authenticated: z.boolean(),
  userId: userIdSchema.nullable(),
  membershipId: membershipIdSchema.nullable(),
  tenantId: tenantIdSchema.nullable(),
})

export const requestContextSchema = z.object({
  requestId: z.string().min(1),
  path: z.string(),
  method: z.string(),
  session: sessionContextSchema,
})

export type SessionContext = z.infer<typeof sessionContextSchema>
export type RequestContext = z.infer<typeof requestContextSchema>
```

## `packages/contracts/src/users.ts`

```ts
import { z } from "zod"

export const userIdSchema = z.string().uuid()

export const userSchema = z.object({
  id: userIdSchema,
  email: z.string().email(),
  name: z.string().min(1).max(120),
})

export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
})

export type User = z.infer<typeof userSchema>
export type CreateUserInput = z.infer<typeof createUserInputSchema>
```

## `packages/contracts/src/index.ts`

```ts
export * from "./envelope.js"
export * from "./request-context.js"
export * from "./users.js"
```

---

# Shared api client package

## `packages/api-client/package.json`

```json
{
  "name": "@afenda/api-client",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "hono": "^4.7.7"
  },
  "devDependencies": {
    "typescript": "^5.8.3"
  }
}
```

## `packages/api-client/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src"]
}
```

## `packages/api-client/src/index.ts`

```ts
import { hc } from "hono/client"
import type { AppType } from "../../../apps/api/src/app"

export function createApiClient(baseUrl: string) {
  return hc<AppType>(baseUrl, {
    init: {
      credentials: "include",
    },
    headers: {
      "x-request-id": crypto.randomUUID(),
    },
  })
}
```

---

# Tooling package lane

## `packages/tooling/typescript/base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "sourceMap": true,
    "baseUrl": "."
  }
}
```

## `packages/tooling/typescript/node.json`

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM"],
    "types": ["node"]
  }
}
```

## `packages/tooling/typescript/web.json`

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"]
  }
}
```

---

# Updated API app files

## `apps/api/package.json`

```json
{
  "name": "@afenda/api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@afenda/contracts": "workspace:*",
    "@hono/node-server": "^1.14.0",
    "@hono/zod-validator": "^0.5.0",
    "hono": "^4.7.7",
    "zod": "^3.24.3"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "tsx": "^4.19.3",
    "typescript": "^5.8.3"
  }
}
```

## `apps/api/src/lib/logger.ts`

```ts
export type LogLevel = "info" | "warn" | "error"

export function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
) {
  const payload = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  }

  if (level === "error") {
    console.error(JSON.stringify(payload))
    return
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload))
    return
  }

  console.log(JSON.stringify(payload))
}
```

## `apps/api/src/middleware/session-context.ts`

```ts
import type { MiddlewareHandler } from "hono"
import type { SessionContext } from "@afenda/contracts"

export const sessionContextMiddleware: MiddlewareHandler = async (c, next) => {
  const session: SessionContext = {
    authenticated: false,
    userId: null,
    membershipId: null,
    tenantId: null,
  }

  c.set("session", session)
  await next()
}
```

## `apps/api/src/middleware/request-context.ts`

```ts
import type { MiddlewareHandler } from "hono"
import type { RequestContext } from "@afenda/contracts"

export const requestContextMiddleware: MiddlewareHandler = async (c, next) => {
  const requestId = c.req.header("x-request-id")?.trim() || crypto.randomUUID()

  c.header("x-request-id", requestId)
  c.set("requestId", requestId)

  const requestContext: RequestContext = {
    requestId,
    path: c.req.path,
    method: c.req.method,
    session: {
      authenticated: false,
      userId: null,
      membershipId: null,
      tenantId: null,
    },
  }

  c.set("requestContext", requestContext)
  await next()
}
```

## `apps/api/src/lib/errors.ts`

```ts
export type AppErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_SERVER_ERROR"

export class AppError extends Error {
  public readonly code: AppErrorCode
  public readonly status: number
  public readonly details?: unknown

  constructor(input: {
    code: AppErrorCode
    message: string
    status: number
    details?: unknown
  }) {
    super(input.message)
    this.name = "AppError"
    this.code = input.code
    this.status = input.status
    this.details = input.details
  }
}

export function badRequest(message: string, details?: unknown) {
  return new AppError({ code: "BAD_REQUEST", message, status: 400, details })
}

export function notFound(message: string, details?: unknown) {
  return new AppError({ code: "NOT_FOUND", message, status: 404, details })
}

export function conflict(message: string, details?: unknown) {
  return new AppError({ code: "CONFLICT", message, status: 409, details })
}
```

## `apps/api/src/middleware/error-handler.ts`

```ts
import type { Context } from "hono"
import { ZodError } from "zod"
import { failure } from "@afenda/contracts"

import { AppError } from "../lib/errors.js"
import { log } from "../lib/logger.js"

export function onError(error: Error, c: Context) {
  const requestId = c.get("requestId")

  if (error instanceof AppError) {
    return c.json(
      failure({
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
      }),
      error.status
    )
  }

  if (error instanceof ZodError) {
    return c.json(
      failure({
        code: "BAD_REQUEST",
        message: "Request validation failed.",
        details: error.flatten(),
        requestId,
      }),
      400
    )
  }

  log("error", "unhandled api error", {
    requestId,
    path: c.req.path,
    method: c.req.method,
    error: error.message,
  })

  return c.json(
    failure({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
      requestId,
    }),
    500
  )
}

export function onNotFound(c: Context) {
  return c.json(
    failure({
      code: "NOT_FOUND",
      message: `Route not found: ${c.req.method} ${c.req.path}`,
      requestId: c.get("requestId"),
    }),
    404
  )
}
```

## `apps/api/src/modules/users/user.schema.ts`

```ts
export {
  createUserInputSchema,
  userIdSchema,
  userSchema,
  type CreateUserInput,
  type User,
} from "@afenda/contracts"
```

## `apps/api/src/modules/users/user.repo.ts`

```ts
import type { CreateUserInput, User } from "./user.schema.js"

export interface UserRepository {
  findAll(): Promise<User[]>
  findByEmail(email: string): Promise<User | null>
  insert(input: CreateUserInput): Promise<User>
}

class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, User>()

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase()
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) return user
    }
    return null
  }

  async insert(input: CreateUserInput): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
    }

    this.users.set(user.id, user)
    return user
  }
}

export const userRepository: UserRepository = new InMemoryUserRepository()
```

## `apps/api/src/modules/users/user.service.ts`

```ts
import { conflict } from "../../lib/errors.js"
import type { CreateUserInput, User } from "./user.schema.js"
import { userRepository } from "./user.repo.js"

export async function listUsers(): Promise<User[]> {
  return userRepository.findAll()
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const existing = await userRepository.findByEmail(input.email)

  if (existing) {
    throw conflict("A user with this email already exists.", {
      email: input.email,
    })
  }

  return userRepository.insert(input)
}
```

## `apps/api/src/routes/health.ts`

```ts
import { Hono } from "hono"
import { success } from "@afenda/contracts"

export const healthRoutes = new Hono()

healthRoutes.get("/", (c) => {
  return c.json(
    success({
      service: "@afenda/api",
      status: "ok",
      now: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    })
  )
})
```

## `apps/api/src/routes/auth.ts`

```ts
import { Hono } from "hono"
import { success } from "@afenda/contracts"

export const authRoutes = new Hono()

authRoutes.get("/session", (c) => {
  return c.json(success(c.get("session")))
})
```

## `apps/api/src/routes/users.ts`

```ts
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { createUserInputSchema, success } from "@afenda/contracts"

import { createUser, listUsers } from "../modules/users/user.service.js"

export const userRoutes = new Hono()

userRoutes.get("/", async (c) => {
  const users = await listUsers()
  return c.json(success(users))
})

userRoutes.post("/", zValidator("json", createUserInputSchema), async (c) => {
  const input = c.req.valid("json")
  const user = await createUser(input)
  return c.json(success(user), 201)
})
```

## `apps/api/src/app.ts`

```ts
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { secureHeaders } from "hono/secure-headers"
import { bodyLimit } from "hono/body-limit"
import {
  failure,
  type RequestContext,
  type SessionContext,
} from "@afenda/contracts"

import { env } from "./lib/env.js"
import { onError, onNotFound } from "./middleware/error-handler.js"
import { requestContextMiddleware } from "./middleware/request-context.js"
import { sessionContextMiddleware } from "./middleware/session-context.js"
import { authRoutes } from "./routes/auth.js"
import { healthRoutes } from "./routes/health.js"
import { userRoutes } from "./routes/users.js"

export type AppVariables = {
  requestId: string
  session: SessionContext
  requestContext: RequestContext
}

export type ApiEnv = {
  Variables: AppVariables
}

export function createApp() {
  const app = new Hono<ApiEnv>()

  app.onError(onError)
  app.notFound(onNotFound)

  app.use("*", requestContextMiddleware)
  app.use("*", sessionContextMiddleware)
  app.use("*", logger())
  app.use("*", secureHeaders())

  app.use(
    "/api/*",
    cors({
      origin: env.WEB_ORIGIN,
      allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      exposeHeaders: ["X-Request-Id"],
      credentials: true,
      maxAge: 86400,
    })
  )

  app.use(
    "/api/*",
    bodyLimit({
      maxSize: 2 * 1024 * 1024,
      onError: (c) =>
        c.json(
          failure({
            code: "BAD_REQUEST",
            message: "Request body exceeds the configured limit.",
            requestId: c.get("requestId"),
          }),
          413
        ),
    })
  )

  app.get("/", (c) =>
    c.json({
      ok: true,
      data: {
        service: "@afenda/api",
        runtime: "node",
        version: "0.2.0",
      },
    })
  )

  app.route("/health", healthRoutes)
  app.route("/api/auth", authRoutes)
  app.route("/api/users", userRoutes)

  return app
}

export type AppType = ReturnType<typeof createApp>
```

---

# Updated web files

## `apps/web/package.json`

```json
{
  "name": "@afenda/web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.json && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@afenda/api-client": "workspace:*",
    "@afenda/contracts": "workspace:*",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@vitejs/plugin-react": "^4.4.1",
    "typescript": "^5.8.3",
    "vite": "^6.3.5"
  }
}
```

## `apps/web/src/api-client/client.ts`

```ts
import { createApiClient } from "@afenda/api-client"

const API_BASE_URL = "http://localhost:8787"

export const apiClient = createApiClient(API_BASE_URL)
```

## `apps/web/src/features/users/users.api.ts`

```ts
import type { CreateUserInput, SuccessEnvelope, User } from "@afenda/contracts"
import { apiClient } from "../../api-client/client"

export async function fetchUsers(): Promise<SuccessEnvelope<User[]>> {
  const response = await apiClient.api.users.$get()
  if (!response.ok) {
    throw new Error("Failed to fetch users.")
  }
  return response.json()
}

export async function createUser(
  input: CreateUserInput
): Promise<SuccessEnvelope<User>> {
  const response = await apiClient.api.users.$post({ json: input })
  if (!response.ok) {
    throw new Error("Failed to create user.")
  }
  return response.json()
}
```

## `apps/web/src/features/users/users.view.tsx`

```tsx
import { useEffect, useState } from "react"
import type { User } from "@afenda/contracts"
import { createUser, fetchUsers } from "./users.api"

export function UsersView() {
  const [users, setUsers] = useState<User[]>([])
  const [email, setEmail] = useState("jane@example.com")
  const [name, setName] = useState("Jane Doe")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchUsers()
      setUsers(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    setLoading(true)
    setError(null)
    try {
      await createUser({ email, name })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.")
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h2>Users</h2>
      <p>Typed Vite frontend consuming shared contract packages.</p>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={loading}
        >
          Create user
        </button>
      </div>

      {loading ? <p>Loading…</p> : null}
      {error ? <p>{error}</p> : null}

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>{user.name}</strong> — {user.email}
          </li>
        ))}
      </ul>
    </section>
  )
}
```

---

# What changed from the baseline

## Upgraded boundaries

- moved envelopes and user schemas into `@afenda/contracts`
- moved client creation into `@afenda/api-client`
- reduced direct app-to-app source imports in frontend code

## Upgraded backend doctrine

- added `requestContextMiddleware`
- added `sessionContextMiddleware`
- added structured logger helper
- introduced repository interface for later Drizzle swap

## Upgraded frontend doctrine

- frontend now imports `CreateUserInput`, `User`, and `SuccessEnvelope` from contracts package
- client is package-based, not source-tree-coupled at web call sites

---

# Important caveat to fix next

The current `packages/api-client/src/index.ts` still imports `AppType` from `apps/api/src/app` because Hono RPC types originate from the server app type.

That is acceptable for an internal monorepo baseline, but the strict AFENDA-grade next step is:

## Final contract split target

- `packages/api-contract` exports the built Hono app type or contract re-exports
- web imports only from package boundaries
- no package reaches into another app source tree

That is the next correction wave if you want maximum monorepo discipline.

---

# Final AFENDA recommendation

## Keep

- Hono as thin API edge
- Vite as frontend build/runtime tool
- shared contracts package
- repository interfaces before Drizzle replacement
- request/session context even before auth is fully wired

## Next file pack to add after this

- `packages/api-contract`
- `packages/database`
- Vitest route tests
- Better Auth session adapter
- tenant context resolver
- domain module manifests
