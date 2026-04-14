import { loadMonorepoEnv } from "@afenda/env-loader"

loadMonorepoEnv()

import { createAfendaAuth } from "@afenda/better-auth"
import { closeDbPool, createDbClient, createPgPool } from "@afenda/database"
import { serve } from "@hono/node-server"

import { createApp } from "./app.js"

const pool = createPgPool()
const db = createDbClient(pool)
const auth = createAfendaAuth(pool)
const app = createApp(db, auth)

const port = Number(process.env.PORT) || 3001

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.info(`@afenda/api listening on http://localhost:${info.port}`)
  }
)

async function shutdown(): Promise<void> {
  await closeDbPool(pool)
}

process.on("SIGINT", () => {
  void shutdown().finally(() => process.exit(0))
})
process.on("SIGTERM", () => {
  void shutdown().finally(() => process.exit(0))
})
