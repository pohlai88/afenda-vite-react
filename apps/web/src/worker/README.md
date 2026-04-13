# Web Workers (`src/worker`)

Browser **Dedicated Workers** for CPU-heavy or off-main-thread work. This app’s Vite config already sets `worker.format: 'es'` in `vite.config.ts` so worker chunks stay ESM-friendly.

## Vite-aligned patterns (recommended)

**1. `new URL` + `import.meta.url` (preferred)**

Matches web standards and bundles correctly in dev and production. Vite resolves the worker to a separate chunk when `new URL(..., import.meta.url)` appears **directly** inside `new Worker(...)` (see [Vite: Web Workers](https://vite.dev/guide/features#web-workers)).

```ts
import { createAppWorker } from "@/worker"

const w = createAppWorker()
w.addEventListener("message", (e) => console.log(e.data))
w.postMessage({ type: "ping" })
```

**2. `?worker` import (alternative)**

```ts
import AppWorker from "./app-worker?worker"
const w = new AppWorker()
```

Options: `?worker&inline` (base64 inline), `?worker&url` (asset URL). Prefer the `new URL` factory in `create-app-worker.ts` unless you need those modes.

## Typing

- **`types.ts`** — `MainToWorkerMessage` / `WorkerToMainMessage` (structured-clone-safe payloads only).
- **`app-worker.ts`** — `/// <reference lib="webworker" />` so `DedicatedWorkerGlobalScope` and worker globals type-check separately from the DOM bundle.

## React usage

Create the worker once per logical owner (e.g. a hook or store), `terminate()` in `useEffect` cleanup, and subscribe with `addEventListener("message", …)` or wrap in a small async API.

## Tests

Vitest may not implement `Worker` the same as a browser; `__tests__/create-app-worker.test.ts` skips worker construction when `Worker` is missing.
