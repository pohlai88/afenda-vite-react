/**
 * Typed Hono RPC client, web contracts, and user-route helpers (`src/api-client`).
 * **Canonical public entry** — prefer `import { … } from "@/api-client"`; avoid deep imports of `./web-*` from feature code.
 *
 * RPC: default **`api`** and **`createApiClient(baseUrl)`** (`hc<AppType>` from `@afenda/api/app`).
 * @module api-client
 * @package @afenda/web
 */
export * from "./web-envelope"
export * from "./web-request-context"
export * from "./web-user"
export * from "./web-client"
export * from "./web-users"
