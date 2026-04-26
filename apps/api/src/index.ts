/**
 * Node runtime entrypoint.
 * - boots the Hono fetch app via node adapter
 * - graceful shutdown included
 */
import { serve } from "@hono/node-server"

import { createApp } from "./app.js"
import { env } from "./api-env.js"
import { apiLogger } from "./api-logger.js"

const app = createApp()

const server = serve({
  fetch: app.fetch,
  port: env.PORT,
})

apiLogger.info({ port: env.PORT }, "api listening")

function shutdown(signal: string) {
  apiLogger.info({ signal }, "shutdown signal received")
  server.close((error) => {
    if (error) {
      apiLogger.error({ signal, error }, "shutdown failure")
      process.exit(1)
    }
    process.exit(0)
  })
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
