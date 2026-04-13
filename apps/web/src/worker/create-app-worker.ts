import type { MainToWorkerMessage } from "./types"

/**
 * Creates a **module** dedicated worker using the pattern Vite recommends:
 * `new Worker(new URL('./file', import.meta.url), { type: 'module' })`.
 *
 * Vite statically analyzes this so the worker is bundled as its own chunk in production.
 */
export function createAppWorker(): Worker {
  return new Worker(new URL("./app-worker.ts", import.meta.url), {
    type: "module",
  })
}

export interface AppWorkerHandle {
  readonly raw: Worker
  postMessage(message: MainToWorkerMessage): void
  terminate(): void
}

/**
 * Thin handle for features: post structured messages and terminate when unmounting.
 */
export function createAppWorkerHandle(): AppWorkerHandle {
  const raw = createAppWorker()
  return {
    raw,
    postMessage: (message) => {
      raw.postMessage(message)
    },
    terminate: () => {
      raw.terminate()
    },
  }
}
