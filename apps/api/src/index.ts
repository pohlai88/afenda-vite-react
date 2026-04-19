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
