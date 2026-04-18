import { loadMonorepoEnvLayered } from "@afenda/env-loader"
import { defineConfig } from "drizzle-kit"

import {
  DRIZZLE_MANAGED_PG_SCHEMAS,
  DRIZZLE_MIGRATIONS_SCHEMA,
} from "./src/schema/pkg-governance/constants.js"

loadMonorepoEnvLayered()

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  /** Log each statement during `drizzle-kit push` / `migrate`. */
  verbose: true,
  /** Require confirmation on `drizzle-kit push` unless `--force` is passed. */
  strict: true,
  /**
   * Only these Postgres namespaces are diffed against `schema/`; extra tables/types/enums here
   * that are not in the Drizzle schema are treated as drift and dropped when you push (with
   * `--force` when non-interactive). Schemas outside this list (e.g. `public` for third-party
   * tables) are not managed by Drizzle Kit — add them here only if they are fully modeled in TS.
   */
  schemaFilter: [...DRIZZLE_MANAGED_PG_SCHEMAS],
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  migrations: {
    schema: DRIZZLE_MIGRATIONS_SCHEMA,
  },
})
