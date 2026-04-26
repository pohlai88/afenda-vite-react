/**
 * Typed Hono RPC client, web contracts, and user-route helpers (`src/rpc`).
 * **Canonical public entry** — prefer `import { … } from "@/rpc"`; avoid deep imports of `./web-*` from feature code.
 *
 * RPC: default **`api`** and **`createApiClient(baseUrl)`** (`hc<AppType>` from `@afenda/api/app`).
 * @module rpc
 * @package @afenda/web
 */
export * from "./web-envelope.contract"
export * from "./web-request-context.contract"
export * from "./web-user.contract"
export * from "./web-client"
export * from "./web-users"
