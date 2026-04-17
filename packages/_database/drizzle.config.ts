import { loadMonorepoEnvLayered } from "@afenda/env-loader"
import { defineConfig } from "drizzle-kit"

import { DRIZZLE_MIGRATIONS_SCHEMA } from "./src/governance/constants.js"

loadMonorepoEnvLayered()

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    schema: DRIZZLE_MIGRATIONS_SCHEMA,
  },
})
