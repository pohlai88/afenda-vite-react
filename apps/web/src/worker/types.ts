/**
 * Messages **main thread → worker** (`postMessage` from the app).
 * Keep payloads structured-clone-safe (no functions, no DOM nodes).
 */
export type MainToWorkerMessage =
  | { type: "ping" }
  | { type: "echo"; id: string; payload: string }

/**
 * Messages **worker → main** (`postMessage` to the window).
 */
export type WorkerToMainMessage =
  | { type: "ready" }
  | { type: "pong" }
  | { type: "echo"; id: string; payload: string }
