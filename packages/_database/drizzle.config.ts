import { loadMonorepoEnv } from "@afenda/env-loader"
import { defineConfig } from "drizzle-kit"

loadMonorepoEnv()

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    schema: "drizzle",
  },
})
